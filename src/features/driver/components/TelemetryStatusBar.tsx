import { StyleSheet, View } from "react-native";
import { StatusBadge } from "../../../components/StatusBadge";
import { spacing } from "../../../theme";
import type { ScreenStatus } from "../../../types/ui";

/**
 * Convierte el escenario visual y el estado local del recorrido en indicadores.
 * Las etiquetas de GPS y red son simuladas; aquí no se consultan sensores,
 * permisos ni servicios de conectividad. El texto explica cada estado junto con
 * su color. La consola sitúa este panel fuera del cuerpo desplazable para mantenerlo visible.
 */
export function TelemetryStatusBar({
  status,
  active,
}: {
  status: ScreenStatus;
  active: boolean;
}) {
  const gps =
    status === "permission-denied"
      ? "Sin permiso"
      : status === "loading"
        ? "Buscando señal"
        : active
          ? "Activo"
          : "Inactivo";
  const network =
    status === "offline"
      ? "Sin conexión"
      : status === "loading"
        ? "Reconectando"
        : status === "error"
          ? "No disponible"
          : "Conectado";
  return (
    <View style={styles.row}>
      <StatusBadge
        label={`GPS: ${gps}`}
        tone={
          status === "permission-denied"
            ? "warning"
            : active
              ? "success"
              : "neutral"
        }
      />
      <StatusBadge
        label={`Red: ${network}`}
        tone={
          status === "offline" || status === "error"
            ? "error"
            : status === "loading"
              ? "warning"
              : "success"
        }
      />
      <StatusBadge
        label={`Recorrido: ${active ? "En curso" : "Inactivo"}`}
        tone={active ? "success" : "neutral"}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
