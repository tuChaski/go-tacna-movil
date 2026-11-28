import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing, touchTarget } from "../theme";
import { AppText } from "./AppText";

interface Props {
  title: string;
  /** Notifica la pulsación; el padre gestiona el negocio y las tareas asíncronas. */
  onPress: () => void;
  variant?: "primary" | "outline" | "danger" | "secondary" | "text";
  disabled?: boolean;
  /** Muestra progreso y bloquea pulsaciones hasta que el padre retire la carga. */
  loading?: boolean;
  /** Sustituye la etiqueta leída cuando el título visible necesita más contexto. */
  accessibilityLabel?: string;
}
/**
 * Botón compartido con colores semánticos, área táctil mínima y estados
 * accesibles de deshabilitado y ocupado. Su altura puede crecer con el texto.
 * El padre controla las propiedades de carga y deshabilitado; este componente
 * no inicia solicitudes ni cambia esos estados por su cuenta al pulsarlo.
 */
export function ActionButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  accessibilityLabel,
}: Props) {
  // Durante la carga se bloquean los envíos repetidos mientras la tarea está pendiente.
  const inactive = disabled || loading;
  const outline = variant === "outline";
  const light = outline || variant === "secondary" || variant === "text";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: inactive
            ? colors.disabled
            : {
                primary: colors.primary,
                secondary: colors.infoBg,
                outline: colors.surface,
                text: "transparent",
                danger: colors.errorInk,
              }[variant],
          borderColor: inactive
            ? colors.disabled
            : outline
              ? colors.border
              : "transparent",
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {loading && <ActivityIndicator color={colors.muted} />}
      <AppText
        variant="label"
        style={{
          color: inactive
            ? colors.muted
            : light
              ? colors.primaryInk
              : colors.surface,
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {title}
      </AppText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    ...touchTarget,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.compact,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
});
