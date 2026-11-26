/**
 * Rutas compartidas de los puntos de entrada de Fase 2. Centraliza aquí las URL y
 * mantiene la interacción en los hooks; estas constantes no conceden acceso ni navegan.
 */
export const appRoutes = {
  welcome: "/",
  passenger: "/passenger",
  driver: "/driver",
  preview: "/ui-preview",
} as const;
