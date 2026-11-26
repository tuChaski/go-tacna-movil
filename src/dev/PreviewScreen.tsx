import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "../components/ActionButton";
import { AppText } from "../components/AppText";
import { screenStatuses, type ScreenStatus } from "../types/ui";
import { colors, spacing } from "../theme";
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
 * La bienvenida muestra el acceso durante desarrollo como ayuda; ocultarlo no
 * constituye una regla de autenticación o autorización para esta ruta.
 */
export function PreviewScreen({ onBack }: { onBack: () => void }) {
  const [flow, setFlow] = useState<"passenger" | "driver">("passenger");
  const [status, setStatus] = useState<ScreenStatus>("ready");
  const Screen =
    flow === "passenger" ? PassengerHomeScreen : DriverConsoleScreen;
  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.controls}>
        <AppText variant="label">Revisión interna de interfaz</AppText>
        <ScrollView horizontal contentContainerStyle={styles.row}>
          <ActionButton
            title="Pasajero"
            onPress={() => setFlow("passenger")}
            variant={flow === "passenger" ? "primary" : "outline"}
          />
          <ActionButton
            title="Conductor"
            onPress={() => setFlow("driver")}
            variant={flow === "driver" ? "primary" : "outline"}
          />
          <ActionButton
            title="Salir de revisión"
            onPress={onBack}
            variant="outline"
          />
        </ScrollView>
        <ScrollView horizontal contentContainerStyle={styles.row}>
          {screenStatuses.map((item) => (
            <ActionButton
              key={item}
              title={labels[item]}
              onPress={() => setStatus(item)}
              variant={status === item ? "primary" : "outline"}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
      {/* Cambiar de flujo vuelve a montar la pantalla y libera su estado y temporizador.
          Cambiar de escenario los conserva para revisar un recorrido activo sin red. */}
      <Screen key={flow} status={status} onRecover={() => setStatus("ready")} />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  controls: {
    padding: spacing.compact,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  row: { gap: spacing.sm },
});
