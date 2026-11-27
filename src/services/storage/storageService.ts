import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_PREFIX } from "../../config/constants";
import { failure, type Result, type Validator } from "../../types/api";

export interface StorageBackend {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}

/** Non-sensitive data only; credentials require secure storage in their own phase. */
export class StorageService {
  constructor(private readonly backend: StorageBackend) {}

  async read<T>(
    key: string,
    validate: Validator<T>,
  ): Promise<Result<T | null>> {
    try {
      const raw = await this.backend.getItem(STORAGE_PREFIX + key);
      if (raw === null) return { ok: true, data: null };
      const value: unknown = JSON.parse(raw);
      return validate(value)
        ? { ok: true, data: value }
        : failure("STORAGE", "El dato guardado no tiene el formato esperado.");
    } catch {
      return failure("STORAGE", "No se pudo leer el almacenamiento local.");
    }
  }

  async write<T>(key: string, value: T): Promise<Result<void>> {
    try {
      const serialized = JSON.stringify(value);
      if (serialized === undefined)
        return failure("STORAGE", "El dato no se puede guardar.");
      await this.backend.setItem(STORAGE_PREFIX + key, serialized);
      return { ok: true, data: undefined };
    } catch {
      return failure("STORAGE", "No se pudo guardar el dato local.");
    }
  }

  async remove(key: string): Promise<Result<void>> {
    try {
      await this.backend.removeItem(STORAGE_PREFIX + key);
      return { ok: true, data: undefined };
    } catch {
      return failure("STORAGE", "No se pudo borrar el dato local.");
    }
  }
}

export const storageService = new StorageService(AsyncStorage);
