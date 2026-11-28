import { Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { colors, touchTarget } from "../theme";
import { AppIcon } from "./AppIcon";
/** Da nombre accesible y superficie táctil a un control cartográfico compacto. */
export function IconButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        ...touchTarget,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? colors.infoBg : colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <AppIcon icon={icon} color={disabled ? colors.muted : colors.navy} />
    </Pressable>
  );
}
