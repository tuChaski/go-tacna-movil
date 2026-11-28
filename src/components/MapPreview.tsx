import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { View } from "react-native";
import { colors } from "../theme";
/** Cartel vectorial inspirado en el arco parabólico y las lomas de Tacna.
 * El trazo y los vehículos son ilustrativos, independientes del catálogo y la telemetría. */
export function MapPreview() {
  return (
    <View
      accessible
      accessibilityLabel="Ilustración del Arco de Tacna y un micro entre las lomas"
      style={{
        flex: 1,
        overflow: "hidden",
        borderRadius: 18,
        backgroundColor: colors.navy,
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 360 242"
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect width="360" height="242" fill="#CDEBE8" />
        <Circle cx="283" cy="54" r="29" fill="#FFD39A" />
        <Path
          d="M-10 109 65 70 114 97 184 53 257 91 321 69 375 86V150H-10Z"
          fill="#8FBEBF"
        />
        <Path
          d="m-10 125 72-21 48 8 83-31 72 28 47-13 54 15v60H-10Z"
          fill="#689697"
        />
        <Path d="M0 131h360v111H0Z" fill="#24465A" />
        <Path
          d="m0 138 360 47m-360-32 360 46m-360-29 360 45M50 242l131-110m-31 110 94-110m28 110 46-110"
          stroke="#456476"
          strokeWidth="2"
        />
        <Path
          d="M212 137q7-65 36-79 29 14 36 79h-10q-7-47-26-62-20 15-26 62Z"
          fill="#F6D5AC"
        />
        <Path
          d="M-9 214 82 172q7-3 17-1l55 9q7 2 16-2l93-38q8-4 18-2l92 18"
          fill="none"
          stroke="#102E43"
          strokeWidth="15"
        />
        <Path
          d="M-9 214 82 172q7-3 17-1l55 9q7 2 16-2l93-38q8-4 18-2l92 18"
          fill="none"
          stroke="#A5E9CD"
          strokeWidth="5"
        />
        {[
          [48, 188],
          [178, 174],
          [306, 143],
        ].map(([x, y]) => (
          <Circle
            key={x}
            cx={x}
            cy={y}
            r="5"
            fill="white"
            stroke="#1D5261"
            strokeWidth="3"
          />
        ))}
        <G transform="translate(89 141) rotate(8)">
          <Rect width="52" height="27" rx="6" fill="#FFD39A" />
          <Rect x="4" y="4" width="34" height="11" rx="2" fill="#24465A" />
          <Rect x="41" y="4" width="7" height="18" rx="2" fill="#24465A" />
          <Path d="M15 4v11m12-11v11" stroke="#FFD39A" strokeWidth="2" />
          <Circle cx="10" cy="26" r="5" fill="#112C43" />
          <Circle cx="43" cy="26" r="5" fill="#112C43" />
        </G>
      </Svg>
    </View>
  );
}
