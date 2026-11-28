const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { EventEmitter } = require("node:events");
const { HttpClient } = require("../.smoke-build/services/api/httpClient");
const {
  SocketClient,
} = require("../.smoke-build/services/websocket/socketClient");
const {
  validateUrl,
  getConfigurationErrors,
} = require("../.smoke-build/config/env");
const {
  isRoutePage,
  isGeoJsonLineString,
} = require("../.smoke-build/types/geo");
const {
  isLocationEmission,
  isMicroPosition,
  isActiveUnits,
} = require("../.smoke-build/types/telemetry");

// Stub only the native driver; StorageService still runs serialization and validation.
const Module = require("node:module");
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  return name === "@react-native-async-storage/async-storage"
    ? {}
    : originalLoad.call(this, name, ...args);
};
const {
  StorageService,
} = require("../.smoke-build/services/storage/storageService");
// El catálogo reutiliza ahora StorageService: cargarlo con el mismo driver aislado.
const {
  getRoutes,
} = require("../.smoke-build/features/passenger/services/catalogService");
Module._load = originalLoad;

// Fixtures from docs/contratos/openapi.yaml and payload-gps.md; no backend is implied.
const micro = {
  microId: 12,
  rutaId: 3,
  lat: -18.0146,
  lng: -70.2536,
  speed: 8.5,
  status: "moviendo",
  lastSeen: 1700000000000,
};
const geometry = {
  type: "LineString",
  coordinates: [
    [-70.2536, -18.0146],
    [-70.254, -18.015],
  ],
};
const routes = {
  success: true,
  data: [
    {
      id: 3,
      empresa_id: 1,
      nombre_ruta: "Ruta de prueba",
      activo: true,
      trazado_ruta: geometry,
    },
  ],
  links: {
    first: "http://localhost:8001/api/v1/rutas?page=1",
    last: null,
    prev: null,
    next: null,
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [{ url: null, label: "Anterior", active: false }],
    path: "http://localhost:8001/api/v1/rutas",
    per_page: 15,
    to: 1,
    total: 1,
  },
};
const isString = (value) => typeof value === "string";
const errorCode = (result, code) => {
  assert.equal(result.ok, false);
  assert.equal(result.error.code, code);
};

test("configuración ausente, URLs inválidas y secretos se controlan sin revelar valores", () => {
  assert.equal(getConfigurationErrors({}).length, 2);
  for (const value of [
    undefined,
    "invalid",
    "ftp://example.test",
    "https://user:secret@example.test",
    "https://example.test/#secret",
  ]) {
    const result = validateUrl(value, ["http:", "https:"]);
    errorCode(result, "CONFIGURATION");
    assert.equal(result.error.message.includes("secret"), false);
  }
  assert.equal(
    getConfigurationErrors({
      apiBaseUrl: "http://localhost:8001/api/v1",
      wsUrl: "http://localhost:8001",
    }).length,
    0,
  );
  assert.equal(
    getConfigurationErrors({
      apiBaseUrl: "http://localhost:8001/api/v1",
      wsUrl: "ws://localhost:8001",
    }).length,
    1,
  );
});

test("catálogo y GeoJSON: paginación oficial, campos snake_case y orden [lng, lat]", () => {
  assert.equal(isRoutePage(routes), true);
  assert.equal(
    isRoutePage({ ...routes, data: [{ id: "3", name: "draft" }] }),
    false,
  );
  assert.equal(isRoutePage({ ...routes, meta: { total: "1" } }), false);
  assert.equal(isRoutePage({ ...routes, links: { next: 123 } }), false);
  assert.equal(
    isGeoJsonLineString({
      ...geometry,
      coordinates: [
        [0, 95],
        [0, 90],
      ],
    }),
    false,
  );
  assert.equal(
    isGeoJsonLineString({ ...geometry, coordinates: [[-70, -18]] }),
    false,
  );
});

test("telemetría: schemas estrictos, rangos, timestamp ms y estado oficial", () => {
  assert.equal(isMicroPosition(micro), true);
  assert.equal(
    isLocationEmission({ lat: micro.lat, lng: micro.lng, speed: 0 }),
    true,
  );
  assert.equal(
    isLocationEmission({
      lat: micro.lat,
      lng: micro.lng,
      speed: 0,
      unitId: 12,
    }),
    false,
  );
  assert.equal(isActiveUnits({ rutaId: 3, micros: [micro] }), true);
  assert.equal(isActiveUnits({ rutaId: 4, micros: [micro] }), false);
  for (const change of [
    { microId: 0 },
    { rutaId: 1.5 },
    { speed: -1 },
    { heading: 0 },
    { lat: 91 },
    { lastSeen: "now" },
    { status: "moving" },
    { lng: NaN },
  ]) {
    assert.equal(isMicroPosition({ ...micro, ...change }), false);
  }
});

