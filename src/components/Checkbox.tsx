import {
  Pressable,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import Check from "lucide-react-native/icons/check";
import { AppIcon } from "./AppIcon";
import { colors } from "@/theme";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({ checked, onChange, label, style }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={[s.row, style]}
    >
      <View style={[s.box, checked && s.boxChecked]}>
        {checked && <AppIcon icon={Check} size={14} color="#fff" />}
      </View>
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { flexShrink: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
});
