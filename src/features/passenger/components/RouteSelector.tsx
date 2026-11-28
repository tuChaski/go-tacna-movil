import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import Search from "lucide-react-native/icons/search";
import X from "lucide-react-native/icons/x";
import { AppIcon } from "../../../components/AppIcon";
import { AppText } from "../../../components/AppText";
import { colors, routeColor, touchTarget } from "../../../theme";
import type { PreviewRoute } from "../data/passengerPreview";

/** Trata acentos, espacios y guiones como variantes de la misma búsqueda. */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "");
}
export function routeLabel(name: string) {
  return name.replace(/^(?:línea|linea|ruta)\s+([\d][\w-]*)$/i, "$1");
}
type Choice = PreviewRoute & { companyName?: string };
/** Filtra el catálogo en memoria conservando el orden original dentro de cada grupo. */
export function RouteSelector({
  routes,
  selectedId,
  onSelect,
}: {
  routes: Choice[];
  selectedId?: number;
  onSelect: (id: number) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const term = normalize(query);
    if (!term) return routes;
    const exact: Choice[] = [],
      partial: Choice[] = [];
    for (const item of routes) {
      const terms = [
        item.label,
        item.route.nombre_ruta,
        item.companyName ?? "",
      ].map(normalize);
      if (terms.includes(term)) exact.push(item);
      else if (terms.some((value) => value.includes(term))) partial.push(item);
    }
    return [...exact, ...partial];
  }, [query, routes]);
  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingLeft: 14,
        }}
      >
        <AppIcon icon={Search} size={18} color={colors.muted} />
        <TextInput
          placeholder="¿Qué ruta buscas?"
          accessibilityLabel="Buscar ruta"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={colors.muted}
          style={{ flex: 1, minHeight: 48, color: colors.text, fontSize: 16 }}
        />
        {!!query && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            style={{
              ...touchTarget,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setQuery("")}
          >
            <AppIcon icon={X} />
          </Pressable>
        )}
      </View>
      {results.length ? (
        <FlatList
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          data={results}
          extraData={selectedId}
          keyExtractor={(item) => String(item.route.id)}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const selected = selectedId === item.route.id;
            const tint = routeColor(item.route.id);
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar ${item.route.nombre_ruta}`}
                accessibilityState={{ selected }}
                onPress={() => onSelect(item.route.id)}
                style={({ pressed }) => ({
                  ...touchTarget,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  flexDirection: "row",
                  gap: 7,
                  backgroundColor: selected ? tint : colors.surface,
                  borderWidth: 1,
                  borderColor: selected ? tint : colors.border,
                  opacity: pressed ? 0.72 : 1,
                })}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: selected ? "white" : tint,
                  }}
                />
                <AppText
                  variant="label"
                  style={{ color: selected ? "white" : colors.navy }}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          }}
        />
      ) : (
        !!query && (
          <AppText variant="small">
            Ninguna línea coincide con tu búsqueda.
          </AppText>
        )
      )}
    </View>
  );
}
