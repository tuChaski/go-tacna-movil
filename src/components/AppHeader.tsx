import { Pressable, View } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import { AppIcon } from "./AppIcon";
import { AppText } from "./AppText";
import { colors, touchTarget } from "../theme";

/** El recorrido envuelve la ventana de un micro y termina en un punto de parada. */
export function BrandMark() {
  return (
    <Svg width={36} height={36} viewBox="0 0 40 40" accessible={false}>
      <Rect width="40" height="40" rx="11" fill={colors.navy} />
      <Path
        d="M10 29V15q0-6 6-6h9q5 0 5 5v8q0 5-5 5h-6"
        fill="none"
        stroke={colors.mint}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Rect x="15" y="14" width="10" height="7" rx="2" fill="white" />
      <Circle cx="17" cy="27" r="3" fill="white" />
    </Svg>
  );
}

export function AppHeader({
  onBack,
  title = "Go Tacna",
  location,
}: {
  onBack?: () => void;
  title?: string;
  location?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        minHeight: 56,
        backgroundColor: colors.bg,
      }}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          style={{
            ...touchTarget,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppIcon icon={ArrowLeft} color={colors.navy} />
        </Pressable>
      ) : null}
      <BrandMark />
      <AppText variant="heading" style={{ flex: 1, color: colors.navy }}>
        {title}
      </AppText>
      {location && (
        <AppText variant="small" style={{ color: colors.muted }}>
          {location}
        </AppText>
      )}
    </View>
  );
}
