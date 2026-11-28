import { View } from "react-native";
import { AppText } from "../../../components/AppText";
import type { PassengerMapProps } from "./PassengerMapView";

/** En navegadores se conserva la lista accesible sin importar el módulo cartográfico nativo. */
export function PassengerMapView(_props: PassengerMapProps) {
  return (
    <View style={{ minHeight: 148, padding: 16, paddingRight: 68 }}>
      <AppText>
        El mapa interactivo está disponible en la aplicación móvil.
      </AppText>
    </View>
  );
}
