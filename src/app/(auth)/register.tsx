import { router } from "expo-router";
import { AuthLayout } from "@/components/AuthLayout";
import { ActionButton } from "@/components/ActionButton";
import { useState } from "react";
import { Checkbox } from "@/components/Checkbox";
import { TextField } from "@/components/TextField";
import { AppText } from "@/components/AppText";
import { colors } from "@/theme";
type Errors = {
  name?: string;
  email?: string;
  pass?: string;
  confirm?: string;
  terms?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Ingresa tu nombre.";
    if (!EMAIL_REGEX.test(email.trim()))
      e.email = "Ingresa un correo válido, por ejemplo nombre@correo.com.";
    if (pass.length < 8) e.pass = "Usa al menos 8 caracteres.";
    if (confirm !== pass || !confirm)
      e.confirm = "Las contraseñas no coinciden.";
    if (!terms) e.terms = "Debes aceptar los términos y condiciones.";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // La confirmación informa que se completó únicamente la validación local.
    router.replace("/success");
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      description="Registro de pasajero · Demostración con datos de ejemplo."
    >
      <TextField
        label="Nombre"
        placeholder="Tu nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        error={errors.name}
      />

      <TextField
        label="Correo electrónico"
        placeholder="nombre@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
      />

      <TextField
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        secure
        value={pass}
        onChangeText={setPass}
        error={errors.pass}
      />

      <TextField
        label="Confirmar contraseña"
        placeholder="Repite tu contraseña"
        secure
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
      />

      <Checkbox
        checked={terms}
        onChange={setTerms}
        label="Acepto términos y condiciones"
      />

      {errors.terms && (
        <AppText variant="small" style={{ color: colors.errorInk }}>
          {errors.terms}
        </AppText>
      )}
      <ActionButton title="Crear cuenta" onPress={onSubmit} />
      <ActionButton
        title="Ya tengo cuenta · Iniciar sesión"
        variant="text"
        onPress={() => router.replace("/login")}
      />
    </AuthLayout>
  );
}
