import ArrowLeft from "lucide-react-native/icons/arrow-left";
import BusFront from "lucide-react-native/icons/bus-front";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing, touchTarget } from "../theme";
import { AppIcon } from "./AppIcon";
import { AppText } from "./AppText";

/**
 * Muestra la barra de marca compartida y un botón Volver opcional con etiqueta.
 * `onBack` solo comunica la intención: la pantalla decide si navega o solicita
 * confirmación. El área táctil supera el tamaño de la flecha decorativa y el ancho
 * interior respeta el mismo límite del contenido en pantallas grandes.
 */
export function AppHeader({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.brand}>
          <View style={styles.mark}>
            <AppIcon icon={BusFront} color={colors.surface} size={22} />
          </View>
          <AppText variant="heading" style={[styles.white, { flexShrink: 1 }]}>
            Go Tacna
          </AppText>
        </View>
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={onBack}
            style={({ pressed }) => [
              styles.back,
              { opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <AppIcon icon={ArrowLeft} color={colors.surface} />
            <AppText variant="small" style={styles.white}>
              Volver
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  bar: { backgroundColor: colors.primaryDark },
  inner: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    ...touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  white: { color: colors.surface },
});
