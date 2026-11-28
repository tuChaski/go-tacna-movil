import { View, Text, StyleSheet } from "react-native";
import Info from "lucide-react-native/icons/info";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import CircleCheck from "lucide-react-native/icons/circle-check";
import { AppIcon } from "./AppIcon";
import { colors, radius } from "@/theme";

type Props = {
  variant: "error" | "info" | "success";
  title: string;
  message?: string;
};

const CONFIG = {
  error: { bg: colors.errorBg, fg: colors.error, icon: CircleAlert },
  info: { bg: colors.infoBg, fg: colors.primary, icon: Info },
  success: { bg: colors.successBg, fg: colors.success, icon: CircleCheck },
} as const;

export function AlertBox({ variant, title, message }: Props) {
  const c = CONFIG[variant];
  return (
    <View style={[s.box, { backgroundColor: c.bg }]}>
      <View style={s.row}>
        <AppIcon icon={c.icon} size={16} color={c.fg} />
        <Text style={[s.title, { color: c.fg }]}>{title}</Text>
      </View>
      {message ? (
        <Text style={[s.message, { color: c.fg }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: radius.md, padding: 12, marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 13, fontWeight: "700" },
  message: { fontSize: 12, marginTop: 4, lineHeight: 17 },
});
