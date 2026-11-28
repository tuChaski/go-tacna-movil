const { test } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const Module = require("node:module");

// Solo se aísla el driver nativo; HTTP, serialización, validadores y ETA son reales.
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  return name === "@react-native-async-storage/async-storage"
    ? {}
    : originalLoad.call(this, name, ...args);
};
const {
  PassengerCatalogService,
} = require("../.smoke-build/features/passenger/services/catalogService");
const {
  StorageService,
} = require("../.smoke-build/services/storage/storageService");
Module._load = originalLoad;
const { HttpClient } = require("../.smoke-build/services/api/httpClient");
const {
  SocketClient,
} = require("../.smoke-build/services/websocket/socketClient");
const {
  isActiveUnits,
  isEtaRequest,
  isEtaResponse,
} = require("../.smoke-build/types/telemetry");
const {
  distanceMeters,
  toMapCoordinates,
  getVisualHeading,
} = require("../.smoke-build/utils/geo");
const {
  getSignalFreshness,
  canRequestEta,
  formatEtaMinutes,
} = require("../.smoke-build/utils/eta");
const { CATALOG_CACHE_TTL_MS } = require("../.smoke-build/config/constants");

const baseUrl = "https://api.example.test/api/v1";
const micro = {
  microId: 12,
  rutaId: 3,
  lat: -18.0146,
  lng: -70.2536,
  speed: 8.5,
  status: "moviendo",
  lastSeen: 1_000_000,
};
const route = {
  id: 3,
  empresa_id: 1,
  nombre_ruta: "Ruta de prueba",
  activo: true,
  trazado_ruta: {
    type: "LineString",
    coordinates: [
      [-70.2536, -18.0146],
      [-70.254, -18.015],
    ],
  },
};
const reference = { lat: -18.015, lng: -70.254 };

/** Respuesta paginada del contrato; los datos son de prueba, no un backend en vivo. */
function page(data, current = 1, last = 1) {
  return {
    success: true,
    data,
    meta: { current_page: current, last_page: last },
    links: {
      next: current < last ? `${baseUrl}/rutas?page=${current + 1}` : null,
    },
  };
}

/** Driver en memoria que ejecuta la misma serialización/validación del servicio real. */
function storageFixture() {
  const values = new Map();
  const removed = [];
  const storage = new StorageService({
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      removed.push(key);
      values.delete(key);
    },
  });
  return { storage, values, removed };
}

test("catálogo: pagina una vez para consumidores concurrentes y reutiliza caché vigente", async () => {
  const { storage } = storageFixture();
  const requests = [];
  const client = new HttpClient(baseUrl, async (input) => {
    const url = new URL(input);
    requests.push(url.toString());
    const current = Number(url.searchParams.get("page") ?? 1);
    return Response.json(page([{ ...route, id: current }], current, 2));
  });
  const catalog = new PassengerCatalogService(
    baseUrl,
    client,
    storage,
    () => 1_000_000,
  );
  const [first, second] = await Promise.all([catalog.load(), catalog.load()]);
  assert.equal(first.ok, true);
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.data.routes.map((item) => item.id),
    [1, 2],
  );
  assert.equal(first.data.source, "network");
  assert.equal(requests.length, 2);
  assert.equal((await catalog.load()).data.source, "cache");
  assert.equal(requests.length, 2);
});

test("catálogo: persiste solo campos de catálogo, sin relaciones de unidades o ETA", async () => {
  const { storage, values } = storageFixture();
  const expanded = {
    ...route,
    micros: [{ lat: -18, lng: -70 }],
    etaSeconds: 30,
  };
  const catalog = new PassengerCatalogService(
    baseUrl,
    new HttpClient(baseUrl, async () => Response.json(page([expanded]))),
    storage,
  );
  const result = await catalog.load();
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.routes, [route]);
  const saved = [...values.values()][0];
  assert.equal(saved.includes("micros"), false);
  assert.equal(saved.includes("etaSeconds"), false);
});

