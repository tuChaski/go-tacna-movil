/**
 * Ejecuta las pruebas de componentes de Fase 2 en el entorno nativo simulado de Expo.
 * Las pruebas básicas de infraestructura conservan su comando separado con Node.
 */
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/**/*.ui.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/tests/ui.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Usa la implementación CommonJS real de Lucide en Jest, incluidos los iconos
    // individuales, sin sustituirlos por simulaciones ni cargar la entrada ESM conjunta.
    "^lucide-react-native$": require.resolve("lucide-react-native"),
    "^lucide-react-native/icons/(.*)$":
      "<rootDir>/node_modules/lucide-react-native/dist/cjs/icons/$1.js",
  },
  // Expo, React Native y estas dependencias incluyen sintaxis que Jest debe transformar.
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@react-navigation/.*|react-native-svg|react-native-safe-area-context))",
  ],
};
