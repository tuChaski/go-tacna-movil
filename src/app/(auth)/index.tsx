import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { MapPreview } from '@/components/MapPreview';
import { colors } from '@/theme';

export default function Welcome() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.logo}>
              <Ionicons name="bus" size={16} color="#fff" />
            </View>
            <Text style={s.brandText}>Go Tacna</Text>
          </View>
          <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
        </View>

        {/* Mapa */}
        <MapPreview />

        {/* Texto */}
        <Text style={s.title}>Tu transporte, más cerca.</Text>
        <Text style={s.subtitle}>
          Go Tacna te muestra en tiempo real dónde está tu micro y cuánto tarda en llegar.
        </Text>

        {/* Botones */}
        <View style={s.actions}>
          <Button title="Iniciar sesión" onPress={() => router.push('/login')} />
          <Button title="Crear cuenta" variant="outline" onPress={() => router.push('/register')} />
        </View>

        <Text style={s.footer}>El registro público es exclusivo para pasajeros.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 16, fontWeight: '700', color: colors.text },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 24 },
  actions: { gap: 12 },
  footer: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 16 },
});