test("catálogo: caché vencida con fallo de red conserva antigüedad y advierte", async () => {
  const { storage } = storageFixture();
  let now = 1_000_000;
  let online = true;
  const client = new HttpClient(baseUrl, async () => {
    if (!online) throw Error("detalle interno");
    return Response.json(page([route]));
  });
  const catalog = new PassengerCatalogService(
    baseUrl,
    client,
    storage,
    () => now,
  );
  const first = await catalog.load();
  now += CATALOG_CACHE_TTL_MS;
  online = false;
  const fallback = await catalog.load();
  assert.equal(fallback.ok, true);
  assert.equal(fallback.data.source, "cache");
  assert.equal(fallback.data.stale, true);
  assert.equal(fallback.data.fetchedAt, first.data.fetchedAt);
  assert.equal(fallback.data.warning.code, "NETWORK");
  assert.equal(JSON.stringify(fallback).includes("detalle interno"), false);
});

test("catálogo: fuerza revalidación e invalida caché corrupta, futura o de otro esquema", async () => {
  const { storage, values, removed } = storageFixture();
  let requests = 0;
  const catalog = new PassengerCatalogService(
    baseUrl,
    new HttpClient(baseUrl, async () => {
      requests++;
      return Response.json(page([route]));
    }),
    storage,
    () => 1_000_000,
  );
  await catalog.load();
  await catalog.load({ refresh: true });
  assert.equal(requests, 2);
  const key = [...values.keys()][0];
  for (const corrupt of [
    "{",
    JSON.stringify({ version: 99 }),
    JSON.stringify({
      version: 1,
      apiBaseUrl: baseUrl,
      fetchedAt: 2_000_000,
      routes: [route],
    }),
  ]) {
    values.set(key, corrupt);
    assert.equal((await catalog.load()).data.source, "network");
  }
  assert.equal(removed.length, 3);
});

test("catálogo: aísla orígenes de API y normaliza la barra final", async () => {
  const { storage } = storageFixture();
  let requests = 0;
  for (const origin of [baseUrl, "https://other.example.test/api/v1"]) {
    const catalog = new PassengerCatalogService(
      origin,
      new HttpClient(origin, async () => {
        requests++;
        return Response.json(page([route]));
      }),
      storage,
    );
    assert.equal((await catalog.load()).data.source, "network");
  }
  const cached = new PassengerCatalogService(
    `${baseUrl}/`,
    new HttpClient(baseUrl, async () => {
      throw Error("No debe consultar");
    }),
    storage,
  );
  assert.equal((await cached.load()).data.source, "cache");
  assert.equal(requests, 2);
});

test("catálogo: nunca sigue un host de next ni escribe una colección parcial", async () => {
  const { storage, values } = storageFixture();
  const requests = [];
  const catalog = new PassengerCatalogService(
    baseUrl,
    new HttpClient(baseUrl, async (input) => {
      const url = new URL(input);
      requests.push(url);
      if (url.searchParams.get("page") === "2")
        return new Response(null, { status: 503 });
      return Response.json({
        ...page([route], 1, 2),
        links: { next: "https://untrusted.invalid/rutas?page=2" },
      });
    }),
    storage,
  );
  assert.equal((await catalog.load()).error.code, "HTTP");
  assert.equal(requests.length, 2);
  assert(requests.every((url) => url.origin === "https://api.example.test"));
  assert.equal(values.size, 0);
});

test("catálogo: rechaza ciclos y páginas contradictorias", async () => {
  for (const payload of [
    { ...page([route], 1, 2), links: { next: `${baseUrl}/rutas?page=1` } },
    page([route], 2, 2),
    { ...page([route]), success: false },
  ]) {
    const { storage, values } = storageFixture();
    const catalog = new PassengerCatalogService(
      baseUrl,
      new HttpClient(baseUrl, async () => Response.json(payload)),
      storage,
    );
    assert.equal((await catalog.load()).error.code, "CONTRACT");
    assert.equal(values.size, 0);
  }
});

