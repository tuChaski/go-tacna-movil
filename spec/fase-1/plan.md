# Plan de Implementación: Fase 1 — Base Técnica, Entorno Móvil y Contratos

**Repositorio:** `mobile-app`
**Rama:** `feature/mobile-phase-1-base`
**Fase:** 1 — Base Técnica, Entorno Móvil y Contratos
**Estado:** Autorizado para ejecución progresiva
**Especificación funcional:** `spec/fase-1/spec.md`

## 0. Documentos de referencia y estado previo

Este plan se apoya en las siguientes fuentes de verdad:

| Documento | Uso |
|---|---|
| `spec/contitution.md` | Principios, stack, arquitectura, seguridad, pruebas y convenciones obligatorias[cite: 1]. |
| `spec/fase-1/spec.md` | Alcance, requisitos funcionales y criterios de aceptación de la Fase 1. |
| Contrato oficial del backend / documentación API / eventos WS | Fuente de verdad para endpoints, payloads, eventos y errores. |

### 0.1. Prerrequisitos de entorno

Antes de dar por cerrada la implementación de la fase, se debe contar con:

- Node.js, dependencias Expo y cliente Expo Go para la comprobación visual. Validación exclusivamente con `npx expo start`; no se compilan APK ni builds nativos.
- Acceso a la rama `develop` como base de integración y creación de ramas `feature/*`.
- Contrato o documentación del backend consultada para evitar suposiciones sobre campos o eventos.

## 1. Objetivo

Definir la solución técnica de la **Fase 1** de la aplicación móvil para el sistema de transporte público en tiempo real (Tacna), dejando listos el proyecto base, la arquitectura de carpetas, los contratos tipados y los clientes centralizados de HTTP y WebSocket sobre los que se construirán **M1 (Pasajero)**, **M2 (Modo Conductor)**, **M3 (Autenticación/Perfiles)** y **M4 (Funciones Complementarias)**[cite: 1].

## 2. Enfoque arquitectónico

Se aplica la arquitectura modular y de separación de responsabilidades definida en `constitution.md`[cite: 1]:

- **Presentación:** restringida en esta fase a la estructura base y verificaciones mínimas de arranque/diagnóstico.
- **Aplicación:** coordinación de llamadas de prueba y suscripciones iniciales.
- **Dominio:** modelos y tipos compartidos de rutas, paraderos y telemetría.
- **Infraestructura:** configuración de entorno, cliente HTTP centralizado, gestor WebSocket centralizado y envoltorio base de almacenamiento.

Principios aplicables:

- Operación en línea para consultas/telemetría en esta fase, sin introducir persistencia compleja ni colas offline prematuras.
- Sin duplicar clientes HTTP ni instancias de WebSocket en componentes o módulos.
- Sin lógica de negocio dentro de los componentes visuales.
- Respeto estricto a las convenciones de idioma de `constitution.md`[cite: 1].

### 2.1. Tecnologías

**Decisión de implementación autorizada para Fase 1 (24/11/2026):** se utiliza Fetch
nativo como cliente HTTP oficial del alcance base, con interceptores propios, timeout
por AbortController y resultado discriminado. Evita añadir Axios para funciones ya
disponibles. El contrato confirmado exige `socket.io-client` 4.x, instalado mediante
`expo install`; reemplaza el transporte WebSocket provisional, que era incompatible
con el servidor. Socket.IO mantiene una conexión centralizada, con fallback polling,
timeout, cinco reintentos y backoff entre 1 y 30 segundos. No se añade un segundo bucle
de reconexión. Al reconectar se restauran las salas; no se encolan emisiones desconectadas.
AsyncStorage 2.2.0 implementa persistencia de datos no sensibles, conforme al stack
permitido y a la versión recomendada para Expo SDK 57. ESLint/config Expo y Prettier
completan las herramientas de calidad previstas. Instalación mediante `expo install`.

| Responsabilidad | Tecnología | Estado |
|---|---|---|
| Framework móvil | React Native | Base de Fase 1[cite: 1] |
| Lenguaje | TypeScript (modo estricto) | Base de Fase 1[cite: 1] |
| Calidad y estilo | ESLint + Prettier + TypeScript (`tsc`) | Base de Fase 1 |
| Cliente HTTP | Fetch nativo con envoltorio central | Implementado y probado localmente |
| Tiempo real | Socket.IO Client 4.x | Eventos oficiales y reconexión probados con mock de transporte |
| Almacenamiento base | AsyncStorage 2.2.0 | Envoltorio probado con driver simulado |

