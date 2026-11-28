import { isRecord } from "../utils/validation";

export type ErrorCode =
  | "CONFIGURATION"
  | "NETWORK"
  | "TIMEOUT"
  | "HTTP"
  | "PARSE"
  | "CONTRACT"
  | "STORAGE"
  | "DISCONNECTED"
  | "CANCELLED"
  | "REMOTE"
  | "UNKNOWN";

/** Internal client result, not a backend response envelope. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export interface AppError {
  code: ErrorCode;
  message: string;
  statusCode?: number;
}

export type Validator<T> = (value: unknown) => value is T;

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
}

export function failure(code: ErrorCode, message: string): Result<never> {
  return { ok: false, error: { code, message } };
}

/** OpenAPI PaginatedResponse and Laravel pagination fields. */
export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface PaginationLink {
  url?: string | null;
  label?: string;
  active?: boolean;
}

export interface PaginationMeta {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  links?: PaginationLink[];
  path?: string;
  per_page?: number;
  to?: number | null;
  total?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
  success: boolean;
}

export interface BackendErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export function isPaginatedResponse<T>(
  value: unknown,
  validate: Validator<T>,
): value is PaginatedResponse<T> {
  if (
    !isRecord(value) ||
    !Array.isArray(value.data) ||
    !value.data.every(validate) ||
    typeof value.success !== "boolean" ||
    !isRecord(value.links) ||
    !isRecord(value.meta)
  )
    return false;
  const links = value.links;
  const meta = value.meta;
  const nullableString = (item: unknown) =>
    item === null || typeof item === "string";
  return (
    ["first", "last", "prev", "next"].every(
      (key) => links[key] === undefined || nullableString(links[key]),
    ) &&
    ["current_page", "last_page", "per_page", "total"].every(
      (key) => meta[key] === undefined || Number.isSafeInteger(meta[key]),
    ) &&
    ["from", "to"].every(
      (key) =>
        meta[key] === undefined ||
        meta[key] === null ||
        Number.isSafeInteger(meta[key]),
    ) &&
    (meta.path === undefined || typeof meta.path === "string") &&
    (meta.links === undefined ||
      (Array.isArray(meta.links) &&
        meta.links.every(
          (link: unknown) =>
            isRecord(link) &&
            (link.url === undefined || nullableString(link.url)) &&
            (link.label === undefined || typeof link.label === "string") &&
            (link.active === undefined || typeof link.active === "boolean"),
        )))
  );
}
