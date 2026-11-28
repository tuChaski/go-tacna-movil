import { router, useIsFocused } from "expo-router";
import { AppState } from "react-native";
import { useEffect, useState } from "react";
import { PassengerLiveScreen } from "../features/passenger/screens/PassengerLiveScreen";
import { appRoutes } from "../navigation/routes";

/** Desmonta la sesión al salir o pasar a segundo plano. Así ninguna consulta de
 * ubicación, confirmación ETA o lista de otra sesión se presenta al volver. */
export default function PassengerRoute() {
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", setActive);
    return () => subscription.remove();
  }, []);
  return (
    <PassengerLiveScreen
      active={focused && active !== "background" && active !== "inactive"}
      onBack={() => router.replace(appRoutes.welcome)}
    />
  );
}
