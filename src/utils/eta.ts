import { PASSENGER_SIGNAL_STALE_MS } from "../config/constants";
import { isCoordinates, type Coordinates } from "../types/geo";
import type { MicroPosition } from "../types/telemetry";

export type SignalFreshness = "recent" | "stale" | "unverified";

/**
 * Evalúa antigüedad local en milisegundos sin alterar el status del servidor.
 * Una fecha futura o inválida es no comprobable, nunca señal reciente por defecto.
 * El umbral visual de 60s es independiente del timeout offline del servidor (120s).
 */
export function getSignalFreshness(
  lastSeen: number,
  now = Date.now(),
  staleAfterMs = PASSENGER_SIGNAL_STALE_MS,
): SignalFreshness {
  if (
    !Number.isSafeInteger(lastSeen) ||
    lastSeen < 0 ||
    !Number.isSafeInteger(now) ||
    now < lastSeen ||
    !Number.isFinite(staleAfterMs) ||
    staleAfterMs <= 0
  )
    return "unverified";
  return now - lastSeen > staleAfterMs ? "stale" : "recent";
}

/**
 * Indica si existen datos suficientes para solicitar/mostrar un ETA remoto.
 * No calcula llegadas: exige conexión, referencia válida, movimiento y señal reciente.
 * Una pérdida de esas condiciones debe invalidar la estimación visible en el hook.
 */
export function canRequestEta(
  unit: MicroPosition,
  reference: Coordinates | undefined,
  connected: boolean,
  now = Date.now(),
): boolean {
  return (
    connected &&
    isCoordinates(reference) &&
    isCoordinates(unit) &&
    unit.status === "moviendo" &&
    Number.isFinite(unit.speed) &&
    unit.speed > 0 &&
    getSignalFreshness(unit.lastSeen, now) === "recent"
  );
}

/** Formatea segundos válidos sin afirmar «ya llegó» cuando el servidor estima cero. */
export function formatEtaMinutes(seconds: number): string {
  if (!Number.isSafeInteger(seconds) || seconds < 0) return "No disponible";
  return seconds < 60 ? "Menos de 1 min" : `${Math.ceil(seconds / 60)} min`;
}
