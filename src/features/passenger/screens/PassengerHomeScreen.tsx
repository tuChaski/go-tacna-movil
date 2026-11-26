import { View, StyleSheet } from "react-native";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { AppText } from "../../../components/AppText";
import { StatusBadge } from "../../../components/StatusBadge";
import { ScreenStateView } from "../../../components/ScreenStateView";
import { colors, radius, spacing } from "../../../theme";
import type { ScreenStatus } from "../../../types/ui";
import { previewRoutes, getPreviewPlaces } from "../data/passengerPreview";
import { usePassengerFlow } from "../hooks/usePassengerFlow";
import { RouteSelector } from "../components/RouteSelector";
import { PassengerMapPreview } from "../components/PassengerMapPreview";
import { UnitInfoSheet } from "../components/UnitInfoSheet";

/**
 * Compone la exploración de rutas como invitado usando solo datos de ejemplo.
 * Desde esta pantalla, tres toques permiten elegir una ruta, abrir un lugar y
 * destacar su ubicación. El hook separa la ficha abierta del resaltado final.
 *
 * El padre proporciona `status`, incluida la galería interna de escenarios;
 * `onRecover` aporta una recuperación opcional y `onBack` gestiona la navegación.
 * Mostrar esta pantalla no consulta rutas, solicita GPS ni inicia un socket.
 */
export function PassengerHomeScreen({
  status = "ready",
  onRecover,
  onBack,
}: {
  status?: ScreenStatus;
  onRecover?: () => void;
  onBack?: () => void;
}) {
  const flow = usePassengerFlow();
  // Mantiene vacío el mapa ilustrativo hasta elegir una ruta. Los ejemplos locales
  // se crean de nuevo; no son una caché de vehículos reales ni respuestas del backend.
  const places =
    flow.routeId === undefined ? [] : getPreviewPlaces(flow.routeId);
  return (
    <ScreenLayout
      title="Encuentra tu micro"
      subtitle="Elige una ruta y explora."
      onBack={onBack}
      compact
    >
      <StatusBadge label="Demostración · sin datos en vivo" />
      {status !== "ready" ? (
        <ScreenStateView
          status={status}
          onAction={onRecover}
          message={
            status === "empty"
              ? "Esta ruta no tiene micros activos. Puedes consultar otra ruta más tarde."
              : undefined
          }
        />
      ) : (
        <>
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              1. Elige tu ruta
            </AppText>
            <RouteSelector
              routes={previewRoutes}
              selectedId={flow.routeId}
              onSelect={flow.selectRoute}
              compact
            />
          </View>
          <View style={styles.section}>
            <AppText variant="label" accessibilityRole="header">
              2. Elige un micro o punto de espera
            </AppText>
            <PassengerMapPreview
              places={places}
              onSelect={flow.selectPlace}
              focusedKey={flow.focusedPlace?.key}
            />
            <AppText variant="small" style={{ color: colors.muted }}>
              P: punto de espera de ejemplo.
            </AppText>
          </View>
          {flow.focusedPlace && (
            <View style={styles.focus} accessibilityLiveRegion="polite">
              <AppText variant="heading">
                {flow.focusedPlace.title} seleccionado
              </AppText>
              <AppText>{flow.focusedPlace.reference}</AppText>
              <AppText>
                Mapa ilustrativo ·{" "}
                {flow.focusedPlace.unit?.status === "desconectado"
                  ? "Llegada no disponible"
                  : `${flow.focusedPlace.arrivalLabel} de ejemplo`}
              </AppText>
            </View>
          )}
          <AppText variant="small" style={{ color: colors.muted }}>
            Ruta → micro o punto de espera → ubicación. Sin crear una cuenta.
          </AppText>
          <UnitInfoSheet
            place={flow.selection}
            onClose={flow.closeSheet}
            onShowLocation={flow.showLocation}
          />
        </>
      )}
    </ScreenLayout>
  );
}
const styles = StyleSheet.create({
  section: { gap: spacing.compact },
  focus: {
    backgroundColor: colors.infoBg,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
});
