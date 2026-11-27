import { router } from "expo-router";
import { DriverConsoleScreen } from "../features/driver/screens/DriverConsoleScreen";
import { appRoutes } from "../navigation/routes";
/**
 * Conecta Expo Router con la consola sin acoplarla a las API de navegación.
 * La consola solicita volver una vez resuelta la confirmación del recorrido activo.
 * Reemplazar la ruta vuelve a bienvenida sin conservar esta simulación en el historial.
 */
export default function DriverRoute() {
  return (
    <DriverConsoleScreen onBack={() => router.replace(appRoutes.welcome)} />
  );
}
