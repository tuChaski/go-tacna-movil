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
  isEtaError,
  isEtaRequest,
  isEtaResponse,
  serverEventValidators,
  type EtaRequest,
  type EtaResponse,
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

/** Instancia productiva única al final; Socket.IO gestiona la reconexión limitada. */
export class SocketClient {
  private socket?: SocketTransport;
  private currentState: SocketState = "idle";
  private stateListeners = new Set<(state: SocketState) => void>();

  /** Avisa pérdidas y reconexiones para invalidar la lista antes de recibir otra. */
  onState(listener: (state: SocketState) => void) {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private setState(state: SocketState) {
    this.currentState = state;
    for (const listener of this.stateListeners) listener(state);
  }

  private routes = new Map<number, number>();
  private listeners = new Map<ServerEvent, Set<(payload: unknown) => void>>();
  private errorListeners = new Set<(error: AppError) => void>();
  /** Cada consulta libera su temporizador y deja de aceptar su confirmación al cerrar. */
  private pendingEta = new Set<() => void>();

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
        /* Un observador no debe interrumpir el cliente ni los demás consumidores. */
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
          this.cancelPendingEta();
          this.setState("connected");
          for (const routeId of this.routes.keys()) {
            const result = this.emit("route:join", routeId);
            if (!result.ok) this.report(result.error);
          }
        });
        socket.on("disconnect", () => {
          this.cancelPendingEta();
          this.setState(socket.active ? "reconnecting" : "disconnected");
        });
        socket.on("connect_error", (error: unknown) => {
          this.cancelPendingEta();
          this.setState(socket.active ? "reconnecting" : "disconnected");
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
          this.setState("reconnecting");
        });
        socket.io.on("reconnect_failed", () => {
          this.setState("disconnected");
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
        this.setState("connecting");
        this.socket.connect();
      }
      return { ok: true, data: undefined };
    } catch {
      this.disconnect();
      return failure("NETWORK", "No se pudo abrir la conexión en tiempo real.");
    }
  }

  disconnect(): void {
    this.cancelPendingEta();
    try {
      this.socket?.disconnect();
    } catch {
      /* El cierre es idempotente incluso si falla el transporte nativo. */
    }
    this.setState("disconnected");
  }

  private deliver(event: ServerEvent, payload: unknown) {
    if (!serverEventValidators[event](payload)) {
      this.report({
        code: "CONTRACT",
        message: "El evento recibido no coincide con el contrato esperado.",
      });
      return;
    }
    // Descarta datos de rutas sin consumidores; el estado de flota pertenece al dominio.
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

  /** El conteo evita uniones duplicadas y salidas prematuras entre consumidores. */
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
    // Impide que Socket.IO acumule mensajes de aplicación durante la desconexión.
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

  /** Invalida consultas de la conexión anterior sin desconectar otros consumidores. */
  private cancelPendingEta(): void {
    for (const cancel of [...this.pendingEta]) cancel();
  }

  /**
   * Consulta el ETA usando el socket existente y la confirmación del handler real:
   * éxito callback(null, eta), error callback({error}). No escucha un evento global
   * de respuesta, porque un error sin microId no permite correlacionar consultas.
   *
   * Valida entrada/salida, oculta mensajes internos y libera recursos en respuesta,
   * timeout, aborto o cambio de conexión. Una confirmación tardía ya resuelta se
   * ignora. El consumidor puede abortar al cambiar su ruta, unidad o referencia.
   */
  async requestEta(
    request: EtaRequest,
    options: { timeoutMs?: number; signal?: AbortSignal } = {},
  ): Promise<Result<EtaResponse>> {
    if (!isEtaRequest(request))
      return failure(
        "CONTRACT",
        "La referencia para consultar la llegada no es válida.",
      );
    const timeoutMs = options.timeoutMs ?? SOCKET_TIMEOUT_MS;
    const signal = options.signal;
    // Captura la referencia de esta consulta aunque el consumidor reutilice su objeto.
    const payload = { ...request };
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
      return failure("CONFIGURATION", "El tiempo de espera no es válido.");
    if (signal?.aborted)
      return failure("CANCELLED", "La consulta de llegada fue cancelada.");
    const socket = this.socket;
    if (!socket?.connected)
      return failure(
        "DISCONNECTED",
        "No hay conexión para consultar la llegada.",
      );

    return new Promise((resolve) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const complete = (result: Result<EtaResponse>) => {
        if (settled) return;
        settled = true;
        if (timer !== undefined) clearTimeout(timer);
        this.pendingEta.delete(onDisconnect);
        signal?.removeEventListener("abort", onAbort);
        resolve(result);
      };
      const onDisconnect = () =>
        complete(
          failure("DISCONNECTED", "Se interrumpió la consulta de llegada."),
        );
      const onAbort = () =>
        complete(failure("CANCELLED", "La consulta de llegada fue cancelada."));
      this.pendingEta.add(onDisconnect);
      signal?.addEventListener("abort", onAbort, { once: true });
      timer = setTimeout(
        () =>
          complete(
            failure("TIMEOUT", "Se agotó el tiempo de consulta de llegada."),
          ),
        timeoutMs,
      );
      // Cubre el aborto ocurrido justo antes de registrar el manejador.
      if (signal?.aborted) {
        onAbort();
        return;
      }
      try {
        socket.emit("eta:request", payload, (error: unknown, data: unknown) => {
          if (settled) return;
          if (isEtaError(error) && data === undefined) {
            complete(
              failure("REMOTE", "No se pudo obtener la llegada estimada."),
            );
          } else if (
            error === null &&
            isEtaResponse(data) &&
            data.microId === payload.microId
          ) {
            complete({ ok: true, data });
          } else {
            complete(
              failure(
                "CONTRACT",
                "La respuesta de llegada no tiene el formato esperado.",
              ),
            );
          }
        });
      } catch {
        complete(
          failure("NETWORK", "No se pudo enviar la consulta de llegada."),
        );
      }
    });
  }
}

export const socketClient = new SocketClient(env.wsUrl);
