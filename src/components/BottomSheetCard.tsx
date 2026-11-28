import { useReducedMotion } from "react-native-reanimated";
import { useMemo, useState, type PropsWithChildren } from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, touchTarget } from "../theme";
import { AppText } from "./AppText";
import { ActionButton } from "./ActionButton";

/**
 * Muestra el detalle sobre un fondo modal que permite cerrar la ficha.
 * El componente padre controla `visible`, `title` y la función de cierre; solo
 * la altura expandida es estado local. El contenido interior se desplaza aparte.
 *
 * Al soltar un gesto vertical sobre el tirador se expande o cierra la ficha;
 * la posición no sigue continuamente el dedo. Los botones del tirador y de cierre
 * ofrecen las mismas acciones sin exigir un gesto de deslizamiento.
 */
export function BottomSheetCard({
  visible,
  title,
  onClose,
  children,
}: PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Captura el movimiento vertical solo en el tirador para respetar el
  // desplazamiento del contenido y los gestos horizontales. Se actualiza cuando
  // cambia la función de cierre recibida del componente padre.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 12 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 60) onClose();
          else if (gesture.dy < -30) setExpanded(true);
        },
      }),
    [onClose],
  );
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduced ? "none" : "slide"}
      onRequestClose={onClose}
      onDismiss={() => setExpanded(false)}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={[
            styles.sheet,
            {
              height: height * (expanded ? 0.87 : 0.52),
              // Mantiene la última acción fuera del área inferior reservada del dispositivo.
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          <View {...pan.panHandlers}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={expanded ? "Contraer ficha" : "Ampliar ficha"}
              accessibilityState={{ expanded }}
              onPress={() => setExpanded(!expanded)}
              style={styles.handleArea}
            >
              <View style={styles.handle} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <AppText variant="heading" accessibilityRole="header">
              {title}
            </AppText>
            {children}
            <ActionButton
              title="Cerrar ficha"
              variant="text"
              onPress={onClose}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.backdrop,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handleArea: {
    ...touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
});
