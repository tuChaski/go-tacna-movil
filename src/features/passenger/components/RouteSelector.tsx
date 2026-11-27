import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme";
import type { PreviewRoute } from "../data/passengerPreview";

/**
 * Selector controlado: una pulsación comunica el id de la ruta y el padre aporta
 * `selectedId` en el siguiente renderizado. No confirma ni consulta servicios, así
 * la selección requiere una sola acción dentro del flujo del pasajero.
 * El modo compacto distribuye tarjetas pequeñas en filas y omite descripciones;
 * conserva nombres, estado accesible de selección y dimensiones táctiles mínimas.
 */
export function RouteSelector({
  routes,
  selectedId,
  onSelect,
  compact = false,
}: {
  routes: PreviewRoute[];
  selectedId?: number;
  onSelect: (id: number) => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.list, compact && styles.compactList]}>
      {routes.map(({ route, label, description }) => (
        <Pressable
          key={route.id}
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar ${route.nombre_ruta}`}
          accessibilityState={{ selected: selectedId === route.id }}
          onPress={() => onSelect(route.id)}
          style={({ pressed }) => [
            styles.card,
            compact && styles.compactCard,
            {
              borderColor:
                selectedId === route.id ? colors.primary : colors.border,
              backgroundColor: pressed ? colors.infoBg : colors.surface,
            },
          ]}
        >
          <View style={[styles.number, compact && { width: 32, height: 40 }]}>
            <AppText variant="heading" style={{ color: colors.surface }}>
              {label}
            </AppText>
          </View>
          <View style={styles.copy}>
            <AppText variant="label">{route.nombre_ruta}</AppText>
            {!compact && (
              <AppText variant="small" style={{ color: colors.muted }}>
                {description}
              </AppText>
            )}
          </View>
          <AppText style={{ color: colors.primary }}>
            {selectedId === route.id ? "✓" : "›"}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  compactList: { flexDirection: "row", flexWrap: "wrap" },
  compactCard: {
    flex: 1,
    minWidth: 140,
    minHeight: 72,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    ...touchTarget,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  number: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: spacing.xs },
});
