import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { ConfigurationNotice } from "../components/ConfigurationNotice";
import { AppNavigator } from "../navigation/AppNavigator";
import { FontReadyContext } from "../components/AppText";
import { ScreenStateView } from "../components/ScreenStateView";
import { View } from "react-native";

/**
 * Carga los tres pesos de Inter una vez antes de montar la pila de navegación.
 * Mientras espera muestra el estado de carga; si falla, permite abrir la aplicación
 * con fuentes nativas mediante FontReadyContext para no bloquear el acceso.
 * Este contenedor inicializa recursos visuales, no servicios de telemetría o GPS.
 */
export default function RootLayout() {
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
      <ConfigurationNotice />
      <AppNavigator />
    </FontReadyContext.Provider>
  );
}
