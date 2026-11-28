import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import { screenStateContent, type ScreenStatus } from "../types/ui";
import { ActionButton } from "./ActionButton";
import { AppText } from "./AppText";
import BusFront from "lucide-react-native/icons/bus-front";
import MapPinOff from "lucide-react-native/icons/map-pin-off";
import TriangleAlert from "lucide-react-native/icons/triangle-alert";
import WifiOff from "lucide-react-native/icons/wifi-off";
import { AppIcon } from "./AppIcon";

/**
 * Presenta uno de los cinco escenarios no disponibles con textos compartidos.
 * `message` permite aportar contexto del dominio; `onAction` delega la recuperación.
 * Solo aparece un botón si existen etiqueta y función de acción, por lo que el
 * estado de carga no ofrece un reintento que no corresponda.
 *
 * Las propiedades de región dinámica y alerta anuncian el estado cuando se admiten.
 * La vista no reintenta automáticamente, solicita permisos ni expone excepciones
 * internas del backend. El lector de pantalla del dispositivo requiere revisión manual.
 */
export function ScreenStateView({
  status,
  onAction,
  message,
}: {
  status: Exclude<ScreenStatus, "ready">;
  onAction?: () => void;
  message?: string;
}) {
  const content = screenStateContent[status];
  const Icon =
    status === "offline"
      ? WifiOff
      : status === "permission-denied"
        ? MapPinOff
        : status === "empty"
          ? BusFront
          : TriangleAlert;
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={status === "error" ? "alert" : undefined}
      style={styles.card}
    >
      <View style={styles.iconHalo}>
        {status === "loading" ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <AppIcon icon={Icon} size={24} />
        )}
      </View>
      <AppText
        variant="heading"
        accessibilityRole="header"
        style={styles.centered}
      >
        {content.title}
      </AppText>
      <AppText style={styles.message}>{message ?? content.message}</AppText>
      {content.action && onAction && (
        <View style={styles.action}>
          <ActionButton title={content.action} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  message: { color: colors.muted, textAlign: "center" },
  centered: { textAlign: "center" },
  action: { alignSelf: "stretch", marginTop: spacing.sm },
  iconHalo: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.infoBg,
    alignItems: "center",
    justifyContent: "center",
  },
});
