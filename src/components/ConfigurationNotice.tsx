import { Text, View } from "react-native";
import { getConfigurationErrors } from "../config/env";

export function ConfigurationNotice() {
  if (!__DEV__) return null;
  const errors = getConfigurationErrors();
  if (!errors.length) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{ padding: 12, backgroundColor: "#FFF4D6" }}
    >
      {errors.map((error) => (
        <Text key={error.message} style={{ color: "#614400" }}>
          {error.message}
        </Text>
      ))}
    </View>
  );
}
