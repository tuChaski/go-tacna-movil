import { httpClient, type HttpClient } from "../../../services/api/httpClient";
import { isRoutePage } from "../../../types/geo";

/** Only the published public catalogue endpoint; stops await an official contract. */
export function getRoutes(client: HttpClient = httpClient) {
  return client.request({ path: "rutas" }, isRoutePage);
}
