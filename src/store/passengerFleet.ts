import { createStore } from "zustand/vanilla";
import type { MicroPosition } from "../types/telemetry";
import { getVisualHeading } from "../utils/geo";
import { socketClient } from "../services/websocket/socketClient";
import { SOCKET_TIMEOUT_MS } from "../config/constants";

export type PassengerUnit = MicroPosition & { heading?: number };
interface Fleet {
  phase: "waiting" | "ready" | "offline" | "error";
  units: Record<number, PassengerUnit>;
  message?: string;
}

/** Cada selección tiene su propia generación. Al salir se liberan la sala,
 * el temporizador y todos los observadores sin cerrar la conexión compartida. */
export function createPassengerFleet(routeId: number, client = socketClient) {
  const store = createStore<Fleet>(() => ({ phase: "waiting", units: {} }));
  function start() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function reset(phase: Fleet["phase"], message?: string) {
      clearTimeout(timer);
      store.setState({ phase, units: {}, message });
      if (phase === "waiting")
        timer = setTimeout(
          () => reset("error", "La línea no confirmó su lista de micros."),
          SOCKET_TIMEOUT_MS,
        );
    }
    reset("waiting");
    const cleanups = [
      client.onState((state) =>
        reset(
          state === "connected" || state === "connecting"
            ? "waiting"
            : "offline",
        ),
      ),
      client.onError((error) =>
        reset(
          error.code === "NETWORK" || error.code === "TIMEOUT"
            ? "offline"
            : "error",
          error.message,
        ),
      ),
      client.on("error", () =>
        reset("error", "El servicio no pudo atender la consulta."),
      ),
      client.on("route:joined", (snapshot) => {
        if (snapshot.rutaId !== routeId || client.state !== "connected") return;
        clearTimeout(timer);
        store.setState({
          phase: "ready",
          message: undefined,
          units: Object.fromEntries(
            snapshot.micros.map((unit) => [unit.microId, unit]),
          ),
        });
      }),
      client.on("micro:position", (unit) => {
        const { phase, units } = store.getState();
        const previous = units[unit.microId];
        if (
          phase !== "ready" ||
          unit.rutaId !== routeId ||
          (previous && previous.lastSeen >= unit.lastSeen)
        )
          return;
        store.setState({
          units: {
            ...units,
            [unit.microId]: {
              ...unit,
              heading: getVisualHeading(previous, unit) ?? previous?.heading,
            },
          },
        });
      }),
      client.on("micro:stopped", ({ microId }) =>
        changeStatus(microId, "detenido"),
      ),
      client.on("micro:offline", ({ microId, lastSeen }) =>
        changeStatus(microId, "desconectado", lastSeen),
      ),
    ];
    /** Los eventos sin ruta solo afectan a micros conocidos en la instantánea actual. */
    function changeStatus(
      id: number,
      status: MicroPosition["status"],
      lastSeen?: number,
    ) {
      const { units } = store.getState();
      const unit = units[id];
      if (!unit || (lastSeen !== undefined && unit.lastSeen !== lastSeen))
        return;
      store.setState({ units: { ...units, [id]: { ...unit, status } } });
    }
    const joined = client.subscribe(routeId);
    if (joined.ok) {
      cleanups.push(joined.data);
      const result = client.connect();
      if (!result.ok) reset("error", result.error.message);
    } else reset("error", joined.error.message);
    return () => {
      clearTimeout(timer);
      cleanups.forEach((clean) => clean());
    };
  }
  return { store, start };
}
