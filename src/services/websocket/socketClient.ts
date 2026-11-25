import {
  io,
  type ManagerOptions,
  type Socket,
  type SocketOptions,
} from "socket.io-client";
import { env, validateUrl } from "../../config/env";
import {
  RECONNECT_BASE_MS,
  RECONNECT_MAX_MS,
  RECONNECT_MAX_ATTEMPTS,
  SOCKET_TIMEOUT_MS,
} from "../../config/constants";
import { failure, type AppError, type Result } from "../../types/api";
import {
  serverEventValidators,
  type ClientEventPayloads,
  type ServerEventPayloads,
} from "../../types/telemetry";
import { isPositiveInteger, isRecord } from "../../utils/validation";

export type SocketTransport = Pick<
  Socket,
  | "connected"
  | "active"
  | "on"
  | "off"
  | "emit"
  | "connect"
  | "disconnect"
  | "io"
>;
type SocketFactory = (
  url: string,
  options: Partial<ManagerOptions & SocketOptions>,
) => SocketTransport;
export type SocketState =
  "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
type ServerEvent = keyof ServerEventPayloads;

/** One production instance below. Socket.IO owns the bounded reconnect loop. */
export class SocketClient {
  private socket?: SocketTransport;
  private currentState: SocketState = "idle";
  private routes = new Map<number, number>();
  private listeners = new Map<ServerEvent, Set<(payload: unknown) => void>>();
  private errorListeners = new Set<(error: AppError) => void>();

  constructor(
    private readonly url: string | undefined,
    private readonly createTransport: SocketFactory = io,
  ) {}

  get state(): SocketState {
    return this.currentState;
  }

  onError(listener: (error: AppError) => void) {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  private report(error: AppError) {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch {
        /* Observers must not crash the client. */
      }
    }
  }

  connect(): Result<void> {
    const url = validateUrl(this.url, ["http:", "https:"]);
    if (!url.ok) return url;
    const endpoint = new URL(url.data);
    if (endpoint.pathname !== "/" || endpoint.search)
      return failure(
        "CONFIGURATION",
        "WS_URL debe indicar el origen del servidor Socket.IO, sin ruta ni parámetros.",
      );
    try {
      if (!this.socket) {
        const socket = this.createTransport(url.data, {
          autoConnect: false,
          forceNew: true,
          path: "/socket.io",
          transports: ["polling", "websocket"],
          reconnection: true,
          reconnectionAttempts: RECONNECT_MAX_ATTEMPTS,
          reconnectionDelay: RECONNECT_BASE_MS,
          reconnectionDelayMax: RECONNECT_MAX_MS,
          randomizationFactor: 0.5,
          timeout: SOCKET_TIMEOUT_MS,
        });
        this.socket = socket;
        socket.on("connect", () => {
          this.currentState = "connected";
          for (const routeId of this.routes.keys()) {
            const result = this.emit("route:join", routeId);
            if (!result.ok) this.report(result.error);
          }
        });
        socket.on("disconnect", () => {
          this.currentState = socket.active ? "reconnecting" : "disconnected";
        });
        socket.on("connect_error", (error: unknown) => {
          this.currentState = socket.active ? "reconnecting" : "disconnected";
          const timedOut =
            (isRecord(error) && error.message === "timeout") ||
            (error instanceof Error && error.message === "timeout");
          this.report({
            code: timedOut ? "TIMEOUT" : "NETWORK",
            message: timedOut
              ? "Se agotó el tiempo de conexión en tiempo real."
              : "No se pudo conectar al servidor en tiempo real.",
          });
        });
        socket.io.on("reconnect_attempt", () => {
          this.currentState = "reconnecting";
        });
        socket.io.on("reconnect_failed", () => {
          this.currentState = "disconnected";
          this.report({
            code: "NETWORK",
            message: "Se agotaron los intentos de conexión en tiempo real.",
          });
        });
        for (const event of Object.keys(
          serverEventValidators,
        ) as ServerEvent[]) {
          socket.on(event, (payload: unknown) => this.deliver(event, payload));
        }
      }
      if (!this.socket.connected && !this.socket.active) {
        this.currentState = "connecting";
        this.socket.connect();
      }
      return { ok: true, data: undefined };
    } catch {
      this.disconnect();
      return failure("NETWORK", "No se pudo abrir la conexión en tiempo real.");
    }
  }

  disconnect(): void {
    try {
      this.socket?.disconnect();
    } catch {
      /* Closing is idempotent. */
    }
    this.currentState = "disconnected";
  }

  private deliver(event: ServerEvent, payload: unknown) {
    if (!serverEventValidators[event](payload)) {
      this.report({
        code: "CONTRACT",
        message: "El evento recibido no coincide con el contrato esperado.",
      });
      return;
    }
    // Ignore stale or unsolicited route data without retaining a fleet store in Phase 1.
    if (event === "route:joined" || event === "micro:position") {
      if (
        !isRecord(payload) ||
        typeof payload.rutaId !== "number" ||
        !this.routes.has(payload.rutaId)
      )
        return;
    }
    for (const listener of this.listeners.get(event) ?? []) {
      try {
        listener(payload);
      } catch {
        this.report({
          code: "UNKNOWN",
          message: "No se pudo procesar el evento recibido.",
        });
      }
    }
  }

  on<K extends ServerEvent>(
    event: K,
    listener: (payload: ServerEventPayloads[K]) => void,
  ): () => void {
    const wrapped = (payload: unknown) => {
      const validate = serverEventValidators[event];
      if (validate(payload)) listener(payload);
    };
    const listeners = this.listeners.get(event) ?? new Set();
    listeners.add(wrapped);
    this.listeners.set(event, listeners);
    return () => {
      listeners.delete(wrapped);
      if (!listeners.size) this.listeners.delete(event);
    };
  }

  /** Ref counting prevents duplicate joins and premature leave with shared consumers. */
  subscribe(routeId: number): Result<() => void> {
    if (!isPositiveInteger(routeId))
      return failure(
        "CONTRACT",
        "La ruta debe tener un identificador entero positivo.",
      );
    const count = this.routes.get(routeId) ?? 0;
    if (!count && this.socket?.connected) {
      const result = this.emit("route:join", routeId);
      if (!result.ok) return result;
    }
    this.routes.set(routeId, count + 1);
    let released = false;
    return {
      ok: true,
      data: () => {
        if (released) return;
        released = true;
        const remaining = (this.routes.get(routeId) ?? 1) - 1;
        if (remaining) {
          this.routes.set(routeId, remaining);
          return;
        }
        this.routes.delete(routeId);
        if (this.socket?.connected) {
          const result = this.emit("route:leave", routeId);
          if (!result.ok) this.report(result.error);
        }
      },
    };
  }

  emit<K extends keyof ClientEventPayloads>(
    event: K,
    payload: ClientEventPayloads[K],
  ): Result<void> {
    if (
      !["route:join", "route:leave"].includes(event) ||
      !isPositiveInteger(payload)
    )
      return failure(
        "CONTRACT",
        "El evento o su identificador de ruta no es válido.",
      );
    // Do not let Socket.IO buffer application messages while disconnected.
    if (!this.socket?.connected)
      return failure(
        "DISCONNECTED",
        "La conexión en tiempo real no está disponible.",
      );
    try {
      this.socket.emit(event, payload);
      return { ok: true, data: undefined };
    } catch {
      return failure("NETWORK", "No se pudo enviar el mensaje en tiempo real.");
    }
  }
}

export const socketClient = new SocketClient(env.wsUrl);
