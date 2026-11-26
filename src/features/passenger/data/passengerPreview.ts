import type { Route } from "../../../types/geo";
import type { MicroPosition } from "../../../types/telemetry";

/**
 * Añade etiquetas visuales al contrato Route sin cambiar sus campos de intercambio.
 * Todos los valores del módulo son ilustrativos y permanecen en la capa visual;
 * no deben enviarse a API, WebSocket ni almacenamiento como información real.
 */
export interface PreviewRoute {
  route: Route;
  label: string;
  description: string;
}
/**
 * Modelo visual de un marcador seleccionable, no un DTO de la API. Aquí "stop"
 * representa un punto de espera de ejemplo y no define un contrato de paraderos.
 */
export interface PassengerPlace {
  /** Identificador estable por lista de ejemplos, usado como clave y para resaltar. */
  key: string;
  kind: "unit" | "stop";
  title: string;
  reference: string;
  /** Texto de ejemplo predefinido, no un ETA calculado con distancia o velocidad. */
  arrivalLabel: string;
  /** Texto del escenario; no se verifica la antigüedad de las marcas de tiempo. */
  signalLabel: string;
  /** Contrato de telemetría existente para unidades; ausente en puntos de espera. */
  unit?: MicroPosition;
}
/** Dos opciones locales para revisar la interacción, no un catálogo oficial de rutas. */
export const previewRoutes: PreviewRoute[] = [
  {
    route: { id: 10, empresa_id: 1, nombre_ruta: "Línea 10", activo: true },
    label: "10",
    description: "Centro · Av. Pinto · Pocollay",
  },
  {
    route: { id: 4, empresa_id: 2, nombre_ruta: "Línea 04", activo: true },
    label: "04",
    description: "Terminal · Centro · Ciudad Nueva",
  },
];
/**
 * Crea dos unidades y un punto de espera de ejemplo para la ruta seleccionada.
 * `routeId` solo vincula los ejemplos con la selección visual; no consulta rutas.
 * Las coordenadas y lastSeen son valores fijos, nunca telemetría actualizada.
 * La unidad desconectada permite revisar cómo se oculta una llegada no disponible.
 */
export function getPreviewPlaces(routeId: number): PassengerPlace[] {
  return [
    {
      key: "micro-01",
      kind: "unit",
      title: "Micro 01",
      reference: "Av. Pinto, hacia el centro",
      arrivalLabel: "6 min",
      signalLabel: "Señal reciente",
      unit: {
        microId: 1,
        rutaId: routeId,
        lat: -18.0146,
        lng: -70.2536,
        speed: 8,
        status: "moviendo",
        lastSeen: 1700000000000,
      },
    },
    {
      key: "micro-02",
      kind: "unit",
      title: "Micro 02",
      reference: "Cerca de la Plaza de Armas",
      arrivalLabel: "9 min",
      signalLabel: "Señal desactualizada",
      unit: {
        microId: 2,
        rutaId: routeId,
        lat: -18.015,
        lng: -70.254,
        speed: 0,
        status: "desconectado",
        lastSeen: 1699999880000,
      },
    },
    {
      key: "plaza",
      kind: "stop",
      title: "Plaza de Armas",
      reference: "Punto de espera ilustrativo · Centro de Tacna",
      arrivalLabel: "6 min",
      signalLabel: "Punto de espera de ejemplo",
    },
  ];
}
