import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import type { StatusTone } from "../types/ui";
import { AppText } from "./AppText";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import CircleCheck from "lucide-react-native/icons/circle-check";
import CircleMinus from "lucide-react-native/icons/circle-minus";
import Info from "lucide-react-native/icons/info";
import TriangleAlert from "lucide-react-native/icons/triangle-alert";
import { AppIcon } from "./AppIcon";

/** Asocia cada significado con fondo, texto legible e icono de apoyo. */
const tones = {
  info: {
    background: colors.infoBg,
    foreground: colors.primaryInk,
    icon: Info,
  },
  success: {
    background: colors.successBg,
    foreground: colors.successInk,
    icon: CircleCheck,
  },
  warning: {
    background: colors.warningBg,
    foreground: colors.warningInk,
    icon: TriangleAlert,
  },
  error: {
    background: colors.errorBg,
    foreground: colors.errorInk,
    icon: CircleAlert,
  },
  neutral: {
    background: colors.bg,
    foreground: colors.muted,
    icon: CircleMinus,
  },
};
/**
 * Muestra una etiqueta de estado no interactiva proporcionada por el padre.
 * Texto e icono acompañan el color para que el significado no dependa solo del tono.
 * No comprueba red, GPS ni antigüedad de datos; únicamente presenta `label` con
 * el tono semántico solicitado mediante `tone`.
 */
export function StatusBadge({
  label,
  tone = "info",
}: {
  label: string;
  tone?: StatusTone;
}) {
  const palette = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <AppIcon icon={palette.icon} color={palette.foreground} size={16} />
      <AppText
        variant="small"
        style={{ color: palette.foreground, flexShrink: 1 }}
      >
        {label}
      </AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 1,
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
});
