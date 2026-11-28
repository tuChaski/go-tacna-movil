import { httpClient, type HttpClient } from "../../../services/api/httpClient";
import { env, validateUrl } from "../../../config/env";
import {
  CATALOG_CACHE_TTL_MS,
  MAX_ROUTE_PAGES,
} from "../../../config/constants";
import {
  storageService,
  type StorageService,
} from "../../../services/storage/storageService";
import { failure, type AppError, type Result } from "../../../types/api";
import {
  isRoute,
  isRoutePage,
  type GeoPosition,
  type Route,
} from "../../../types/geo";
import {
  hasOnlyKeys,
  isPositiveInteger,
  isRecord,
} from "../../../utils/validation";

const CACHE_ROUTE_FIELDS = [
  "id",
  "empresa_id",
  "nombre_ruta",
  "activo",
  "trazado_ruta",
  "created_at",
  "updated_at",
] as const;

/**
 * Conserva únicamente el catálogo consumido por móvil. Las relaciones expandidas
 * de REST no se guardan: podrían contener información de unidades o posiciones.
 * Esta proyección es del almacenamiento local; no relaja esquemas de telemetría.
 */
function toCacheRoute(route: Route): Route {
  return {
    id: route.id,
    empresa_id: route.empresa_id,
    nombre_ruta: route.nombre_ruta,
    activo: route.activo,
    ...(route.trazado_ruta !== undefined
      ? {
          trazado_ruta:
            route.trazado_ruta === null
              ? null
              : {
                  type: "LineString" as const,
                  coordinates: route.trazado_ruta.coordinates.map(
                    ([longitude, latitude]): GeoPosition => [
                      longitude,
                      latitude,
                    ],
                  ),
                },
        }
      : {}),
    ...(route.created_at !== undefined ? { created_at: route.created_at } : {}),
    ...(route.updated_at !== undefined ? { updated_at: route.updated_at } : {}),
  };
}

/**
 * Consulta una página del único catálogo publicado. Conserva la firma previa y
 * la primera URL de Fase 1; no introduce endpoints de paraderos o sentidos.
 */
export async function getRoutes(client: HttpClient = httpClient, page = 1) {
  if (!isPositiveInteger(page))
    return failure("CONTRACT", "La página del catálogo no es válida.");
  return client.request(
    { path: page === 1 ? "rutas" : `rutas?page=${page}` },
    isRoutePage,
  );
}

/** Metadatos internos de almacenamiento; no forman parte de la respuesta REST. */
interface CatalogCache {
  version: 1;
  apiBaseUrl: string;
  fetchedAt: number;
  routes: Route[];
}

/** Permite a una futura vista identificar origen, antigüedad y fallos recuperables. */
export interface RouteCatalog {
  routes: Route[];
  fetchedAt: number;
  source: "network" | "cache";
  stale: boolean;
  warning?: AppError;
}

/** Valida el sobre y cada ruta antes de reutilizar almacenamiento no confiable. */
function isCatalogCache(value: unknown): value is CatalogCache {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.apiBaseUrl === "string" &&
    Number.isSafeInteger(value.fetchedAt) &&
    typeof value.fetchedAt === "number" &&
    value.fetchedAt >= 0 &&
    Array.isArray(value.routes) &&
    value.routes.every(
      (route): route is Route =>
        isRecord(route) &&
        hasOnlyKeys(route, CACHE_ROUTE_FIELDS) &&
        isRoute(route),
    ) &&
    new Set(value.routes.map((route) => route.id)).size === value.routes.length
  );
}

/**
 * Coordina paginación y caché del catálogo con los clientes centrales existentes.
 * TTL de 24h, versión y origen impiden mezclar entornos o tratar datos viejos como
 * nuevos. Las consultas concurrentes comparten una operación; un fallo de página
 * nunca guarda un catálogo parcial. Solo persiste rutas, sin GPS, ETA ni fixtures.
 *
 * El constructor admite dependencias aisladas para pruebas. La única instancia de
 * producción se exporta al final; la integración de pantalla sigue detenida por
 * las dependencias de backend registradas en el SDD de Fase 3.
 */
export class PassengerCatalogService {
  private pending?: Promise<Result<RouteCatalog>>;

  constructor(
    private readonly apiBaseUrl: string | undefined = env.apiBaseUrl,
    private readonly client: HttpClient = httpClient,
    private readonly storage: Pick<
      StorageService,
      "read" | "write" | "remove"
    > = storageService,
    private readonly now: () => number = Date.now,
  ) {}

