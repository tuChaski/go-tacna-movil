import { env, validateUrl } from "../../config/env";
import { HTTP_TIMEOUT_MS } from "../../config/constants";
import {
  failure,
  type ApiResponse,
  type Result,
  type Validator,
} from "../../types/api";

export interface HttpRequest {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

type RequestInterceptor = (
  request: HttpRequest,
) => HttpRequest | Promise<HttpRequest>;
type ResponseInterceptor = (
  response: ApiResponse<unknown>,
) => ApiResponse<unknown> | Promise<ApiResponse<unknown>>;

/** Single production instance below; the constructor supports isolated tests. */
export class HttpClient {
  private requestInterceptors = new Set<RequestInterceptor>();
  private responseInterceptors = new Set<ResponseInterceptor>();

  constructor(
    private readonly baseUrl: string | undefined,
    private readonly transport: typeof fetch = fetch,
  ) {}

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.add(interceptor);
    return () => {
      this.requestInterceptors.delete(interceptor);
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.add(interceptor);
    return () => {
      this.responseInterceptors.delete(interceptor);
    };
  }

  async request<T>(
    request: HttpRequest,
    validate: Validator<T>,
  ): Promise<Result<ApiResponse<T>>> {
    const base = validateUrl(this.baseUrl, ["http:", "https:"]);
    if (!base.ok) return base;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    const controller = new AbortController();
    try {
      let options = { ...request };
      for (const interceptor of this.requestInterceptors)
        options = await interceptor(options);
      // Relative paths must stay within the configured origin and path prefix.
      if (!options.path || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(options.path)) {
        return failure("CONFIGURATION", "La ruta de consulta no es válida.");
      }
      const root = new URL(
        base.data.endsWith("/") ? base.data : `${base.data}/`,
      );
      const url = new URL(options.path.replace(/^\//, ""), root);
      if (
        url.origin !== root.origin ||
        !url.pathname.startsWith(root.pathname)
      ) {
        return failure("CONFIGURATION", "La ruta de consulta no es válida.");
      }
      const timeoutMs = options.timeoutMs ?? HTTP_TIMEOUT_MS;
      if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
        return failure("CONFIGURATION", "El tiempo de espera no es válido.");
      // Cover body reads and transports that ignore AbortSignal as well.
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
          reject(new Error());
        }, timeoutMs);
      });
      const operation = async (): Promise<Result<ApiResponse<T>>> => {
        const response = await this.transport(url.toString(), {
          method: options.method ?? "GET",
          headers: {
            Accept: "application/json",
            ...(options.body !== undefined
              ? { "Content-Type": "application/json" }
              : {}),
            ...options.headers,
          },
          body:
            options.body === undefined
              ? undefined
              : JSON.stringify(options.body),
          signal: controller.signal,
        });
        if (!response.ok)
          return {
            ok: false,
            error: {
              code: "HTTP",
              message: "El servidor no pudo completar la solicitud.",
              statusCode: response.status,
            },
          };
        let data: unknown;
        try {
          data = response.status === 204 ? undefined : await response.json();
        } catch {
          return failure(
            "PARSE",
            "La respuesta del servidor no es JSON válido.",
          );
        }
        let result: ApiResponse<unknown> = {
          data,
          statusCode: response.status,
        };
        for (const interceptor of this.responseInterceptors)
          result = await interceptor(result);
        if (!validate(result.data))
          return failure(
            "CONTRACT",
            "La respuesta no coincide con el contrato esperado.",
          );
        return {
          ok: true,
          data: { data: result.data, statusCode: result.statusCode },
        };
      };
      return await Promise.race([operation(), timeout]);
    } catch {
      return failure(
        timedOut ? "TIMEOUT" : "NETWORK",
        timedOut
          ? "Se agotó el tiempo de espera."
          : "No se pudo completar la conexión. Intenta nuevamente.",
      );
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}

export const httpClient = new HttpClient(env.apiBaseUrl);
