import { router } from "expo-router";
import { AuthLayout } from "@/components/AuthLayout";
import { ActionButton } from "@/components/ActionButton";
/** El registro de prueba termina aquí sin crear una cuenta en el servidor. */
export default function Success() {
  return (
    <AuthLayout
      title="Formulario completado"
      description="Terminaste el registro de demostración. Puedes explorar el mapa como invitado."
    >
      <ActionButton
        title="Explorar rutas"
        onPress={() => router.replace("/passenger")}
      />
    </AuthLayout>
  );
}
