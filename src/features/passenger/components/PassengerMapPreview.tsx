import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Line, Path, Rect } from "react-native-svg";
import { AppText } from "../../../components/AppText";
import { colors, radius, spacing, touchTarget } from "../../../theme";
import type { PassengerPlace } from "../data/passengerPreview";

/**
 * Mapa ilustrativo para revisar el flujo de interacción del pasajero.
 * Las calles y la ruta son dibujos SVG estáticos, no datos geográficos ni en vivo.
 * Los marcadores se colocan por orden y porcentajes; no se proyectan las lat/lng
 * de las unidades. Este componente no es un SDK de mapas ni un rastreador.
 *
 * Cada marcador es un control etiquetado que ejecuta `onSelect(place)` al pulsarlo.
 * `focusedKey` resalta el lugar elegido por el padre sin mover una cámara de mapa.
 * Si la lista está vacía, pide elegir una ruta antes de mostrar vehículos de ejemplo.
 */
export function PassengerMapPreview({
  places,
  onSelect,
  focusedKey,
}: {
  places: PassengerPlace[];
  onSelect: (place: PassengerPlace) => void;
  focusedKey?: string;
}) {
  return (
    <View style={styles.map}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 300"
        preserveAspectRatio="none"
        accessible={false}
      >
        <Rect width="340" height="300" fill="#EAF0F5" />
        <Rect x="240" y="30" width="80" height="100" fill="#DBEBDD" rx="12" />
        {[60, 140, 220, 300].map((x) => (
          <Line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="300"
            stroke="white"
            strokeWidth="14"
          />
        ))}
        {[60, 145, 230].map((y) => (
          <Line
            key={y}
            x1="0"
            y1={y}
            x2="340"
            y2={y}
            stroke="white"
            strokeWidth="14"
          />
        ))}
        {places.length > 0 && (
          <Path
            d="M 60 300 L 60 230 L 140 230 L 140 145 L 220 145 L 220 60 L 340 60"
            stroke={colors.primary}
            strokeWidth="6"
            fill="none"
          />
        )}
      </Svg>
      <View pointerEvents="none" style={styles.caption}>
        <AppText variant="small" style={{ color: colors.muted }}>
          TACNA · MAPA ILUSTRATIVO
        </AppText>
      </View>
      {places.map((place, index) => (
        <Pressable
          key={place.key}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${place.title}`}
          accessibilityState={{ selected: focusedKey === place.key }}
          onPress={() => onSelect(place)}
          style={({ pressed }) => [
            styles.pin,
            {
              left: index === 0 ? "48%" : index === 1 ? "22%" : "57%",
              top: index === 0 ? "29%" : index === 1 ? "60%" : "67%",
              backgroundColor:
                place.kind === "stop" ? colors.surface : colors.primary,
              borderColor:
                focusedKey === place.key ? colors.text : colors.surface,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <AppText
            variant="label"
            style={{
              color: place.kind === "stop" ? colors.primaryInk : colors.surface,
            }}
          >
            {place.kind === "stop" ? "P" : `0${index + 1}`}
          </AppText>
        </Pressable>
      ))}
      {!places.length && (
        <View pointerEvents="none" style={styles.hint}>
          <AppText variant="label">Elige una ruta para explorar</AppText>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  map: {
    height: 300,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  caption: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  pin: {
    ...touchTarget,
    position: "absolute",
    borderRadius: radius.md,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  hint: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
