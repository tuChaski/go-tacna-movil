import { DevSettings, Platform, View } from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { AppNavigator } from "../navigation/AppNavigator";
import { FontReadyContext } from "../components/AppText";
import { ScreenStateView } from "../components/ScreenStateView";

/**
 * Carga los tres pesos de Inter una vez antes de montar la pila de navegación.
 * Mientras espera muestra el estado de carga; si falla, permite abrir la aplicación
 * con fuentes nativas mediante FontReadyContext para no bloquear el acceso.
 * Este contenedor inicializa recursos visuales, no servicios de telemetría o GPS.
 */
let menuRegistered = false;
export default function RootLayout() {
  // El acceso nativo vive en el menú de desarrollo. En web se usa /ui-preview.
  useEffect(() => {
    if (__DEV__ && Platform.OS !== "web" && !menuRegistered) {
      DevSettings.addMenuItem("Go Tacna · Revisión de interfaz", () =>
        router.push("/ui-preview"),
      );
      menuRegistered = true;
    }
  }, []);
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  if (!loaded && !error)
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <ScreenStateView status="loading" />
      </View>
    );
  return (
    <FontReadyContext.Provider value={loaded}>
      <StatusBar style="dark" />

      <AppNavigator />
    </FontReadyContext.Provider>
  );
}