test("catálogo: un fallo de almacenamiento no pierde la respuesta válida de red", async () => {
  const fail = async () => {
    throw Error("driver");
  };
  const storage = new StorageService({
    getItem: fail,
    setItem: fail,
    removeItem: fail,
  });
  const catalog = new PassengerCatalogService(
    baseUrl,
    new HttpClient(baseUrl, async () => Response.json(page([route]))),
    storage,
  );
  const result = await catalog.load();
  assert.equal(result.ok, true);
  assert.equal(result.data.source, "network");
  assert.equal(result.data.warning.code, "STORAGE");
});

/** Transporte aislado que reproduce el callback error-first observado en backend. */
function socketFixture(responder) {
  const events = new EventEmitter();
  const sent = [];
  const socket = {
    connected: false,
    active: false,
    io: new EventEmitter(),
    on(event, listener) {
      events.on(event, listener);
      return this;
    },
    off(event, listener) {
      events.off(event, listener);
      return this;
    },
    emit(event, payload, ack) {
      sent.push({ event, payload, ack });
      responder?.(ack, payload);
      return this;
    },
    connect() {
      this.active = true;
      return this;
    },
    disconnect() {
      this.connected = false;
      this.active = false;
      events.emit("disconnect");
      return this;
    },
  };
  const client = new SocketClient("https://socket.example.test", () => socket);
  client.connect();
  const open = () => {
    socket.connected = true;
    socket.active = true;
    events.emit("connect");
  };
  open();
  return { client, socket, sent, open, events };
}

test("seguimiento por sala, orden de eventos, reconexión y liberación", () => {
  const {
    createPassengerFleet,
  } = require("../.smoke-build/store/passengerFleet.js");
  const { client, sent, events, open, socket } = socketFixture();
  const fleet = createPassengerFleet(2, client);
  const unit = {
    microId: 7,
    rutaId: 2,
    lat: -18,
    lng: -70,
    speed: 4,
    status: "moviendo",
    lastSeen: 1000,
  };
  const release = fleet.start();
  const read = fleet.store.getState;
  try {
    events.emit("micro:position", unit);
    assert.equal(read().phase, "waiting");
    assert.deepEqual(read().units, {});
    events.emit("route:joined", { rutaId: 2, micros: [] });
    assert.equal(read().phase, "ready");
    events.emit("micro:position", unit);
    events.emit("micro:position", { ...unit, rutaId: 3, lastSeen: 2000 });
    events.emit("micro:position", { ...unit, lastSeen: 999 });
    assert.equal(read().units[7].lastSeen, 1000);
    events.emit("micro:stopped", { microId: 7 });
    assert.equal(read().units[7].status, "detenido");
    events.emit("micro:offline", { microId: 7, lastSeen: 900 });
    assert.equal(read().units[7].status, "detenido");
    events.emit("micro:offline", { microId: 7, lastSeen: 1000 });
    assert.equal(read().units[7].status, "desconectado");
    socket.disconnect();
    assert.equal(read().phase, "offline");
    open();
    assert.deepEqual(read().units, {});
    events.emit("route:joined", { rutaId: 2, micros: [unit] });
    assert.equal(read().units[7].status, "moviendo");
  } finally {
    release();
  }
  assert.equal(sent.at(-1).event, "route:leave");
  events.emit("micro:position", { ...unit, lastSeen: 3000 });
  assert.equal(read().units[7].lastSeen, 1000);
});

test("ETA: payload y confirmación del servidor se validan sin cambiar el contrato", async () => {
  const { client, sent } = socketFixture((ack, payload) =>
    ack(null, { microId: payload.microId, etaSeconds: 180, estimated: true }),
  );
  const result = await client.requestEta({ microId: 12, ...reference });
  assert.deepEqual(result, {
    ok: true,
    data: { microId: 12, etaSeconds: 180, estimated: true },
  });
  assert.equal(sent[0].event, "eta:request");
  assert.deepEqual(sent[0].payload, { microId: 12, ...reference });
  assert.equal(isEtaRequest({ microId: 12, ...reference, heading: 90 }), false);
  assert.equal(
    isEtaResponse({ microId: 12, etaSeconds: -1, estimated: true }),
    false,
  );
  client.disconnect();
});

