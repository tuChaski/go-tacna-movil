export const HTTP_TIMEOUT_MS = 10_000;
export const SOCKET_TIMEOUT_MS = 10_000;
export const RECONNECT_BASE_MS = 1_000;
export const RECONNECT_MAX_MS = 30_000;
export const RECONNECT_MAX_ATTEMPTS = 5;
export const STORAGE_PREFIX = "chasqui:";

/** Políticas del pasajero; no cambian los tiempos ni estados del servidor. */
export const CATALOG_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const PASSENGER_SIGNAL_STALE_MS = 60_000;
export const VISUAL_HEADING_MIN_DISTANCE_METERS = 5;
/** Evita un recorrido infinito si la paginación del catálogo es inconsistente. */
export const MAX_ROUTE_PAGES = 500;
