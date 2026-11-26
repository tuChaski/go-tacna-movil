import { AppText } from "../../../components/AppText";
import { ActionButton } from "../../../components/ActionButton";
import { BottomSheetCard } from "../../../components/BottomSheetCard";
import { StatusBadge } from "../../../components/StatusBadge";
import { colors, radius, spacing } from "../../../theme";
import { StyleSheet, View } from "react-native";
import MapPin from "lucide-react-native/icons/map-pin";
import { AppIcon } from "../../../components/AppIcon";
import type { PassengerPlace } from "../data/passengerPreview";

/**
 * Abre el detalle cuando existe `place` y delega el cierre y el resaltado al flujo
 * del pasajero mediante `onClose` y `onShowLocation`.
 * Llegada y señal son textos de ejemplo, no cálculos de ETA o antigüedad.
 * Una unidad marcada como desconectada muestra «No disponible» en vez de su
 * llegada de ejemplo. Los puntos de espera comparten el modelo visual sin inventar
 * un contrato de paraderos. La acción final resalta el lugar en el mapa ilustrativo.
 */
export function UnitInfoSheet({
  place,
  onClose,
  onShowLocation,
}: {
  place?: PassengerPlace;
  onClose: () => void;
  onShowLocation: () => void;
}) {
  return (
    <BottomSheetCard
      visible={Boolean(place)}
      title={place?.title ?? "Información"}
      onClose={onClose}
    >
      {place && (
        <>
          <StatusBadge
            label={`${place.signalLabel} · ejemplo`}
            tone={place.unit?.status === "desconectado" ? "warning" : "info"}
          />
          <View style={styles.reference}>
            <AppIcon icon={MapPin} size={20} />
            <AppText style={styles.referenceText}>{place.reference}</AppText>
          </View>
          <View style={styles.arrival}>
            <AppText variant="small" style={{ color: colors.muted }}>
              Llegada al punto de espera · estimación de ejemplo
            </AppText>
            <AppText
              variant="display"
              style={{
                color:
                  place.unit?.status === "desconectado"
                    ? colors.muted
                    : colors.primaryInk,
              }}
            >
              {place.unit?.status === "desconectado"
                ? "No disponible"
                : place.arrivalLabel}
            </AppText>
          </View>
          <AppText variant="small">
            Datos de demostración. No representan la ubicación ni la llegada
            real de un micro.
          </AppText>
          <ActionButton title="Ver ubicación" onPress={onShowLocation} />
        </>
      )}
    </BottomSheetCard>
  );
}
const styles = StyleSheet.create({
  reference: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  referenceText: { flex: 1 },
  arrival: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
