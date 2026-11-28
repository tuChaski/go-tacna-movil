import LocateFixed from "lucide-react-native/icons/locate-fixed";
import Scan from "lucide-react-native/icons/scan";
import { IconButton } from "../../../components/IconButton";
import { View } from "react-native";
import { colors, routeColor } from "../../../theme";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { ScreenStateView } from "../../../components/ScreenStateView";
import { AppText } from "../../../components/AppText";
import { ActionButton } from "../../../components/ActionButton";
import { BottomSheetCard } from "../../../components/BottomSheetCard";
import type { Route, Coordinates } from "../../../types/geo";
import {
  passengerCatalogService,
  type RouteCatalog,
} from "../services/catalogService";
import { RouteSelector, routeLabel } from "../components/RouteSelector";
import { PassengerMapView } from "../components/PassengerMapView";
import {
  createPassengerFleet,
  type PassengerUnit,
} from "../../../store/passengerFleet";
import { usePassengerLocation } from "../hooks/usePassengerLocation";
import { socketClient } from "../../../services/websocket/socketClient";
import {
  toMapCoordinates,
  distanceMeters,
  type MapCoordinate,
} from "../../../utils/geo";
import {
  canRequestEta,
  getSignalFreshness,
  formatEtaMinutes,
} from "../../../utils/eta";

/** Consulta el catálogo al entrar y permite forzar revalidación. Solo la selección
 * activa monta una sala. La galería de ejemplos sigue aislada de esta pantalla. */
