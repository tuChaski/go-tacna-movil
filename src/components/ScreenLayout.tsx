import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";
import { AppText } from "./AppText";
import { AppHeader } from "./AppHeader";

/**
 * Proporciona el área segura, encabezado compartido, título y cuerpo desplazable.
 * `persistentContent` queda fuera del desplazamiento para mantener visibles los
 * indicadores del conductor; `compact` reduce espacios sin reducir áreas táctiles.
 * Limita el ancho en pantallas grandes y permite desplazarse en pantallas pequeñas
 * o con texto ampliado. Delega la navegación mediante `onBack` para que cada
 * pantalla pueda aplicar sus reglas de confirmación antes de salir.
 */
export function ScreenLayout({
  title,
  subtitle,
  onBack,
  persistentContent,
  compact = false,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  onBack?: () => void;
  persistentContent?: ReactNode;
  compact?: boolean;
}>) {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader onBack={onBack} />
      {persistentContent && (
        <View style={styles.fixed}>{persistentContent}</View>
      )}
      <ScrollView
        contentContainerStyle={[styles.content, compact && { gap: spacing.md }]}
      >
        <View style={styles.titles}>
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <AppText style={{ color: colors.muted }}>{subtitle}</AppText>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fixed: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.compact,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  titles: { gap: spacing.sm },
});
