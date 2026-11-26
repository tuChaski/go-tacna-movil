/**
 * Conjunto cerrado de escenarios visuales compartidos por pantallas y galería.
 * Son estados de interfaz, separados de los estados del vehículo y del transporte
 * del backend; la lista no comprueba conectividad ni solicita permisos de ubicación.
 */
export const screenStatuses = [
  "ready",
  "loading",
  "empty",
  "permission-denied",
  "offline",
  "error",
] as const;
export type ScreenStatus = (typeof screenStatuses)[number];
/** Tono semántico; las etiquetas deben explicar el estado sin depender solo del color. */
export type StatusTone = "info" | "success" | "warning" | "error" | "neutral";

/**
 * Textos compartidos en español para escenarios distintos de ready; cada pantalla
 * define su contenido disponible. Una acción es solo una etiqueta hasta que el
 * padre aporta su función; los mensajes no reintentan solicitudes ni cambian permisos.
 */
export const screenStateContent = {
  loading: {
    title: "Cargando información",
    message: "Estamos preparando la vista. Espera un momento.",
    action: undefined,
  },
  empty: {
    title: "No hay información disponible",
    message: "No hay unidades o elementos para mostrar en esta vista.",
    action: "Volver a intentar",
  },
  "permission-denied": {
    title: "Ubicación sin permiso",
    message:
      "Tu ubicación permite mostrar referencias cercanas. Puedes seguir explorando la vista de ejemplo.",
    action: "Continuar sin ubicación",
  },
  offline: {
    title: "Estás sin conexión",
    message:
      "No podemos confirmar ubicaciones ni llegadas en vivo. Revisa tu conexión e intenta de nuevo.",
    action: "Reintentar conexión",
  },
  error: {
    title: "No pudimos cargar la información",
    message: "No se pudo completar la consulta. Puedes volver a intentarlo.",
    action: "Intentar de nuevo",
  },
} as const;
