import { View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { colors } from "../theme";

/**
 * Muestra un icono Lucide con grosor compartido y tamaño y color opcionales.
 * El contenedor ignora las pulsaciones para que las reciba el control exterior.
 * Los iconos son decorativos: el padre debe proporcionar el texto accesible de
 * la acción y su área táctil, sin depender del dibujo para explicar su significado.
 */
export function AppIcon({
  icon: Icon,
  size = 20,
  color = colors.primary,
}: {
  icon: LucideIcon;
  size?: number;
  color?: string;
}) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Icon size={size} color={color} strokeWidth={1.7} />
    </View>
  );
}