  /** Carga vigente desde caché, o revalida al vencer/solicitar refresh explícito. */
  load(options: { refresh?: boolean } = {}): Promise<Result<RouteCatalog>> {
    if (this.pending) return this.pending;
    this.pending = this.loadCatalog(Boolean(options.refresh)).finally(() => {
      this.pending = undefined;
    });
    return this.pending;
  }

  private async loadCatalog(refresh: boolean): Promise<Result<RouteCatalog>> {
    const base = validateUrl(this.apiBaseUrl, ["http:", "https:"]);
    if (!base.ok) return base;
    const url = new URL(base.data);
    if (url.search)
      return failure(
        "CONFIGURATION",
        "La URL base del catálogo no admite parámetros.",
      );
    const apiBaseUrl = base.data.replace(/\/+$/, "");
    const key = `passenger:routes:v1:${encodeURIComponent(apiBaseUrl)}`;
    try {
      const saved = await this.storage.read(key, isCatalogCache);
      let cached: CatalogCache | undefined;
      if (
        saved.ok &&
        saved.data &&
        saved.data.apiBaseUrl === apiBaseUrl &&
        saved.data.fetchedAt <= this.now()
      ) {
        cached = saved.data;
      } else if (!saved.ok || saved.data) {
        // La corrupción o el cambio de esquema/origen no deben impedir consultar red.
        await this.storage.remove(key);
      }
      const stale = cached
        ? this.now() - cached.fetchedAt >= CATALOG_CACHE_TTL_MS
        : true;
      if (cached && !stale && !refresh)
        return {
          ok: true,
          data: {
            routes: cached.routes,
            fetchedAt: cached.fetchedAt,
            source: "cache",
            stale: false,
          },
        };

      const fetched = await this.fetchAllRoutes();
      if (!fetched.ok) {
        if (!cached) return fetched;
        // Recuperación explícita: conserva fecha real y expone el error y la antigüedad.
        return {
          ok: true,
          data: {
            routes: cached.routes,
            fetchedAt: cached.fetchedAt,
            source: "cache",
            stale,
            warning: fetched.error,
          },
        };
      }
      const envelope: CatalogCache = {
        version: 1,
        apiBaseUrl,
        fetchedAt: this.now(),
        routes: fetched.data,
      };
      const written = await this.storage.write(key, envelope);
      return {
        ok: true,
        data: {
          routes: envelope.routes,
          fetchedAt: envelope.fetchedAt,
          source: "network",
          stale: false,
          ...(!written.ok ? { warning: written.error } : {}),
        },
      };
    } catch {
      return failure("UNKNOWN", "No se pudo preparar el catálogo de rutas.");
    }
  }

  /**
   * Lee todas las páginas sin seguir URLs arbitrarias del servidor: únicamente
   * extrae el número siguiente y vuelve a construir la ruta mediante HttpClient.
   * Rechaza ciclos, páginas contradictorias y duplicados para no cachear datos parciales.
   */
  private async fetchAllRoutes(): Promise<Result<Route[]>> {
    const routes: Route[] = [];
    const ids = new Set<number>();
    for (let page = 1; page <= MAX_ROUTE_PAGES; page++) {
      const result = await getRoutes(this.client, page);
      if (!result.ok) return result;
      const payload = result.data.data;
      const { current_page: current, last_page: last } = payload.meta;
      if (
        !payload.success ||
        (current !== undefined && current !== page) ||
        (last !== undefined && (!isPositiveInteger(last) || last < page))
      )
        return failure("CONTRACT", "La paginación del catálogo no es válida.");
      for (const route of payload.data) {
        if (ids.has(route.id))
          return failure(
            "CONTRACT",
            "El catálogo contiene páginas inconsistentes.",
          );
        ids.add(route.id);
        routes.push(toCacheRoute(route));
      }
      const next = payload.links.next;
      if (next) {
        let nextPage: number;
        try {
          nextPage = Number(
            new URL(next, this.apiBaseUrl).searchParams.get("page"),
          );
        } catch {
          return failure(
            "CONTRACT",
            "La página siguiente del catálogo no es válida.",
          );
        }
        if (
          !isPositiveInteger(nextPage) ||
          nextPage !== page + 1 ||
          (last !== undefined && nextPage > last)
        )
          return failure(
            "CONTRACT",
            "La página siguiente del catálogo no es válida.",
          );
      }
      if (!next && (last === undefined || last === page))
        return { ok: true, data: routes };
    }
    return failure(
      "CONTRACT",
      "El catálogo supera el límite de páginas permitido.",
    );
  }
}

export const passengerCatalogService = new PassengerCatalogService();
