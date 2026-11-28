import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { AppText } from "../../../components/AppText";
import { StatusBadge } from "../../../components/StatusBadge";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { ScreenStateView } from "../../../components/ScreenStateView";
import { colors, radius, spacing } from "../../../theme";
import type { ScreenStatus } from "../../../types/ui";
import { useDriverTrip } from "../hooks/useDriverTrip";
import { TripToggleButton } from "../components/TripToggleButton";
import { TelemetryStatusBar } from "../components/TelemetryStatusBar";
import BusFront from "lucide-react-native/icons/bus-front";
import Clock3 from "lucide-react-native/icons/clock-3";
import { AppIcon } from "../../../components/AppIcon";

/**
 * Compone la consola del conductor de Fase 2 sobre una simulación local.
 * `status` selecciona el escenario visual; `onRecover` y `onBack` delegan la
 * recuperación y navegación al padre. Los indicadores de demostración no prueban
 * permisos del dispositivo, conexión de red ni asignación real de un vehículo.
 *
 * Para iniciar se requiere el escenario ready. Un recorrido existente puede
 * finalizarse en otro escenario tras confirmarlo; cambiar de estado no lo termina.
 */
export function DriverConsoleScreen({
  embedded,
  status = "ready",
  onRecover,
  onBack,
}: {
  embedded?: boolean;
  status?: ScreenStatus;
  onRecover?: () => void;
  onBack?: () => void;
}) {
  const { active, elapsedSeconds, confirming, toggle, finish, cancel } =
    useDriverTrip();
  // El mismo diálogo atiende Finalizar y Volver. Recuerda la intención de volver
  // para salir solo en ese caso; finalizar normalmente mantiene abierta la consola.
  const [exitRequested, setExitRequested] = useState(false);
  /** Pide confirmar antes de salir de una simulación activa; si no, sale directamente. */
  function requestBack() {
    if (active) {
      setExitRequested(true);
      toggle();
    } else onBack?.();
  }
  /** Cancela tanto la salida pendiente como el diálogo y conserva el recorrido. */
  function cancelFinish() {
    setExitRequested(false);
    cancel();
  }
  /** Finaliza la simulación y navega solo si Volver inició la confirmación. */
  function confirmFinish() {
    finish();
    if (exitRequested) onBack?.();
    setExitRequested(false);
  }
  useEffect(() => {
    if (!active) return;
    // Intercepta Atrás de Android durante el recorrido para aplicar la misma
    // confirmación del encabezado. Un Modal abierto lo gestiona con onRequestClose.
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setExitRequested(true);
        toggle();
        return true;
      },
    );
    // Retira el manejador global de Atrás cuando esta pantalla se desmonta.
    return () => subscription.remove();
  }, [active, toggle]);
  // Muestra minutos transcurridos y segundos restantes; no es la hora del día ni
  // una duración guardada. El hook actualiza y libera el temporizador.
  const time = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;
  return (
    <ScreenLayout
      title="Modo conductor"
      embedded={embedded}
      onBack={onBack ? requestBack : undefined}
    >
      <StatusBadge
        label="Modo de prueba · No transmite tu ubicación."
        tone="warning"
      />
      <View style={styles.trip}>
        <View style={styles.assignment}>
          <View style={styles.vehicleMark}>
            <AppIcon icon={BusFront} size={32} />
          </View>
          <View style={styles.assignmentCopy}>
            <AppText variant="small" style={{ color: colors.mint }}>
              Unidad asignada · Prueba
            </AppText>
            <AppText variant="heading" style={{ color: colors.surface }}>
              Micro 01 · Línea 10
            </AppText>
          </View>
        </View>
        <View style={styles.tripSummary}>
          <AppText variant="small" style={styles.summaryText}>
            {active
              ? "Recorrido de prueba en curso"
              : "Listo para un recorrido de prueba"}
          </AppText>
          <View style={styles.timerHeading}>
            <AppIcon icon={Clock3} color={colors.mint} size={18} />
            <AppText
              variant="heading"
              style={{ fontVariant: ["tabular-nums"], color: colors.surface }}
              accessibilityLabel={`Tiempo de recorrido: ${time}`}
            >
              {time}
            </AppText>
          </View>
        </View>
      </View>
      <TelemetryStatusBar status={status} active={active} />
      {status !== "ready" && (
        <ScreenStateView
          status={status}
          onAction={onRecover}
          message={
            status === "empty"
              ? "No tienes una unidad asignada en este escenario de prueba."
              : undefined
          }
        />
      )}
      <TripToggleButton
        active={active}
        disabled={!active && status !== "ready"}
        onToggle={toggle}
      />
      <AppText variant="small" style={{ color: colors.muted }}>
        Utiliza los controles con el vehículo detenido.
      </AppText>
      <ConfirmationDialog
        visible={confirming}
        onCancel={cancelFinish}
        onConfirm={confirmFinish}
      />
    </ScreenLayout>
  );
}
const styles = StyleSheet.create({
  trip: {
    backgroundColor: colors.navy,
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.compact,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assignment: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vehicleMark: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.infoBg,
    alignItems: "center",
    justifyContent: "center",
  },
  assignmentCopy: { flex: 1, gap: spacing.xs },
  timerHeading: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  tripSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  summaryText: { flex: 1, color: colors.surface },
});
