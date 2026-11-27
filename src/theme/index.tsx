/**
 * Valores visuales compartidos por pantallas y controles reutilizables de Fase 2.
 * Los colores Ink aportan texto oscuro sobre sus fondos claros Bg; los colores
 * de acento no sustituyen automáticamente a los adecuados para texto pequeño.
 * Centralizar los valores evita diferencias de paleta entre pantallas.
 */
export const colors = {
  primary: "#2563EB",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  muted: "#475569",
  border: "#E2E8F0",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  success: "#16A34A",
  successBg: "#F0FDF4",
  infoBg: "#EFF6FF",
  primaryDark: "#1D4ED8",
  primaryInk: "#1E40AF",
  successInk: "#166534",
  warningInk: "#92400E",
  warningBg: "#FFFBEB",
  errorInk: "#991B1B",
  disabled: "#E2E8F0",
  backdrop: "rgba(15,23,42,0.55)",
};
/** Radios coherentes para controles, tarjetas, fichas e indicadores redondeados. */
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };
/** Escala de espaciado de cuatro puntos con un nivel compacto para vistas densas. */
export const spacing = {
  xs: 4,
  sm: 8,
  compact: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
/** Los tamaños mínimos permiten crecer según el contenido y la escala de fuente. */
export const touchTarget = { minWidth: 48, minHeight: 48 };
/**
 * Tamaños, alturas de línea y pesos del texto nativo. AppText relaciona los pesos
 * con archivos Inter cargados; si fallan, estos valores admiten la fuente del sistema.
 */
export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
  title: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  label: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
};
