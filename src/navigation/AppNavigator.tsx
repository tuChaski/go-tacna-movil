import { Stack } from "expo-router";

/**
 * Declara la pila de Expo Router; los contenedores compartidos muestran encabezados.
 * Los archivos de ruta son adaptadores mínimos y cada módulo gestiona su interacción.
 * Esta pila de Fase 2 no valida roles ni crea sesiones autenticadas.
 */
export function AppNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="passenger" />
      {/* Evita que el gesto de volver de iOS omita la confirmación local de la consola.
          Protege la interacción, pero no constituye una regla de autorización. */}
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="driver" options={{ gestureEnabled: false }} />
        <Stack.Screen name="ui-preview" />
      </Stack.Protected>
    </Stack>
  );
}
