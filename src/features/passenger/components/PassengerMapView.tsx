import { useWindowDimensions } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { colors, routeColor } from "../../../theme";
import { getSignalFreshness } from "../../../utils/eta";
import { memo, useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";

import type { MapCoordinate } from "../../../utils/geo";
import type { PassengerUnit } from "../../../store/passengerFleet";

export interface PassengerMapProps {
  fitRequest?: number;
  routeId?: number;
  line: MapCoordinate[];
  units: PassengerUnit[];
  target?: MapCoordinate;
  location?: MapCoordinate;
  onSelect: (id: number) => void;
}

/** Interpola solo el marcador que recibió otra posición. Un reporte nuevo parte
 * del punto visible y el desmontaje cancela cuadros pendientes al cambiar de ruta. */
const UnitMarker = memo(function UnitMarker({
  unit,
  onSelect,
  stale,
}: {
  stale: boolean;
  unit: PassengerUnit;
  onSelect: (id: number) => void;
}) {
  const reduced = useReducedMotion();
  const [coordinate, setCoordinate] = useState({
    latitude: unit.lat,
    longitude: unit.lng,
  });
  const visible = useRef(coordinate);
  useEffect(() => {
    const from = visible.current;
    const to = { latitude: unit.lat, longitude: unit.lng };
    if (from.latitude === to.latitude && from.longitude === to.longitude)
      return;
    let frame: number;
    const start = Date.now();
    function update() {
      const fraction =
        unit.status === "moviendo" && !reduced && !stale
          ? Math.min(1, (Date.now() - start) / 600)
          : 1;
      visible.current = {
        latitude: from.latitude + (to.latitude - from.latitude) * fraction,
        longitude: from.longitude + (to.longitude - from.longitude) * fraction,
      };
      setCoordinate(visible.current);
      if (fraction < 1) frame = requestAnimationFrame(update);
    }
    update();
    return () => cancelAnimationFrame(frame);
  }, [unit.lat, unit.lng, unit.status, reduced, stale]);
  return (
    <Marker
      coordinate={coordinate}
      title={`Micro ${unit.microId}`}
      rotation={unit.heading ?? 0}
      flat={unit.heading !== undefined}
      pinColor={
        stale || unit.status === "desconectado"
          ? colors.muted
          : routeColor(unit.rutaId)
      }
      onPress={() => onSelect(unit.microId)}
    />
  );
});

/** Encuadra el trazado al elegir línea y centra solo por acción explícita.
 * El centro de Tacna es una posición inicial de cámara, nunca telemetría. */
export function PassengerMapView({
  routeId,
  fitRequest,
  line,
  units,
  target,
  location,
  onSelect,
}: PassengerMapProps) {
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [now, setNow] = useState(Date.now);
  // Una posición nueva puede llegar entre dos pulsos del reloj de frescura.
  useEffect(() => {
    if (!units.length) return;
    const pulse = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(pulse);
  }, [units]);
  const hasUnits = units.length > 0;
  useEffect(() => {
    if (!hasUnits) return;
    const clock = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(clock);
  }, [hasUnits]);
  const map = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready && line.length > 1)
      map.current?.fitToCoordinates(line, {
        animated: false,
        edgePadding: { top: 40, left: 30, bottom: 40, right: 30 },
      });
  }, [ready, line, fitRequest]);
  useEffect(() => {
    if (ready && target)
      map.current?.animateToRegion(
        { ...target, latitudeDelta: 0.015, longitudeDelta: 0.015 },
        reduced ? 0 : 200,
      );
  }, [ready, target, reduced]);
  return (
    <MapView
      ref={map}
      style={{ height: Math.max(200, height * 0.56), borderRadius: 16 }}
      onMapReady={() => setReady(true)}
      initialRegion={{
        latitude: -18.014,
        longitude: -70.253,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
    >
      {line.length > 1 && (
        <Polyline
          coordinates={line}
          strokeColor={routeColor(routeId ?? 0)}
          strokeWidth={4}
        />
      )}
      {line.length > 1 && (
        <>
          <Marker
            coordinate={line[0]}
            title="Inicio del trazado"
            pinColor={routeColor(routeId ?? 0)}
          />
          <Marker
            coordinate={line[line.length - 1]}
            title="Fin del trazado"
            pinColor={routeColor(routeId ?? 0)}
          />
        </>
      )}
      {location && (
        <Marker coordinate={location} title="Mi ubicación" pinColor="green" />
      )}
      {units.map((unit) => (
        <UnitMarker
          key={unit.microId}
          unit={unit}
          stale={getSignalFreshness(unit.lastSeen, now) !== "recent"}
          onSelect={onSelect}
        />
      ))}
    </MapView>
  );
}
