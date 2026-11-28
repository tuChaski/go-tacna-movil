import { ConfigurationNotice } from "../components/ConfigurationNotice";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "../components/ActionButton";

import { screenStatuses, type ScreenStatus } from "../types/ui";
import { colors } from "../theme";
import { PassengerHomeScreen } from "../features/passenger/screens/PassengerHomeScreen";
import { DriverConsoleScreen } from "../features/driver/screens/DriverConsoleScreen";

/** Etiquetas en español para todos los escenarios disponibles en los controles. */
const labels: Record<ScreenStatus, string> = {
  ready: "Disponible",
  loading: "Cargando",
  empty: "Vacío",
  "permission-denied": "Sin permiso",
  offline: "Sin conexión",
  error: "Error",
};
/**
 * Galería interna para revisar ambos flujos con escenarios visuales controlados.
 * Recuperar cambia el estado local a ready; no reconecta servicios ni concede
 * permisos nativos. `onBack` sale de la galería mediante el adaptador de ruta.
 * Expo Router protege esta galería en producción. El menú de desarrollo permite abrirla.
 */
export function PreviewScreen({ onBack }: { onBack: () => void }) {
  const [flow, setFlow] = useState<"passenger" | "driver">("passenger");
  const [status, setStatus] = useState<ScreenStatus>("ready");
  const [controls, setControls] = useState(false);
  const [full, setFull] = useState(false);
  const Screen =
    flow === "passenger" ? PassengerHomeScreen : DriverConsoleScreen;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {!full && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            paddingHorizontal: 12,
            gap: 4,
          }}
        >
          <ActionButton
            variant="text"
            title={
              full
                ? "Controles"
                : `${flow === "driver" ? "Conductor" : "Pasajero"} · ${labels[status]} ▾`
            }
            onPress={() => {
              setFull(false);
              setControls(!controls);
            }}
          />
          {!full && (
            <ActionButton variant="text" title="Cerrar" onPress={onBack} />
          )}
        </View>
      )}
      {controls && !full && (
        <ScrollView
          style={{ maxHeight: "45%" }}
          contentContainerStyle={{ padding: 12, gap: 4 }}
        >
          <ConfigurationNotice />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {(["passenger", "driver"] as const).map((key) => (
              <ActionButton
                key={key}
                title={key === "driver" ? "Conductor" : "Pasajero"}
                variant={key === flow ? "primary" : "outline"}
                onPress={() => setFlow(key)}
              />
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {screenStatuses.map((item) => (
              <ActionButton
                key={item}
                title={labels[item]}
                variant={status === item ? "primary" : "outline"}
                onPress={() => {
                  setStatus(item);
                  setControls(false);
                }}
              />
            ))}
          </View>
          <ActionButton
            variant="secondary"
            title="Pantalla completa"
            onPress={() => {
              setFull(true);
              setControls(false);
            }}
          />
        </ScrollView>
      )}
      <Screen
        onBack={full ? () => setFull(false) : undefined}
        embedded
        key={flow}
        status={status}
        onRecover={() => setStatus("ready")}
      />
    </SafeAreaView>
  );
}