test("HTTP: GET /api/v1/rutas y parseo del contrato contra servidor fixture local", async (t) => {
  const requests = [];
  const server = createServer((req, res) => {
    requests.push(req.url);
    if (req.url === "/api/v1/failure") {
      res.writeHead(503);
      res.end("secret");
      return;
    }
    if (req.url === "/api/v1/bad-json") {
      res.end("{");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(routes));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const client = new HttpClient(
    `http://127.0.0.1:${server.address().port}/api/v1`,
  );
  const seen = [];
  const remove = client.addRequestInterceptor((request) => {
    seen.push(request.path);
    return request;
  });
  const result = await getRoutes(client);
  assert.deepEqual(result, {
    ok: true,
    data: { data: routes, statusCode: 200 },
  });
  assert.equal(requests[0], "/api/v1/rutas");
  remove();
  errorCode(await client.request({ path: "rutas" }, isString), "CONTRACT");
  const undo = client.addResponseInterceptor((response) => ({
    ...response,
    data: "mapped",
  }));
  assert.equal(
    (await client.request({ path: "rutas" }, isString)).data.data,
    "mapped",
  );
  undo();
  errorCode(await client.request({ path: "bad-json" }, isString), "PARSE");
  const failed = await client.request({ path: "failure" }, isString);
  errorCode(failed, "HTTP");
  assert.equal(failed.error.statusCode, 503);
  assert.equal(JSON.stringify(failed).includes("secret"), false);
  assert.deepEqual(seen, ["rutas"]);
});

test("HTTP: URL inválida, escape de base, red, timeout de petición/cuerpo e interceptores", async () => {
  const client = new HttpClient("https://example.test/api", async () => {
    throw Error("secret");
  });
  errorCode(
    await new HttpClient().request({ path: "rutas" }, isString),
    "CONFIGURATION",
  );
  for (const path of [
    "https://other.test",
    "//other.test",
    "../escape",
    "/%2e%2e/escape",
  ])
    errorCode(await client.request({ path }, isString), "CONFIGURATION");
  errorCode(await client.request({ path: "rutas" }, isString), "NETWORK");
  errorCode(
    await client.request({ path: "rutas", timeoutMs: -1 }, isString),
    "CONFIGURATION",
  );
  const hanging = new HttpClient(
    "https://example.test",
    () => new Promise(() => {}),
  );
  errorCode(
    await hanging.request({ path: "rutas", timeoutMs: 10 }, isString),
    "TIMEOUT",
  );
  const hangingBody = new HttpClient("https://example.test", async () => ({
    ok: true,
    status: 200,
    json: () => new Promise(() => {}),
  }));
  errorCode(
    await hangingBody.request({ path: "rutas", timeoutMs: 10 }, isString),
    "TIMEOUT",
  );
  client.addRequestInterceptor(() => {
    throw Error("secret");
  });
  errorCode(await client.request({ path: "rutas" }, isString), "NETWORK");
});

function socketFixture() {
  const events = new EventEmitter();
  const manager = new EventEmitter();
  const sent = [];
  const created = [];
  const socket = {
    active: false,
    connected: false,
    io: manager,
    on: (event, listener) => {
      events.on(event, listener);
      return socket;
    },
    off: (event, listener) => {
      events.off(event, listener);
      return socket;
    },
    emit: (event, payload) => {
      sent.push([event, payload]);
      return socket;
    },
    connect() {
      this.active = true;
      return this;
    },
    disconnect() {
      this.active = false;
      this.connected = false;
      events.emit("disconnect");
      return this;
    },
  };
  const client = new SocketClient("http://localhost:8001", (url, options) => {
    created.push({ url, options });
    return socket;
  });
  const open = () => {
    socket.connected = true;
    socket.active = true;
    events.emit("connect");
  };
  return { client, socket, events, manager, sent, created, open };
}

test("Socket.IO: URL inválida o namespace accidental no crea conexiones", () => {
  for (const url of [
    undefined,
    "invalid",
    "ws://localhost:8001",
    "http://localhost:8001/api/v1",
  ])
    errorCode(new SocketClient(url).connect(), "CONFIGURATION");
});

test("Socket.IO: conexión única, contrato de rooms, validación de eventos y limpieza compartida", () => {
  const { client, events, created, sent, open } = socketFixture();
  const errors = [];
  client.onError((error) => errors.push(error.code));
  const values = [];
  const remove = client.on("micro:position", (value) => values.push(value));
  const snapshots = [];
  client.on("route:joined", (value) => snapshots.push(value));
  const first = client.subscribe(3);
  const second = client.subscribe(3);
  client.connect();
  client.connect();
  assert.equal(created.length, 1);
  open();
  assert.deepEqual(sent, [["route:join", 3]]);
  events.emit("route:joined", { rutaId: 3, micros: [micro] });
  events.emit("micro:position", micro);
  events.emit("micro:position", { ...micro, speed: -1 });
  events.emit("micro:position", { ...micro, rutaId: 99 });
  assert.deepEqual(values, [micro]);
  assert.equal(snapshots.length, 1);
  assert.deepEqual(errors, ["CONTRACT"]);
  first.data();
  first.data();
  assert.equal(sent.length, 1);
  second.data();
  assert.deepEqual(sent.at(-1), ["route:leave", 3]);
  remove();
  client.disconnect();
  client.disconnect();
  errorCode(client.emit("route:join", 3), "DISCONNECTED");
  errorCode(client.emit("route:join", -1), "CONTRACT");
  errorCode(client.emit("made-up", 3), "CONTRACT");
});

test("Socket.IO: reconexión limitada y restauración de salas sin reenvío de colas", () => {
  const { client, socket, events, manager, sent, created, open } =
    socketFixture();
  client.subscribe(3);
  client.connect();
  open();
  const options = created[0].options;
  assert.equal(options.autoConnect, false);
  assert.equal(options.path, "/socket.io");
  assert.equal(options.reconnectionAttempts, 5);
  assert.equal(options.reconnectionDelay, 1000);
  assert.equal(options.reconnectionDelayMax, 30000);
  assert.equal(options.timeout, 10000);
  assert.deepEqual(options.transports, ["polling", "websocket"]);
  socket.connected = false;
  events.emit("disconnect");
  manager.emit("reconnect_attempt", 1);
  assert.equal(client.state, "reconnecting");
  errorCode(client.emit("route:leave", 3), "DISCONNECTED");
  assert.equal(sent.length, 1);
  client.connect();
  open();
  assert.equal(created.length, 1);
  assert.deepEqual(sent.at(-1), ["route:join", 3]);
  socket.active = false;
  socket.connected = false;
  manager.emit("reconnect_failed");
  assert.equal(client.state, "disconnected");
  client.connect();
  assert.equal(socket.active, true);
  client.disconnect();
  assert.equal(socket.active, false);
});

test("Socket.IO: timeout, caída, errores de consumidor y fallos de transporte no escapan", () => {
  const { client, socket, events, open } = socketFixture();
  const errors = [];
  client.onError(() => {
    throw Error("observer");
  });
  client.onError((error) => errors.push(error.code));
  client.subscribe(3);
  client.connect();
  events.emit("connect_error", Error("timeout"));
  events.emit("connect_error", Error("secret"));
  open();
  client.on("micro:position", () => {
    throw Error("consumer");
  });
  events.emit("micro:position", micro);
  socket.emit = () => {
    throw Error("secret");
  };
  errorCode(client.emit("route:join", 3), "NETWORK");
  assert.deepEqual(errors, ["TIMEOUT", "NETWORK", "UNKNOWN"]);
  client.disconnect();
  const broken = new SocketClient("http://localhost:8001", () => {
    throw Error("secret");
  });
  errorCode(broken.connect(), "NETWORK");
});

test("Storage: lectura validada, borrado, corrupción y fallos del driver", async () => {
  const data = new Map();
  const storage = new StorageService({
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
  });
  assert.deepEqual(await storage.read("fixture", isString), {
    ok: true,
    data: null,
  });
  assert.equal((await storage.write("fixture", "test")).ok, true);
  assert.deepEqual(await storage.read("fixture", isString), {
    ok: true,
    data: "test",
  });
  assert.equal((await storage.remove("fixture")).ok, true);
  data.set("chasqui:fixture", "{");
  errorCode(await storage.read("fixture", isString), "STORAGE");
  data.set("chasqui:fixture", "42");
  errorCode(await storage.read("fixture", isString), "STORAGE");
  errorCode(await storage.write("fixture", undefined), "STORAGE");
  errorCode(await storage.write("fixture", 1n), "STORAGE");
  const fail = async () => {
    throw Error("secret");
  };
  const broken = new StorageService({
    getItem: fail,
    setItem: fail,
    removeItem: fail,
  });
  errorCode(await broken.read("fixture", isString), "STORAGE");
  errorCode(await broken.write("fixture", "test"), "STORAGE");
  errorCode(await broken.remove("fixture"), "STORAGE");
});
