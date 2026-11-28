import { router } from "expo-router";
import { AuthLayout } from "@/components/AuthLayout";
import { ActionButton } from "@/components/ActionButton";
import { useState } from "react";
import { TextField } from "@/components/TextField";
import { AlertBox } from "@/components/AlertBox";
/** Valida los campos de demostración. Ninguna credencial se envía ni se guarda. */
export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [submitted, submit] = useState(false);
  const [example, showExample] = useState(false);
  return (
    <AuthLayout
      title="Iniciar sesión"
      description="Demostración de acceso. Utiliza datos de ejemplo."
    >
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          showExample(false);
        }}
        placeholder="nombre@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={
          submitted && !email.trim()
            ? "Ingresa tu correo electrónico."
            : undefined
        }
      />
      <TextField
        label="Contraseña"
        value={pass}
        onChangeText={(v) => {
          setPass(v);
          showExample(false);
        }}
        secure
        error={submitted && !pass ? "Ingresa tu contraseña." : undefined}
      />
      {example && (
        <AlertBox
          variant="info"
          title="Acceso de demostración"
          message="La verificación de cuentas aún está en desarrollo."
        />
      )}
      <ActionButton
        title="Ingresar"
        onPress={() => {
          submit(true);
          showExample(Boolean(email.trim() && pass));
        }}
      />
      <ActionButton
        title="Crear cuenta de pasajero"
        variant="text"
        onPress={() => router.push("/register")}
      />
      {example && (
        <ActionButton
          title="Explorar rutas"
          variant="secondary"
          onPress={() => router.replace("/passenger")}
        />
      )}
    </AuthLayout>
  );
}
