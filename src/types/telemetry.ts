import { isCoordinates, type Coordinates } from "./geo";
import {
  hasOnlyKeys,
  isNonNegativeNumber,
  isPositiveInteger,
  isRecord,
} from "../utils/validation";
import type { Validator } from "./api";

/** Node realtime HTTP contract only; do not send as a Socket.IO event. */
export interface LocationEmission extends Coordinates {
  speed: number;
}
export interface TrackingAccepted {
  ok: true;
}
/** OpenAPI ConductorPosicionInput; kept separate from the Node tracking request. */
export interface CoreLocationEmission {
  latitud: number;
  longitud: number;
  velocidad?: number;
  fecha_hora?: string;
}
export type MicroStatus = "moviendo" | "detenido" | "desconectado";

export interface MicroPosition extends LocationEmission {
  microId: number;
  rutaId: number;
  status: MicroStatus;
  lastSeen: number;
}

export interface ActiveUnits {
  rutaId: number;
  micros: MicroPosition[];
}
export interface MicroOffline {
  microId: number;
  lastSeen: number;
}
export interface MicroStopped {
  microId: number;
}
export interface SocketError {
  message: string;
}

/** Solicitud de ETA contractual: la coordenada es la referencia del pasajero. */
export interface EtaRequest extends Coordinates {
  microId: number;
}

/** Estimación del servidor en segundos; no garantiza recorrido vial ni tráfico. */
export interface EtaResponse {
  microId: number;
  etaSeconds: number;
  estimated: true;
}

/** Error específico de eta:request; no es el evento genérico Socket.IO error. */
export interface EtaError {
  error: string;
}

/** Valida sin transformar ni añadir campos al payload de salida. */
export function isEtaRequest(value: unknown): value is EtaRequest {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["microId", "lat", "lng"]) &&
    isPositiveInteger(value.microId) &&
    isCoordinates(value)
  );
}

/** Rechaza respuestas de otro esquema, tiempos negativos y estimaciones no tipadas. */
export function isEtaResponse(value: unknown): value is EtaResponse {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["microId", "etaSeconds", "estimated"]) &&
    isPositiveInteger(value.microId) &&
    Number.isSafeInteger(value.etaSeconds) &&
    isNonNegativeNumber(value.etaSeconds) &&
    value.estimated === true
  );
}

/** El texto remoto se valida, pero se sustituye por un mensaje seguro en la UI. */
export function isEtaError(value: unknown): value is EtaError {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["error"]) &&
    typeof value.error === "string"
  );
}

export interface ClientEventPayloads {
  "route:join": number;
  "route:leave": number;
}

export interface ServerEventPayloads {
  "route:joined": ActiveUnits;
  "micro:position": MicroPosition;
  "micro:offline": MicroOffline;
  "micro:stopped": MicroStopped;
  error: SocketError;
}

export function isLocationEmission(value: unknown): value is LocationEmission {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["lat", "lng", "speed"]) &&
    isCoordinates(value) &&
    isNonNegativeNumber(value.speed)
  );
}

export function isMicroPosition(value: unknown): value is MicroPosition {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, [
      "microId",
      "rutaId",
      "lat",
      "lng",
      "speed",
      "status",
      "lastSeen",
    ]) &&
    isPositiveInteger(value.microId) &&
    isPositiveInteger(value.rutaId) &&
    isCoordinates(value) &&
    isNonNegativeNumber(value.speed) &&
    typeof value.status === "string" &&
    ["moviendo", "detenido", "desconectado"].includes(value.status) &&
    Number.isSafeInteger(value.lastSeen) &&
    isNonNegativeNumber(value.lastSeen)
  );
}

export function isActiveUnits(value: unknown): value is ActiveUnits {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["rutaId", "micros"]) &&
    isPositiveInteger(value.rutaId) &&
    Array.isArray(value.micros) &&
    value.micros.every(isMicroPosition) &&
    value.micros.every((micro) => micro.rutaId === value.rutaId)
  );
}

export function isMicroOffline(value: unknown): value is MicroOffline {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["microId", "lastSeen"]) &&
    isPositiveInteger(value.microId) &&
    Number.isSafeInteger(value.lastSeen) &&
    isNonNegativeNumber(value.lastSeen)
  );
}

export function isMicroStopped(value: unknown): value is MicroStopped {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["microId"]) &&
    isPositiveInteger(value.microId)
  );
}

export const serverEventValidators: {
  [K in keyof ServerEventPayloads]: Validator<ServerEventPayloads[K]>;
} = {
  "route:joined": isActiveUnits,
  "micro:position": isMicroPosition,
  "micro:offline": isMicroOffline,
  "micro:stopped": isMicroStopped,
  error: (value): value is SocketError =>
    isRecord(value) &&
    hasOnlyKeys(value, ["message"]) &&
    typeof value.message === "string",
};
