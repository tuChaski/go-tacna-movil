import type { AppError, Result } from "../types/api";

export interface Environment {
  apiBaseUrl?: string;
  wsUrl?: string;
  mapsApiKey?: string;
}

export function validateUrl(
  value: string | undefined,
  protocols: readonly string[],
): Result<string> {
  try {
    const url = new URL(value ?? "");
    if (
      !protocols.includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.hash
    ) {
      throw new Error();
    }
    return { ok: true, data: url.toString() };
  } catch {
    return {
      ok: false,
      error: {
        code: "CONFIGURATION",
        message: "Falta una URL válida en la configuración de conexión.",
      },
    };
  }
}

// Expo requires static property access for environment inlining. All values are public.
export const env: Readonly<Environment> = Object.freeze({
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  wsUrl: process.env.EXPO_PUBLIC_WS_URL,
  mapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
});

export function getConfigurationErrors(config: Environment = env): AppError[] {
  const errors: AppError[] = [];
  for (const [name, value, protocols] of [
    ["API_BASE_URL", config.apiBaseUrl, ["http:", "https:"]],
    ["WS_URL", config.wsUrl, ["http:", "https:"]],
  ] as const) {
    if (!validateUrl(value, protocols).ok) {
      errors.push({
        code: "CONFIGURATION",
        message: `Configura ${name} con una URL válida para habilitar esa conexión.`,
      });
    }
  }
  // MAPS_API_KEY remains optional until a map provider is selected.
  return errors;
}
