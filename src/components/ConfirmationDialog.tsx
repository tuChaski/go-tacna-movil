import { Modal, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import { AppText } from "./AppText";
import { ActionButton } from "./ActionButton";

/**
 * Confirmación controlada para finalizar un recorrido de demostración.
 * El padre gestiona `visible`; las funciones comunican la decisión del usuario sin
 * modificar aquí el recorrido. Atrás de Android y el gesto de escape accesible
 * cancelan, de modo que cerrar el diálogo no ejecuta por accidente la finalización.
 */
export function ConfirmationDialog({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onCancel}
          style={styles.dialog}
        >
          <AppText variant="heading" accessibilityRole="header">
            ¿Finalizar el recorrido?
          </AppText>
          <AppText>
            Se cerrará este recorrido de prueba. Puedes continuar si lo pulsaste
            por error.
          </AppText>
          <ActionButton
            title="Continuar recorrido"
            variant="outline"
            onPress={onCancel}
          />
          <ActionButton
            title="Finalizar recorrido"
            variant="danger"
            onPress={onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
});
