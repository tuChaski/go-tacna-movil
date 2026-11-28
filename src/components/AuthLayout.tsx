import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppHeader } from "./AppHeader";
import { AppText } from "./AppText";
import { colors } from "../theme";
/** El formulario se desplaza dentro del área disponible al aparecer el teclado. */
export function AuthLayout({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
            padding: 20,
            gap: 12,
          }}
        >
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <AppText
            variant="small"
            style={{ color: colors.muted, marginBottom: 8 }}
          >
            {description}
          </AppText>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
