import { ScrollView, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { AppText } from "@/components/AppText";
import { ActionButton } from "@/components/ActionButton";
import { MapPreview } from "@/components/MapPreview";
import { colors } from "@/theme";

/** La bienvenida ofrece exploración pública y acceso a los formularios de pasajero. */
export default function Welcome() {
  const { height } = useWindowDimensions();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader location="Tacna, Perú" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          width: "100%",
          maxWidth: 600,
          alignSelf: "center",
          padding: 20,
          gap: 16,
          justifyContent: "center",
        }}
      >
        <View style={{ height: Math.min(310, Math.max(166, height * 0.3)) }}>
          <MapPreview />
        </View>
        <AppText
          variant="display"
          accessibilityRole="header"
          style={{ color: colors.navy }}
        >
          Tu ciudad, más cerca.
        </AppText>
        <AppText style={{ color: colors.muted }}>
          Encuentra tu ruta y consulta los micros disponibles en Tacna.
        </AppText>
        <View style={{ gap: 4, marginTop: 8 }}>
          <ActionButton
            title="Explorar rutas"
            onPress={() => router.push("/passenger")}
          />
          <ActionButton
            title="Iniciar sesión"
            variant="secondary"
            onPress={() => router.push("/login")}
          />
          <ActionButton
            title="¿No tienes cuenta? Regístrate"
            variant="text"
            onPress={() => router.push("/register")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