No se incorporan dependencias adicionales sin justificación técnica y aprobación conforme a `constitution.md`[cite: 1].

## 3. Alcance funcional de la fase

| ID | Capacidad | Descripción |
|---|---|---|
| F1-C01 | Proyecto y entorno | Inicialización React Native + TypeScript estricto, `.env.example`, linters y estructura de carpetas. |
| F1-C02 | Contratos y modelos | Interfaces TypeScript para rutas, paraderos, respuestas/errores HTTP y eventos WebSocket. |
| F1-C03 | Cliente HTTP base | Instancia/cliente centralizado con `baseURL`, `timeout`, interceptores y errores normalizados. |
| F1-C04 | Cliente WebSocket base | Gestor centralizado con conexión, suscripción por canal/*room*, desconexión y reconexión. |
| F1-C05 | Verificación de humo | `npx expo start`, bundle para Expo Go y pruebas HTTP/Socket.IO con fixtures contractuales. |

### 3.1. Fuera de alcance

- Interfaces completas de Pasajero o Modo Conductor.
- Cálculo de ETA, interpolación de marcadores en mapa o `Foreground Service` de GPS en segundo plano.
- Gestión avanzada de sesiones/roles o funciones de valor agregado (favoritos, alertas, aforo).
- Arquitectura Offline-First completa.

## 4. Diseño de la solución

### 4.1. Modelos conceptuales y tipos base

Se definen tipos compartidos en `src/types/`:

| Archivo / concepto | Responsabilidad | Campos / elementos clave |
|---|---|---|
| `src/types/geo.ts` | Coordenadas, GeoJSON y catálogo | `Route`: `id`, `empresa_id`, `nombre_ruta`, `activo`, `trazado_ruta`; LineString `[lng,lat]`. Paraderos bloqueados (`Stop = never`). |
| `src/types/telemetry.ts` | Contratos HTTP y Socket.IO | Payloads Node/Core separados; `MicroPosition`, `ActiveUnits`, offline/stopped y mapas tipados de eventos. Sin ETA ni flujo conductor. |
| `src/types/api.ts` | Contratos y resultados internos separados | Paginación Laravel, ErrorResponse del backend y resultado discriminado del cliente. Validación de payloads desconocidos antes de exponerlos. |

Reglas:

- Solo incluir campos respaldados por el contrato o marcados explícitamente como borrador/pendiente de confirmación.
- No inventar propiedades como definitivas si aún no están confirmadas por backend.

### 4.2. Configuración y almacenamiento base

- `src/config/env.ts`: lee variables de entorno (`API_BASE_URL`, `WS_URL`, etc.) y expone un objeto de configuración tipado; alerta claramente si falta una variable obligatoria en desarrollo.

  Expo requiere `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_WS_URL` y
  `EXPO_PUBLIC_MAPS_API_KEY` mediante accesos estáticos. `.env.example` conserva los
  alias solicitados y los expande a esas variables. Todo lo incluido en el bundle es
  público; no se admiten secretos. La clave de mapas es opcional en esta fase.
  `ConfigurationNotice` muestra faltantes/URLs inválidas en desarrollo sin lanzar
  excepciones al importar. Cada conexión valida su propia configuración al usarse.
  El ejemplo apunta al Nginx local: API `http://localhost:8001/api/v1`, Socket.IO
  `http://localhost:8001` (origen HTTP, path `/socket.io`). En un emulador Android
  se usa `10.0.2.2`; en teléfono se necesita un host/túnel accesible. El Compose
  publica 8001 en loopback, por lo que sustituir la IP sin configurar acceso no basta.
  PostgreSQL 5432 no es un destino móvil; no se copian secretos de infraestructura.
- `src/config/constants.ts`: define constantes técnicas base (por ejemplo, *timeouts* por defecto y nombres de eventos/claves técnicas).
- `src/services/storage/storageService.ts`: encapsula lectura, escritura y eliminación tipada sobre el almacenamiento local elegido, evitando llamadas directas dispersas en componentes.

### 4.3. Comunicación HTTP y WebSocket

- `src/services/api/httpClient.ts`: centraliza `baseURL`, `timeout`, cabeceras comunes, gancho/interceptor para token cuando exista y normalización de errores HTTP/red.
- `src/services/websocket/socketClient.ts`: centraliza `connect`, `disconnect`, `on`, `subscribe` (devuelve limpieza idempotente), `emit` tipado y reconexión controlada. Las suscripciones a rutas usan conteo de consumidores para evitar joins duplicados o leaves prematuros.
- `src/features/passenger/services/catalogService.ts`: consulta pública mínima `GET rutas` a través del singleton HTTP con validación de paginación; sin pantallas ni estado de pasajero.

### 4.4. Estructura de dominios (`src/features/*`)

Cada dominio (`passenger`, `driver`, `auth`, `extras`) se crea con su estructura base (`components/`, `hooks/`, `screens/`, `services/`, `store/`, `index.ts`) para evitar improvisaciones cuando inicien las Fases 2 a 5[cite: 1].

## 5. Estructura del proyecto

```text
mobile-app/
├── android/
├── ios/
├── src/
│   ├── features/
│   │   ├── passenger/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── index.ts
│   │   ├── driver/
│   │   ├── auth/
│   │   └── extras/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   │   ├── api/
│   │   ├── websocket/
│   │   ├── location/
│   │   └── storage/
│   ├── store/
│   ├── navigation/
│   ├── config/
│   ├── utils/
│   ├── types/
│   └── App.tsx
├── .env.example
├── tsconfig.json
└── package.json
```

Notas:

- Los componentes visuales no realizan peticiones HTTP ni gestionan sockets directamente.
- No se crean capas offline complejas en esta fase.

## 6. Contratos del backend

### 6.1. Estado actual

Se contrastaron `../go-tacna-docs/contratos/openapi.yaml`, `eventos-websocket.md`,
`payload-gps.md` y `jwt-claims.md` con los handlers y middleware de
`../go-tacna-backend/realtime/src/`, en solo lectura. Catálogo REST usa campos
snake_case y Socket.IO usa `microId/rutaId/lastSeen`; se preservan los nombres del
contrato en el wire. Geometría LineString y paginación están confirmadas en OpenAPI.
La implementación Core/Gateway no está disponible en este checkout.

Mientras no se cuente con respuesta en vivo o confirmación de un campo específico:

- Se mantiene el tipado alineado con el contrato acordado.
- Se documenta cualquier discrepancia de nombres de campos, códigos de estado o eventos observados en pruebas.

### 6.2. Capacidades pendientes de contrato o entorno

| Capacidad | Estado contractual / entorno |
|---|---|
| Catálogo de rutas | Contrato y servicio mínimo listos; prueba contra API real pendiente. |
| Paraderos | No hay schema ni endpoint oficial publicado; no se implementa una suposición. |
| Eventos Socket.IO | Confirmados por docs y Node; validados con transporte mock, servidor real pendiente. |
| Tracking HTTP | Contratos Core (`201`/recurso) y Node (`202`/`{ok}`) distintos; envío bloqueado hasta definir destino público. |
| Autenticación | Catálogo público y socket sin auth; tracking protegido con JWT. La app no firma tokens ni almacena credenciales en AsyncStorage. |

## 7. Rutas y navegación

Se conserva Expo Router por la instrucción de `AGENTS.md`: `src/app/_layout.tsx`
es el punto de entrada de navegación; `src/navigation/` queda reservado para utilidades
compartidas. No se introduce un segundo NavigationContainer ni un `src/App.tsx` paralelo.
En esta ejecución no se genera ni compila código nativo. Se usa exclusivamente
`npx expo start`; los directorios CNG preexistentes permanecen ignorados.

En esta fase se prepara la estructura base en `src/navigation/` y `src/app/_layout.tsx` para montar el contenedor inicial sin lógica de negocio compleja ni rutas dispersas.

## 8. Alcance de conectividad

La Fase 1 valida la conectividad de red (HTTP y WebSocket) en entorno de desarrollo y el manejo controlado de errores cuando no hay red o el servidor no responde. No implementa sincronización offline ni caché transaccional.

## 9. Seguridad

- No se almacenan credenciales, tokens ni claves secretas en código fuente ni en `.env.example`.
- El archivo `.env` local queda excluido del control de versiones.
- Los errores de red o servidor se normalizan sin filtrar trazas internas sensibles.

## 10. Estrategia de pruebas

| Tipo | Alcance en Fase 1 |
|---|---|
| Chequeo estático | Compilación TypeScript (`tsc --noEmit` / `tsc -b`) y linter (`ESLint`). |
| Pruebas unitarias | Validación de tipos/utilidades base, normalización de errores y configuración de entorno. |
| Pruebas de integración / humo | HTTP local y Socket.IO mock con payloads oficiales; arranque de Metro y bundle Android servido mediante `npx expo start`. La ejecución visual en Expo Go se registra por separado. |

## 11. Secuencia de implementación

### Etapa 1 — Entorno y estructura de carpetas

- Inicializar proyecto React Native + TypeScript estricto y configurar linters.
- Configurar ramas GitFlow (`main`, `develop`, `feature/*`).
- Crear estructura de carpetas de `src/` y `.env.example`.

### Etapa 2 — Tipos y contratos base

- Crear `src/types/geo.ts`, `src/types/telemetry.ts` y `src/types/api.ts`.
- Contrastar y ajustar campos según el contrato del backend.

### Etapa 3 — Configuración y clientes de infraestructura

- Implementar `src/config/env.ts` y `src/config/constants.ts`.
- Implementar `src/services/storage/storageService.ts`, `src/services/api/httpClient.ts` y `src/services/websocket/socketClient.ts`.

### Etapa 4 — Verificación y cierre de Fase 1

- Iniciar `npx expo start` y comprobar estado, manifiesto y bundle Android para Expo Go. No ejecutar Gradle, prebuild, export, EAS Build ni generar APK para probar.
- Ejecutar pruebas de humo HTTP y WebSocket y validar manejo de errores de red.
- Verificar criterios de aceptación de `spec.md` y actualizar `task.md`.

## 12. Riesgos, bloqueos y decisiones pendientes

### 12.1. Bloqueos

Registro del 24/11/2026: Docker instalado pero sin daemon accesible (comprobado
también fuera del sandbox). No responden los servicios HTTP en 8001/3001. Compose
usa PostgreSQL/PostGIS 16, base `gotacna_db`, puerto local 5432 y Nginx 8001, que
enruta `/api/` a Gateway/Core y `/socket.io/` a Node. Los bind mounts esperados
`gotacna-backend-core`, `gotacna-api-gateway` y `go-tacna-location-service` no existen
en el checkout de backend (solo está `realtime`). Este último requiere `JWT_SECRET`
y no tiene `.env` local. No se levanta un Compose incompleto ni se modifican repos
de referencia. Su arranque definido es `docker compose up -d --build --wait` desde
infraestructura una vez restaurados fuentes/daemon. Se dejan URLs listas en el móvil
y se validan los clientes con mocks sin credenciales inventadas.

| ID | Bloqueo | Impacto | Mitigación |
|---|---|---|---|
| B1 | Entorno de backend o WebSocket no disponible o no accesible en red local. | Impide probar en vivo contra servidor real hasta que esté disponible. | Validar con mocks/pruebas locales de contrato y documentar verificación en vivo pendiente hasta tener endpoint accesible. |
| B2 | Diferencias de esquema entre contrato escrito y payload real del backend. | Riesgo de errores de parseo o tipado. | Revisar payload real al conectar y documentar discrepancias sin modificar contratos unilateralmente. |

### 12.2. Decisiones pendientes

| ID | Decisión | Impacto |
|---|---|---|
| DP-01 | Publicación del contrato de paraderos. | Mantener esa integración detenida. |
| DP-02 | Resolver Core frente a Node para tracking y su exposición por Nginx. | Mantener envío GPS sin integrar; no mezclar respuestas ni payloads. |

Ninguna de estas decisiones se resolverá por suposición dentro de la implementación.

## 13. Criterios de finalización

La Fase 1 se considerará completada cuando:

1. La Spec y el Plan estén autorizados y registrados en la rama de trabajo.
2. La estructura de carpetas y el proyecto React Native + TypeScript estricto existan conforme a `constitution.md`[cite: 1].
3. Los tipos base en `src/types/` estén definidos y alineados con el contrato disponible.
4. `src/config/`, `src/services/api/`, `src/services/websocket/` y `src/services/storage/` estén implementados sin duplicaciones.
5. TypeScript, linter, pruebas contractuales y arranque de Metro mediante `npx expo start` finalicen sin errores; no se exigen builds nativos. La verificación visual en Expo Go y contra backend real se mantiene pendiente mientras falte entorno.
6. Las pruebas de humo de conexión y manejo de errores estén ejecutadas y registradas en `task.md`.

---

**Fin del plan de implementación de la Fase 1.**