test("ETA: captura la referencia original aunque el consumidor reutilice su objeto", async () => {
  const { client, sent } = socketFixture();
  const request = { microId: 12, ...reference };
  const pending = client.requestEta(request);
  request.microId = 99;
  assert.equal(sent[0].payload.microId, 12);
  sent[0].ack(null, { microId: 12, etaSeconds: 180, estimated: true });
  assert.equal((await pending).data.microId, 12);
  client.disconnect();
});

test("ETA: un error al emitir se convierte en fallo de red sin dejar la consulta pendiente", async () => {
  const { client } = socketFixture(() => {
    throw Error("transporte interno");
  });
  const result = await client.requestEta({ microId: 12, ...reference });
  assert.equal(result.error.code, "NETWORK");
  assert.equal(JSON.stringify(result).includes("interno"), false);
  client.disconnect();
});

test("ETA: no envía entrada inválida ni mensajes sin conexión", async () => {
  const { client, sent } = socketFixture();
  assert.equal(
    (await client.requestEta({ microId: 0, ...reference })).error.code,
    "CONTRACT",
  );
  assert.equal(
    (await client.requestEta({ microId: 12, lat: NaN, lng: 0 })).error.code,
    "CONTRACT",
  );
  assert.equal(
    (await client.requestEta({ microId: 12, ...reference }, { timeoutMs: -1 }))
      .error.code,
    "CONFIGURATION",
  );
  client.disconnect();
  assert.equal(
    (await client.requestEta({ microId: 12, ...reference })).error.code,
    "DISCONNECTED",
  );
  assert.equal(sent.length, 0);
});

test("ETA: separa error remoto de respuesta inválida y oculta detalles internos", async () => {
  for (const [reply, code] of [
    [[{ error: "secreto del servidor" }], "REMOTE"],
    [[null, { microId: 99, etaSeconds: 10, estimated: true }], "CONTRACT"],
    [
      [null, { microId: 12, etaSeconds: Infinity, estimated: true }],
      "CONTRACT",
    ],
    [[null, { microId: 12, etaSeconds: 10, estimated: false }], "CONTRACT"],
  ]) {
    const { client } = socketFixture((ack) => ack(...reply));
    const result = await client.requestEta({ microId: 12, ...reference });
    assert.equal(result.error.code, code);
    assert.equal(JSON.stringify(result).includes("secreto"), false);
    client.disconnect();
  }
});

test("ETA: aborto y timeout resuelven controladamente e ignoran confirmaciones tardías", async () => {
  const { client, sent } = socketFixture();
  const controller = new AbortController();
  const cancelled = client.requestEta(
    { microId: 12, ...reference },
    { signal: controller.signal },
  );
  controller.abort();
  assert.equal((await cancelled).error.code, "CANCELLED");
  sent[0].ack(null, { microId: 12, etaSeconds: 1, estimated: true });
  const result = await client.requestEta(
    { microId: 12, ...reference },
    { timeoutMs: 10 },
  );
  assert.equal(result.error.code, "TIMEOUT");
  sent[1].ack(null, { microId: 12, etaSeconds: 1, estimated: true });
  const already = new AbortController();
  already.abort();
  assert.equal(
    (
      await client.requestEta(
        { microId: 12, ...reference },
        { signal: already.signal },
      )
    ).error.code,
    "CANCELLED",
  );
  assert.equal(sent.length, 2);
  client.disconnect();
});

