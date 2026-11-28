import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from "react-native";
import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import { AppIcon } from "./AppIcon";
import { AppText } from "./AppText";
import { colors, radius } from "@/theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  secure?: boolean;
};

export function TextField({ label, error, hint, secure, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={s.wrapper}>
      <AppText variant="label" style={s.label}>
        {label}
      </AppText>
      <View style={[s.box, focused && s.boxFocused, error ? s.boxError : null]}>
        <TextInput
          accessibilityLabel={label}
          style={s.input}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hidden ? "Mostrar contraseña" : "Ocultar contraseña"
            }
            onPress={() => setHidden(!hidden)}
            style={{
              minHeight: 48,
              minWidth: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AppIcon
              icon={hidden ? Eye : EyeOff}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={s.error}>{error}</Text>
      ) : hint ? (
        <Text style={s.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginBottom: 0 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  boxFocused: { borderColor: colors.primary },
  boxError: { borderColor: colors.error },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  hint: { fontSize: 11.5, color: "#94A3B8", marginTop: 6, marginLeft: 2 },
  error: { fontSize: 12, color: colors.error, marginTop: 6, marginLeft: 2 },
});
