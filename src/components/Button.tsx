import { ActionButton } from "./ActionButton";

/**
 * Conserva la interfaz Button de las vistas de autenticación y reutiliza los
 * estilos y la accesibilidad de ActionButton de Fase 2. Si no recibe una función
 * de pulsación, queda deshabilitado; este adaptador no envía ni valida formularios.
 */
export function Button({
  title,
  onPress,
  variant = "primary",
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
}) {
  return (
    <ActionButton
      title={title}
      onPress={onPress ?? (() => {})}
      variant={variant}
      disabled={!onPress}
    />
  );
}