export function PassengerLiveScreen({
  onBack,
  active,
}: {
  onBack: () => void;
  active: boolean;
}) {
  const [catalog, setCatalog] = useState<RouteCatalog>();
  const [message, setMessage] = useState("Cargando líneas…");
  const [attempt, setAttempt] = useState(0);
  const [routeId, setRouteId] = useState<number>();
  useEffect(() => {
    let active = true;
    void passengerCatalogService
      .load({ refresh: attempt > 0 })
      .then((result) => {
        if (!active) return;
        if (result.ok) {
          setCatalog(result.data);
          setMessage(
            result.data.routes.length ? "" : "No hay líneas disponibles.",
          );
        } else setMessage(result.error.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const selected = catalog?.routes.find((route) => route.id === routeId);
  return (
    <ScreenLayout onBack={onBack} compact>
      {!!message && <AppText>{message}</AppText>}
      {catalog?.source === "cache" && (
        <AppText>
          Catálogo guardado · {new Date(catalog.fetchedAt).toLocaleString()}
          {catalog.stale ? " · pendiente de actualizar" : ""}
        </AppText>
      )}
      {catalog?.warning && <AppText>{catalog.warning.message}</AppText>}
      {catalog && (
        <RouteSelector
          compact
          selectedId={selected?.id}
          routes={catalog.routes.map((route) => ({
            route,
            label: routeLabel(route.nombre_ruta),
            description: "",
          }))}
          onSelect={setRouteId}
        />
      )}
      {active && selected && (
        <RouteTracking key={selected.id} route={selected} />
      )}
      {active && !selected && (
        <PassengerMapView line={[]} units={[]} onSelect={() => {}} />
      )}
      <ActionButton
        variant="outline"
        title="Actualizar líneas"
        onPress={() => setAttempt((value) => value + 1)}
      />
    </ScreenLayout>
  );
}

/** La lista accesible y los marcadores abren la misma ficha. El regreso desde
 * segundo plano o el cambio de línea monta una sesión con instantánea nueva. */
function RouteTracking({ route }: { route: Route }) {
  const session = useMemo(() => createPassengerFleet(route.id), [route.id]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => session.start(), [session, attempt]);
  const fleet = useStore(session.store);
  const [expanded, setExpanded] = useState(false);
  const [fitRequest, fit] = useState(0);
  const [selectedId, select] = useState<number>();
  const [target, setTarget] = useState<MapCoordinate>();
  const location = usePassengerLocation();
  const point = useMemo(
    () =>
      location.reference && {
        latitude: location.reference.lat,
        longitude: location.reference.lng,
      },
    [location.reference],
  );
  const line = useMemo(
    () => toMapCoordinates(route.trazado_ruta),
    [route.trazado_ruta],
  );
  const units = Object.values(fleet.units);
  const unit = selectedId === undefined ? undefined : fleet.units[selectedId];
  useEffect(
    () =>
      session.store.subscribe((state) => {
        if (state.phase !== "ready") select(undefined);
      }),
    [session],
  );
  return (
    <>
      <View>
        <PassengerMapView
          fitRequest={fitRequest}
          routeId={route.id}
          line={line}
          units={units}
          target={target ?? point}
          location={point}
          onSelect={select}
        />
        <View style={{ position: "absolute", right: 8, bottom: 12, gap: 6 }}>
          {line.length > 1 && (
            <IconButton
              label="Ver recorrido completo"
              icon={Scan}
              onPress={() => {
                setTarget(undefined);
                fit((n) => n + 1);
              }}
            />
          )}
          <IconButton
            label="Usar mi ubicación para estimar la llegada"
            icon={LocateFixed}
            disabled={location.busy}
            onPress={() => {
              setTarget(undefined);
              void location.locate();
            }}
          />
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 14,
          gap: 8,
          borderLeftWidth: 4,
          borderColor: routeColor(route.id),
        }}
      >
        <AppText variant="heading">{route.nombre_ruta}</AppText>
        {fleet.phase === "ready" && (
          <ActionButton
            variant="secondary"
            title={
              expanded ? "Ocultar unidades" : `Ver unidades · ${units.length}`
            }
            onPress={() => setExpanded(!expanded)}
          />
        )}
        {!line.length && (
          <AppText>Esta línea aún no tiene un trazado publicado.</AppText>
        )}
        {fleet.phase === "waiting" && (
          <AppText>Esperando la lista de micros…</AppText>
        )}
        {(fleet.phase === "offline" || fleet.phase === "error") && (
          <ScreenStateView
            status={fleet.phase}
            message={fleet.message}
            onAction={() => setAttempt((value) => value + 1)}
          />
        )}
        {fleet.phase === "ready" && !units.length && (
          <AppText>Esta línea no tiene micros reportados.</AppText>
        )}
        {expanded &&
          units.map((item) => (
            <ActionButton
              key={item.microId}
              variant="outline"
              title={`Micro ${item.microId} · ${item.status}`}
              onPress={() => select(item.microId)}
            />
          ))}
      </View>
      {!!location.notice && <AppText>{location.notice}</AppText>}
      {unit && (
        <UnitDetail
          key={unit.microId}
          unit={unit}
          reference={location.reference}
          onClose={() => select(undefined)}
          onLocate={() => {
            setTarget({ latitude: unit.lat, longitude: unit.lng });
            select(undefined);
          }}
        />
      )}
    </>
  );
}

/** Renueva el ETA remoto cada 15 s solo con referencia y señal reciente. Al perder
 * elegibilidad, cerrar la ficha o cambiar de micro cancela las confirmaciones pendientes. */
function UnitDetail({
  unit,
  reference,
  onClose,
  onLocate,
}: {
  unit: PassengerUnit;
  reference?: Coordinates;
  onClose: () => void;
  onLocate: () => void;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const eligible = canRequestEta(unit, reference, true, now);
  const id = unit.microId;
  const distance = reference && distanceMeters(unit, reference);
  const freshness = getSignalFreshness(unit.lastSeen, now);
  return (
    <BottomSheetCard visible title={`Micro ${id}`} onClose={onClose}>
      <AppText>
        {unit.status} ·{" "}
        {freshness === "recent"
          ? "Señal reciente"
          : freshness === "stale"
            ? "Señal antigua"
            : "Hora sin verificar"}
      </AppText>
      <AppText>
        Último reporte · {new Date(unit.lastSeen).toLocaleTimeString()}
      </AppText>
      <AppText>
        Distancia directa ·{" "}
        {distance === undefined ? "No disponible" : `${Math.round(distance)} m`}
      </AppText>
      {eligible && reference ? (
        <Arrival
          key={`${id}/${reference.lat}/${reference.lng}`}
          id={id}
          reference={reference}
        />
      ) : (
        <AppText>Llegada aproximada · No disponible</AppText>
      )}
      <ActionButton title="Ver ubicación del micro" onPress={onLocate} />
    </BottomSheetCard>
  );
}

/** Solo existe mientras la unidad y la referencia permitan consultar la llegada.
 * Desmontarlo invalida tanto el valor mostrado como la petición en curso. */
function Arrival({ id, reference }: { id: number; reference: Coordinates }) {
  const [eta, setEta] = useState<number>();
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      const result = await socketClient.requestEta(
        { microId: id, ...reference },
        { signal: controller.signal },
      );
      if (!controller.signal.aborted)
        setEta(result.ok ? result.data.etaSeconds : undefined);
    }
    void refresh();
    const timer = setInterval(refresh, 15000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [id, reference]);
  return (
    <AppText>
      Llegada aproximada ·{" "}
      {eta === undefined ? "No disponible" : formatEtaMinutes(eta)}
    </AppText>
  );
}
