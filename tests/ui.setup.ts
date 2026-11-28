// Usa la simulación oficial del paquete para obtener áreas seguras reproducibles
// sin una ventana del dispositivo. Los componentes y sus interacciones son reales.
jest.mock("react-native-safe-area-context", () => {
  const mock = jest.requireActual("react-native-safe-area-context/jest/mock");
  return mock.default;
});

// Jest no dispone del módulo nativo que lee la preferencia de movimiento.
jest.mock("react-native-reanimated", () => ({ useReducedMotion: () => true }));
