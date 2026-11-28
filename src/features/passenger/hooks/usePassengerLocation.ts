import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import type { Coordinates } from "../../../types/geo";

/** Solicita una referencia solo por acción del pasajero. Se conserva en memoria
 * mientras la vista esté activa y se descarta cualquier lectura posterior a la salida. */
export function usePassengerLocation() {
  const [reference, setReference] = useState<Coordinates>();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  async function locate() {
    const current = ++generation.current;
    setBusy(true);
    setReference(undefined);
    setNotice("Buscando tu ubicación…");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (current !== generation.current) return;
      if (!permission.granted) {
        setNotice(
          "Permiso de ubicación denegado. Puedes seguir viendo la línea.",
        );
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        if (current === generation.current)
          setNotice("Activa la ubicación para consultar distancia y llegada.");
        return;
      }
      if (current !== generation.current) return;
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (current === generation.current) {
        setReference({ lat: coords.latitude, lng: coords.longitude });
        setNotice(
          "Distancia y llegada usan la ubicación que acabas de consultar.",
        );
      }
    } catch {
      if (current === generation.current)
        setNotice(
          "No se pudo obtener tu ubicación. Puedes volver a intentarlo.",
        );
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }
  return { reference, notice, busy, locate };
}
