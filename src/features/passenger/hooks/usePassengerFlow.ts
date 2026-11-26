import { useState } from "react";
import type { PassengerPlace } from "../data/passengerPreview";

/**
 * Coordina las tres acciones de la demostración: elegir una ruta, abrir el detalle
 * de un lugar y destacarlo mediante «Ver ubicación».
 * `selection` determina la ficha abierta; `focusedPlace`, el resaltado del mapa y
 * el resumen al cerrarla. Ninguno representa GPS ni la cámara de un mapa real.
 */
export function usePassengerFlow() {
  const [routeId, setRouteId] = useState<number>();
  const [selection, setSelection] = useState<PassengerPlace>();
  const [focusedPlace, setFocusedPlace] = useState<PassengerPlace>();
  /** Cambia la ruta y descarta el detalle y el resaltado asociados a la anterior. */
  function selectRoute(id: number) {
    setRouteId(id);
    setSelection(undefined);
    setFocusedPlace(undefined);
  }
  /** Resalta el lugar de la ficha en la vista principal y después cierra la ficha. */
  function showLocation() {
    setFocusedPlace(selection);
    setSelection(undefined);
  }
  return {
    routeId,
    selection,
    focusedPlace,
    selectRoute,
    selectPlace: setSelection,
    // Cerrar el detalle conserva la ruta elegida y el lugar destacado previamente.
    closeSheet: () => setSelection(undefined),
    showLocation,
  };
}
