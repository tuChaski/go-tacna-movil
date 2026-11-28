import { memo, useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { colors } from "../../../theme";
import type { MapCoordinate } from "../../../utils/geo";
import type { PassengerUnit } from "../../../store/passengerFleet";

export interface PassengerMapProps {
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
}: {
  unit: PassengerUnit;
  onSelect: (id: number) => void;
}) {
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
        unit.status === "moviendo"
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
  }, [unit.lat, unit.lng, unit.status]);
  return (
    <Marker
      coordinate={coordinate}
      title={`Micro ${unit.microId}`}
      rotation={unit.heading ?? 0}
      flat={unit.heading !== undefined}
      pinColor={unit.status === "desconectado" ? colors.muted : colors.primary}
      onPress={() => onSelect(unit.microId)}
    />
  );
});

/** Encuadra el trazado al elegir línea y centra solo por acción explícita.
 * El centro de Tacna es una posición inicial de cámara, nunca telemetría. */
export function PassengerMapView({
  line,
  units,
  target,
  location,
  onSelect,
}: PassengerMapProps) {
  const map = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready && line.length > 1)
      map.current?.fitToCoordinates(line, {
        animated: false,
        edgePadding: { top: 40, left: 30, bottom: 40, right: 30 },
      });
  }, [ready, line]);
  useEffect(() => {
    if (ready && target)
      map.current?.animateToRegion(
        { ...target, latitudeDelta: 0.015, longitudeDelta: 0.015 },
        350,
      );
  }, [ready, target]);
  return (
    <MapView
      ref={map}
      style={{ height: 320 }}
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
          strokeColor={colors.primary}
          strokeWidth={4}
        />
      )}
      {location && (
        <Marker coordinate={location} title="Mi ubicación" pinColor="green" />
      )}
      {units.map((unit) => (
        <UnitMarker key={unit.microId} unit={unit} onSelect={onSelect} />
      ))}
    </MapView>
  );
}
