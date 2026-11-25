import { isRecord } from "../utils/validation";
import { isPaginatedResponse, type PaginatedResponse } from "./api";

export interface Coordinates {
  lat: number;
  lng: number;
}

/** OpenAPI GeoJsonLineString, EPSG:4326: longitude FIRST. */
export type GeoPosition = [longitude: number, latitude: number];
export interface GeoJsonLineString {
  type: "LineString";
  coordinates: GeoPosition[];
}

/** Wire fields retain official names; expanded relations are not consumed here. */
export interface Route {
  id: number;
  empresa_id: number;
  nombre_ruta: string;
  activo: boolean;
  trazado_ruta?: GeoJsonLineString | null;
  created_at?: string;
  updated_at?: string;
}

export type RoutePage = PaginatedResponse<Route>;

/** No stop schema or endpoint is published in the current OpenAPI. */
export type Stop = never;

export function isCoordinates(value: unknown): value is Coordinates {
  if (!isRecord(value)) return false;
  return (
    "lat" in value &&
    typeof value.lat === "number" &&
    Number.isFinite(value.lat) &&
    Math.abs(value.lat) <= 90 &&
    "lng" in value &&
    typeof value.lng === "number" &&
    Number.isFinite(value.lng) &&
    Math.abs(value.lng) <= 180
  );
}

export function isGeoJsonLineString(
  value: unknown,
): value is GeoJsonLineString {
  return (
    isRecord(value) &&
    value.type === "LineString" &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length >= 2 &&
    value.coordinates.every(
      (point: unknown) =>
        Array.isArray(point) &&
        point.length === 2 &&
        isCoordinates({ lng: point[0], lat: point[1] }),
    )
  );
}

export function isRoute(value: unknown): value is Route {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.id) &&
    Number.isSafeInteger(value.empresa_id) &&
    typeof value.nombre_ruta === "string" &&
    typeof value.activo === "boolean" &&
    (value.trazado_ruta === undefined ||
      value.trazado_ruta === null ||
      isGeoJsonLineString(value.trazado_ruta)) &&
    (value.created_at === undefined || typeof value.created_at === "string") &&
    (value.updated_at === undefined || typeof value.updated_at === "string")
  );
}

export function isRoutePage(value: unknown): value is RoutePage {
  return isPaginatedResponse(value, isRoute);
}