test("ETA: desconectar invalida consultas de la sesión anterior sin contaminar la nueva", async () => {
  const { client, sent, open } = socketFixture();
  const previous = client.requestEta({ microId: 12, ...reference });
  client.disconnect();
  assert.equal((await previous).error.code, "DISCONNECTED");
  open();
  const current = client.requestEta({ microId: 12, ...reference });
  sent[0].ack(null, { microId: 12, etaSeconds: 1, estimated: true });
  sent[1].ack(null, { microId: 12, etaSeconds: 180, estimated: true });
  assert.equal((await current).data.etaSeconds, 180);
  client.disconnect();
});

test("Geo: respeta [lng,lat], no modifica geometría y tolera trazados ausentes", () => {
  const before = structuredClone(route.trazado_ruta);
  assert.deepEqual(toMapCoordinates(route.trazado_ruta)[0], {
    latitude: -18.0146,
    longitude: -70.2536,
  });
  assert.deepEqual(route.trazado_ruta, before);
  assert.deepEqual(toMapCoordinates(null), []);
  assert.deepEqual(
    toMapCoordinates({
      type: "LineString",
      coordinates: [
        [0, 91],
        [1, 92],
      ],
    }),
    [],
  );
  assert.equal(distanceMeters(reference, reference), 0);
  assert.equal(distanceMeters({ lat: 91, lng: 0 }, reference), undefined);
  const crossing = distanceMeters(
    { lat: 0, lng: 179.9 },
    { lat: 0, lng: -179.9 },
  );
  assert(crossing > 22_000 && crossing < 22_300);
  assert(
    Number.isFinite(distanceMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })),
  );
});

test("Geo: deriva rumbo solo con igual unidad/ruta, tiempo creciente y movimiento suficiente", () => {
  const previous = { ...micro, lat: 0, lng: 0 };
  const current = {
    ...previous,
    lng: 0.001,
    lastSeen: previous.lastSeen + 5000,
  };
  assert(Math.abs(getVisualHeading(previous, current) - 90) < 0.001);
  assert.equal(
    getVisualHeading(previous, { ...current, microId: 99 }),
    undefined,
  );
  assert.equal(
    getVisualHeading(previous, { ...current, rutaId: 99 }),
    undefined,
  );
  assert.equal(
    getVisualHeading(previous, { ...current, lastSeen: previous.lastSeen }),
    undefined,
  );
  assert.equal(
    getVisualHeading(previous, { ...current, lng: 0.000001 }),
    undefined,
  );
  assert.equal(getVisualHeading(undefined, current), undefined);
});

test("Señal y ETA: 60s no equivale a offline, fecha futura y reposo no permiten llegada", () => {
  assert.equal(
    getSignalFreshness(micro.lastSeen, micro.lastSeen + 60_000),
    "recent",
  );
  assert.equal(
    getSignalFreshness(micro.lastSeen, micro.lastSeen + 60_001),
    "stale",
  );
  assert.equal(
    getSignalFreshness(micro.lastSeen + 1, micro.lastSeen),
    "unverified",
  );
  assert.equal(canRequestEta(micro, reference, true, micro.lastSeen), true);
  assert.equal(canRequestEta(micro, undefined, true, micro.lastSeen), false);
  assert.equal(canRequestEta(micro, reference, false, micro.lastSeen), false);
  assert.equal(
    canRequestEta({ ...micro, speed: 0 }, reference, true, micro.lastSeen),
    false,
  );
  assert.equal(
    canRequestEta(
      { ...micro, status: "detenido" },
      reference,
      true,
      micro.lastSeen,
    ),
    false,
  );
  assert.equal(
    canRequestEta(micro, reference, true, micro.lastSeen + 60_001),
    false,
  );
  assert.equal(formatEtaMinutes(0), "Menos de 1 min");
  assert.equal(formatEtaMinutes(61), "2 min");
  assert.equal(formatEtaMinutes(-1), "No disponible");
});

test("Contrato: acepta el DTO público y rechaza la lista antigua con speedSamples", () => {
  assert.equal(isActiveUnits({ rutaId: 3, micros: [micro] }), true);
  assert.equal(
    isActiveUnits({ rutaId: 3, micros: [{ ...micro, speedSamples: [8.5] }] }),
    false,
  );
});
