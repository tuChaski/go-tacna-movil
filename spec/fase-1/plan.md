# Plan de Implementación: Fase 1 — Base Técnica, Entorno Móvil y Contratos

**Repositorio:** `mobile-app`
**Rama:** `feature/mobile-phase-1-base`
**Fase:** 1 — Base Técnica, Entorno Móvil y Contratos
**Estado:** Autorizado para ejecución progresiva
**Especificación funcional:** `specs/fase_1_base/spec.md`

## 0. Documentos de referencia y estado previo

Este plan se apoya en las siguientes fuentes de verdad:

| Documento | Uso |
|---|---|
| `specs/constitution.md` | Principios, stack, arquitectura, seguridad, pruebas y convenciones obligatorias[cite: 1]. |
| `specs/fase_1_base/spec.md` | Alcance, requisitos funcionales y criterios de aceptación de la Fase 1. |
| Contrato oficial del backend / documentación API / eventos WS | Fuente de verdad para endpoints, payloads, eventos y errores. |

### 0.1. Prerrequisitos de entorno

Antes de dar por cerrada la implementación de la fase, se debe contar con:

- Entorno de desarrollo Android (SDK, dispositivo físico o emulador) y Node.js/React Native configurados.
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

| Responsabilidad | Tecnología | Estado |
|---|---|---|
| Framework móvil | React Native | Base de Fase 1[cite: 1] |
| Lenguaje | TypeScript (modo estricto) | Base de Fase 1[cite: 1] |
| Calidad y estilo | ESLint + Prettier + TypeScript (`tsc`) | Base de Fase 1 |
| Cliente HTTP | Axios (o cliente HTTP oficial acordado) | Base de Fase 1[cite: 1] |
| Tiempo real | Cliente WebSocket / Socket.IO | Base de Fase 1[cite: 1] |
| Almacenamiento base | MMKV / AsyncStorage (envoltorio inicial) | Base de Fase 1[cite: 1] |

No se incorporan dependencias adicionales sin justificación técnica y aprobación conforme a `constitution.md`[cite: 1].

## 3. Alcance funcional de la fase

