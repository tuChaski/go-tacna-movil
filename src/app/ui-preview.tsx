import { router } from "expo-router";
import { PreviewScreen } from "../dev/PreviewScreen";
import { appRoutes } from "../navigation/routes";
/**
 * Adaptador de ruta para la galería interna de escenarios de interfaz. Al salir
 * reemplaza la ruta por bienvenida; la galería solo gestiona controles de revisión
 * y estado visual local.
 */
export default function PreviewRoute() {
  return <PreviewScreen onBack={() => router.replace(appRoutes.welcome)} />;
}
