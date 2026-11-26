import { Pressable, StyleSheet } from "react-native";
import { AppText } from "../../../components/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme";
import Play from "lucide-react-native/icons/play";
import Square from "lucide-react-native/icons/square";
import { AppIcon } from "../../../components/AppIcon";

/**
 * Interruptor grande y controlado que comunica inicio o fin mediante `onToggle`.
 * `active` determina texto, icono, color y estado accesible de activación; no cambia
 * inmediatamente al pulsar porque finalizar requiere la confirmación del padre.
 * `disabled` bloquea la interacción cuando no se puede iniciar otra simulación.
 * La altura mínima y el texto flexible mantienen un área táctil amplia en móvil.
 */
export function TripToggleButton({
  active,
  disabled,
  onToggle,
}: {
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Recorrido de prueba"
      accessibilityState={{ checked: active, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.control,
        {
          backgroundColor: disabled
            ? colors.disabled
            : active
              ? colors.errorInk
              : colors.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppIcon
        icon={active ? Square : Play}
        color={disabled ? colors.muted : colors.surface}
        size={24}
      />
      <AppText
        variant="heading"
        style={{
          color: disabled ? colors.muted : colors.surface,
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {active
          ? "Finalizar recorrido de prueba"
          : "Iniciar recorrido de prueba"}
      </AppText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  control: {
    ...touchTarget,
    minHeight: 80,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.compact,
  },
});