| ID | Capacidad | Descripción |
|---|---|---|
| F1-C01 | Proyecto y entorno | Inicialización React Native + TypeScript estricto, `.env.example`, linters y estructura de carpetas. |
| F1-C02 | Contratos y modelos | Interfaces TypeScript para rutas, paraderos, respuestas/errores HTTP y eventos WebSocket. |
| F1-C03 | Cliente HTTP base | Instancia/cliente centralizado con `baseURL`, `timeout`, interceptores y errores normalizados. |
| F1-C04 | Cliente WebSocket base | Gestor centralizado con conexión, suscripción por canal/*room*, desconexión y reconexión. |
| F1-C05 | Verificación de humo | Compilación en Android, consulta REST de prueba y recepción/validación de evento WS de prueba. |

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
| `src/types/geo.ts` | Tipos geoespaciales y catálogo | Coordenadas (`lat`, `lng`), ruta (`id`, `code`, `name`, `colorHex`, trazados) y paradero (`id`, `name`, `lat`, `lng`, `order`). |
| `src/types/telemetry.ts` | Tipos de telemetría en tiempo real | Emisión de ubicación (`unitId`, `routeId`, `lat`, `lng`, `speed`, `heading`, `timestamp`) y sincronización de unidades activas en ruta. |
| `src/types/api.ts` | Contratos de respuesta y error HTTP | Respuesta normalizada y error normalizado (`message`, `code`, `statusCode`, detalles opcionales). |

Reglas:

- Solo incluir campos respaldados por el contrato o marcados explícitamente como borrador/pendiente de confirmación.
- No inventar propiedades como definitivas si aún no están confirmadas por backend.

### 4.2. Configuración y almacenamiento base

- `src/config/env.ts`: lee variables de entorno (`API_BASE_URL`, `WS_URL`, etc.) y expone un objeto de configuración tipado; alerta claramente si falta una variable obligatoria en desarrollo.
- `src/config/constants.ts`: define constantes técnicas base (por ejemplo, *timeouts* por defecto y nombres de eventos/claves técnicas).
- `src/services/storage/storageService.ts`: encapsula lectura, escritura y eliminación tipada sobre el almacenamiento local elegido, evitando llamadas directas dispersas en componentes.

### 4.3. Comunicación HTTP y WebSocket

- `src/services/api/httpClient.ts`: centraliza `baseURL`, `timeout`, cabeceras comunes, gancho/interceptor para token cuando exista y normalización de errores HTTP/red.
- `src/services/websocket/socketClient.ts`: centraliza el ciclo de vida de conexión (`connect`, `disconnect`, `subscribe`, `unsubscribe`, `emit`, estados de conexión) y reconexión controlada.

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

Las rutas exactas, métodos HTTP, nombres de eventos WebSocket y estructuras de payload deben contrastarse contra el contrato oficial del backend o documentación publicada antes de dar por cerrada la integración.

Mientras no se cuente con respuesta en vivo o confirmación de un campo específico:

- Se mantiene el tipado alineado con el contrato acordado.
- Se documenta cualquier discrepancia de nombres de campos, códigos de estado o eventos observados en pruebas.

### 6.2. Capacidades pendientes de contrato o entorno

| Capacidad | Estado contractual / entorno |
|---|---|
| Endpoints de catálogo (`rutas`, `paraderos`) | Verificar disponibilidad y formato exacto de geometría/campos en entorno de desarrollo. |
| Eventos WebSocket de telemetría | Verificar nombres exactos de eventos y payloads en servidor WS de desarrollo. |
| Autenticación en REST / WS | Confirmar si las pruebas o endpoints iniciales requieren token Bearer o *handshake* específico. |

## 7. Rutas y navegación

En esta fase se prepara la estructura base en `src/navigation/` y `src/App.tsx` para montar el contenedor inicial sin lógica de negocio compleja ni rutas dispersas.

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
| Pruebas de integración / humo | Verificación de inicialización del cliente HTTP, gestor WebSocket y arranque en dispositivo/emulador Android. |

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

- Compilar y arrancar en Android.
- Ejecutar pruebas de humo HTTP y WebSocket y validar manejo de errores de red.
- Verificar criterios de aceptación de `spec.md` y actualizar `task.md`.

## 12. Riesgos, bloqueos y decisiones pendientes

### 12.1. Bloqueos

| ID | Bloqueo | Impacto | Mitigación |
|---|---|---|---|
| B1 | Entorno de backend o WebSocket no disponible o no accesible en red local. | Impide probar en vivo contra servidor real hasta que esté disponible. | Validar con mocks/pruebas locales de contrato y documentar verificación en vivo pendiente hasta tener endpoint accesible. |
| B2 | Diferencias de esquema entre contrato escrito y payload real del backend. | Riesgo de errores de parseo o tipado. | Revisar payload real al conectar y documentar discrepancias sin modificar contratos unilateralmente. |

### 12.2. Decisiones pendientes

| ID | Decisión | Impacto |
|---|---|---|
| DP-01 | Convención de campos (`camelCase` vs. `snake_case`) en respuestas REST y eventos WS. | Modelos en `src/types/` y mappers en servicios. |
| DP-02 | Mecanismo exacto de autenticación para conectar HTTP y WebSocket en entorno de pruebas. | Interceptores del cliente HTTP y parámetros de conexión WS. |

Ninguna de estas decisiones se resolverá por suposición dentro de la implementación.

## 13. Criterios de finalización

La Fase 1 se considerará completada cuando:

1. La Spec y el Plan estén autorizados y registrados en la rama de trabajo.
2. La estructura de carpetas y el proyecto React Native + TypeScript estricto existan conforme a `constitution.md`[cite: 1].
3. Los tipos base en `src/types/` estén definidos y alineados con el contrato disponible.
4. `src/config/`, `src/services/api/`, `src/services/websocket/` y `src/services/storage/` estén implementados sin duplicaciones.
5. Las comprobaciones de tipos, linter y compilación Android finalicen sin errores.
6. Las pruebas de humo de conexión y manejo de errores estén ejecutadas y registradas en `task.md`.

---

**Fin del plan de implementación de la Fase 1.**