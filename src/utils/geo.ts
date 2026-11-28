import { VISUAL_HEADING_MIN_DISTANCE_METERS } from "../config/constants";
import {
  isCoordinates,
  isGeoJsonLineString,
  type Coordinates,
  type GeoJsonLineString,
} from "../types/geo";
import type { MicroPosition } from "../types/telemetry";

/** Coordenada de presentación; no sustituye lat/lng en los contratos de red. */
export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Calcula la distancia directa sobre la esfera en metros mediante Haversine.
 * No representa calles ni determina si una unidad se acerca al pasajero.
 * Devuelve undefined ante coordenadas inválidas para permitir un estado controlado.
 */
export function distanceMeters(
  from: Coordinates,
  to: Coordinates,
): number | undefined {
  if (!isCoordinates(from) || !isCoordinates(to)) return undefined;
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const raw =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(lngDelta / 2) ** 2;
  // El redondeo cerca de puntos antípodas puede exceder levemente el intervalo.
  const value = Math.min(1, Math.max(0, raw));
  return (
    2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  );
}

/**
 * Convierte GeoJSON [longitud, latitud] a coordenadas de presentación sin mutarlo.
 * Un trazado ausente/nulo/inválido produce una lista vacía; la vista decide el aviso.
 * No duplica ni invierte puntos para inventar sentidos ida/vuelta.
 */
export function toMapCoordinates(
  geometry: GeoJsonLineString | null | undefined,
): MapCoordinate[] {
  if (!isGeoJsonLineString(geometry)) return [];
  return geometry.coordinates.map(([longitude, latitude]) => ({
    latitude,
    longitude,
  }));
}

/**
 * Deriva un rumbo visual en grados [0,360) entre dos reportes de la misma unidad.
 * Exige igual ruta, tiempo creciente y al menos cinco metros por defecto para no
 * rotar por ruido o reposo. Sin evidencia suficiente devuelve undefined y la vista
 * conserva su orientación previa o un icono neutro. No añade heading al DTO.
 */
export function getVisualHeading(
  previous: MicroPosition | undefined,
  current: MicroPosition,
  minimumDistance = VISUAL_HEADING_MIN_DISTANCE_METERS,
): number | undefined {
  if (
    !previous ||
    previous.microId !== current.microId ||
    previous.rutaId !== current.rutaId ||
    !Number.isSafeInteger(previous.lastSeen) ||
    !Number.isSafeInteger(current.lastSeen) ||
    previous.lastSeen < 0 ||
    current.lastSeen <= previous.lastSeen ||
    !Number.isFinite(minimumDistance) ||
    minimumDistance <= 0
  )
    return undefined;
  const distance = distanceMeters(previous, current);
  if (distance === undefined || distance < minimumDistance) return undefined;
  const delta = toRadians(current.lng - previous.lng);
  const start = toRadians(previous.lat);
  const end = toRadians(current.lat);
  const y = Math.sin(delta) * Math.cos(end);
  const x =
    Math.cos(start) * Math.sin(end) -
    Math.sin(start) * Math.cos(end) * Math.cos(delta);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
