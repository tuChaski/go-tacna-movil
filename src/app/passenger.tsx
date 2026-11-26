import { router } from "expo-router";
import { PassengerHomeScreen } from "../features/passenger/screens/PassengerHomeScreen";
import { appRoutes } from "../navigation/routes";
/**
 * Expone la exploración como invitado mediante una ruta de Expo Router.
 * Volver reemplaza esta entrada por bienvenida, separando la navegación de la
 * vista reutilizable del pasajero. La demostración no requiere una cuenta.
 */
export default function PassengerRoute() {
  return (
    <PassengerHomeScreen onBack={() => router.replace(appRoutes.welcome)} />
  );
}
