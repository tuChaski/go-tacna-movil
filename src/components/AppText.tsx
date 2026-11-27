import { createContext, useContext } from "react";
import { Text, type TextProps } from "react-native";
import { colors, typography } from "../theme";

/**
 * RootLayout informa si los archivos incluidos de Inter se cargaron correctamente.
 * El valor inicial false permite usar la fuente del sistema en vistas aisladas.
 */
export const FontReadyContext = createContext(false);
/**
 * Aplica una definición tipográfica y el color de texto predeterminado a Text.
 * Cuando las fuentes están listas, cada peso selecciona su archivo de Inter.
 * Los estilos recibidos se aplican al final y las propiedades nativas de Text,
 * incluidas accesibilidad y escala, se reenvían sin desactivar la escala del sistema.
 */
export function AppText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: keyof typeof typography }) {
  const loaded = useContext(FontReadyContext);
  const token = typography[variant];
  const family =
    token.fontWeight === "700"
      ? "Inter_700Bold"
      : token.fontWeight === "600"
        ? "Inter_600SemiBold"
        : "Inter_400Regular";
  return (
    <Text
      {...props}
      style={[
        token,
        { color: colors.text },
        // El archivo ya contiene el peso adecuado; evita añadir negrita sintética.
        loaded && { fontFamily: family, fontWeight: "normal" },
        style,
      ]}
    />
  );
}
