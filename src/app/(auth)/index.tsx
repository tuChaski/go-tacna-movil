import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/Button";
import { MapPreview } from "@/components/MapPreview";
import { colors } from "@/theme";
import { appRoutes } from "@/navigation/routes";

/**
 * Conecta la bienvenida existente con autenticación y demostraciones de Fase 2.
 * Explorar como invitado no requiere cuenta. El acceso del conductor abre una
 * simulación, no una sesión autenticada. El enlace a la galería interna solo se
 * muestra en desarrollo; ocultarlo no aplica un control de acceso a la ruta.
 */
export default function Welcome() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Encabezado */}
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.logo}>
              <Ionicons name="bus" size={16} color="#fff" />
            </View>
            <Text style={s.brandText}>Go Tacna</Text>
          </View>
          <Ionicons
            name="person-circle-outline"
            size={26}
            color={colors.primary}
          />
        </View>

        {/* Ilustración de bienvenida; la exploración interactiva tiene su propia ruta. */}
        <MapPreview />

        {/* Presentación del producto. Las demostraciones identifican los datos simulados. */}
        <Text style={s.title}>Tu transporte, más cerca.</Text>
        <Text style={s.subtitle}>
          Go Tacna te muestra en tiempo real dónde está tu micro y cuánto tarda
          en llegar.
        </Text>

        {/* Acciones de navegación; formularios y sesiones se gestionan en otros módulos. */}
        <View style={s.actions}>
          <Button
            title="Explorar rutas como invitado"
            onPress={() => router.push(appRoutes.passenger)}
          />
          <Button
            title="Iniciar sesión"
            onPress={() => router.push("/login")}
          />
          <Button
            title="Crear cuenta"
            variant="outline"
            onPress={() => router.push("/register")}
          />
          <Button
            title="Probar la vista del conductor"
            variant="outline"
            onPress={() => router.push(appRoutes.driver)}
          />
          {__DEV__ && (
            <Button
              title="Revisar estados de interfaz"
              variant="outline"
              onPress={() => router.push(appRoutes.preview)}
            />
          )}
        </View>

        <Text style={s.footer}>
          El registro público es exclusivo para pasajeros.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: 16, fontWeight: "700", color: colors.text },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: { gap: 12 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: colors.muted,
    marginTop: 16,
  },
});
