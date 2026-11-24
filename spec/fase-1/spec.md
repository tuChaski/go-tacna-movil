# Spec: Fase 1 — Base Técnica, Entorno Móvil y Contratos de Integración

**Rama prevista:** `feature/mobile-phase-1-base`
**Repositorio:** `mobile-app`
**Fase:** 1 — Base Técnica, Entorno Móvil y Contratos
**Estado:** Autorizado para el alcance implementable
**Plan técnico:** `specs/fase_1_base/plan.md`

---

## 1. Propósito

Definir el alcance funcional y técnico inicial de la aplicación móvil (**Android** como plataforma inicial, con proyección a iOS y Web) para el sistema de monitoreo de transporte público en tiempo real en Tacna. Esta fase establece la base de proyecto, arquitectura modular, tipado de contratos y canales de comunicación HTTP/REST y WebSocket necesarios para los módulos posteriores.

La aplicación consumirá los servicios del backend y los eventos en tiempo real como fuente de verdad. Las solicitudes, respuestas, filtros, eventos y permisos deberán respetar los contratos oficiales documentados y/o verificados en el backend; cualquier detalle no especificado permanecerá pendiente de confirmación sin inferir campos, endpoints o eventos.

### 1.1. Objetivos

- Inicializar el proyecto móvil con **React Native** y **TypeScript** en modo estricto, alineado con `constitution.md`[cite: 1].
- Configurar la estructura modular por dominios (`passenger`, `driver`, `auth`, `extras`) y capas transversales (`services`, `store`, `navigation`, `config`, `utils`, `types`)[cite: 1].
- Establecer las convenciones de idioma, calidad de código, linters y flujo GitFlow simplificado (`main`, `develop`, `feature/*`)[cite: 1].
- Definir los modelos TypeScript y contratos de comunicación para catálogo geoespacial (rutas y paraderos) y telemetría en tiempo real (WebSockets)[cite: 1].
- Verificar la conexión inicial del cliente HTTP y del cliente WebSocket contra el entorno de desarrollo del backend y el manejo controlado de fallos[cite: 1].

### 1.2. Fuera de alcance

Esta fase no incluye:

- Pantallas o flujos completos de **Modo Pasajero** (mapa en vivo, selección de rutas, cálculo de ETA o animaciones de marcadores)[cite: 1].
- Pantallas o flujos completos de **Modo Conductor** (inicio/fin de recorrido, `Foreground Service`, geolocalización en segundo plano o cola offline de coordenadas)[cite: 1].
- Autenticación definitiva, gestión de roles/planes ni funciones complementarias (favoritos, alertas de proximidad, aforo o incidencias)[cite: 1].
- Persistencia local compleja o arquitectura Offline-First no aprobada en esta fase.
- Cambios en el backend o redefinición unilateral de sus contratos.

---

## 2. Alcance funcional

| ID | Componente | Descripción |
|---|---|---|
| F1-C01 | Proyecto y entorno | Inicialización React Native + TypeScript estricto, variables de entorno (`.env.example`), linters y estructura de carpetas. |
| F1-C02 | Contratos y modelos | Definición de interfaces TypeScript para rutas, paraderos, respuestas/errores HTTP y eventos WebSocket de telemetría. |
| F1-C03 | Cliente HTTP base | Configuración centralizada de cliente HTTP (`baseURL`, `timeout`, interceptores y normalización de errores). |
| F1-C04 | Cliente WebSocket base | Gestor centralizado de conexión, suscripción por canal/*room*, desconexión y reconexión inicial. |
| F1-C05 | Verificación de humo | Comprobación de compilación en Android, consulta de prueba de catálogo y recepción/validación de evento de telemetría. |

### 2.1. Roles y actores en esta fase

- **Desarrollador móvil:** Configura el entorno, define modelos/contratos, implementa la infraestructura base y ejecuta verificaciones de compilación y conexión.
- **Backend / Servicio en tiempo real:** Expone los endpoints de catálogo geoespacial y los eventos WebSocket de telemetría en entorno de desarrollo/pruebas.
- **Sistema operativo Android (dispositivo o emulador):** Ejecuta el bundle compilado y expone las capacidades de red y entorno de ejecución.

---

## 3. Historias de usuario

### US-001 — Preparar entorno móvil base

Como desarrollador móvil, quiero contar con el proyecto inicializado, tipado estricto y organizado por dominios y capas, para construir los módulos de pasajero y conductor sobre una base coherente.

### US-002 — Congelar contratos de comunicación

Como desarrollador móvil, quiero tener tipados los contratos HTTP y WebSocket de rutas, paraderos y telemetría, para evitar estructuras improvisadas o discrepancias con el backend.

### US-003 — Verificar conectividad inicial y errores

Como desarrollador móvil, quiero verificar la conexión REST y WebSocket contra el entorno de desarrollo y el manejo de errores de red, para detectar problemas de entorno antes de construir las pantallas.

---

## 4. Requisitos funcionales

### 4.1. Entorno y estructura — F1-C01

**FR-001 — Inicialización del proyecto**
El proyecto móvil deberá estar configurado con React Native y TypeScript en modo estricto (`"strict": true`), junto con scripts verificables de chequeo de tipos y formato/linting.

**FR-002 — Variables de entorno**
La aplicación deberá leer su configuración de entorno de forma centralizada (`API_BASE_URL`, `WS_URL`, y claves requeridas como `MAPS_API_KEY` cuando aplique), documentando un `.env.example` sin secretos reales en el repositorio.

**FR-003 — Estructura modular y de servicios**
El código deberá organizarse en `src/features/{passenger,driver,auth,extras}`, `src/components`, `src/hooks`, `src/services/{api,websocket,location,storage}`, `src/store`, `src/navigation`, `src/config`, `src/utils` y `src/types`, respetando la separación de responsabilidades de `constitution.md`[cite: 1].

### 4.2. Modelos y contratos — F1-C02

**FR-004 — Modelos de catálogo geoespacial**
El módulo de tipos deberá definir estructuras para coordenadas, rutas (identificador, código, nombre, color/estilo visual y trazado de ida/vuelta) y paraderos (identificador, nombre, coordenadas y orden), alineadas con el contrato del backend.

**FR-005 — Modelos de telemetría en tiempo real**
El módulo de tipos deberá definir las estructuras de eventos WebSocket para emisión de ubicación de unidad (`unitId`, `routeId`, `lat`, `lng`, `speed`, `heading`, `timestamp`) y sincronización de unidades activas en una ruta, sin añadir campos no documentados como si fueran oficiales.

### 4.3. Comunicación HTTP y WebSocket — F1-C03 y F1-C04

**FR-006 — Cliente HTTP centralizado**
Toda petición REST deberá canalizarse a través de un cliente HTTP centralizado en `src/services/api/`, con `baseURL`, `timeout`, interceptores y normalización de errores. Los componentes visuales y servicios de dominio no crearán clientes HTTP independientes.

**FR-007 — Gestor WebSocket centralizado**
La conexión en tiempo real deberá gestionarse mediante un cliente centralizado en `src/services/websocket/` con soporte para conectar, desconectar, suscribirse/desuscribirse a canales o *rooms* y reintentar conexión ante caídas.

### 4.4. Estados, errores y convención de idioma — F1-C05

**FR-008 — Manejo controlado de fallos**
Ante ausencia de variables de configuración en desarrollo, error HTTP, *timeout* o desconexión de WebSocket, la aplicación deberá capturar el error de forma controlada sin fallos no capturados que cierren el proceso.

**FR-009 — Convención de idiomas**
Código fuente, archivos, carpetas, variables, funciones, hooks, tipos, interfaces, nombres de eventos/endpoints y mensajes de commit deberán estar en **inglés**; la documentación, `Specs` y mensajes visibles al usuario deberán estar en **español**.

---

## 5. Rutas y puntos de entrada de la fase

En esta fase no se exigen pantallas funcionales finales de negocio, pero sí la estructura base de navegación y verificación:

| Elemento | Ubicación | Propósito en Fase 1 |
|---|---|---|
| Navegación raíz | `src/navigation/` | Estructura inicial del contenedor de navegación sin lógica de negocio. |
| Punto de entrada | `src/App.tsx` | Inicialización de configuración, servicios base y contenedor raíz. |
| Configuración | `src/config/` | Lectura y validación de variables de entorno y constantes base. |

---

## 6. Integración y contratos

### 6.1. Fuente contractual

La fuente oficial de los contratos REST, eventos WebSocket, payloads y errores es la documentación/especificación de contratos del backend y su especificación OpenAPI/Swagger o documentación de eventos publicada.

Ante cualquier discrepancia entre la documentación de contratos, la implementación del backend o las pruebas en entorno real, se documentará la discrepancia y se solicitará aclaración antes de adaptar el contrato unilateralmente.

### 6.2. Operaciones y eventos en alcance para verificación inicial

| Recurso / canal | Tipo | Uso en Fase 1 |
|---|---|---|
| Catálogo de rutas | REST (`GET`) | Verificación inicial de conexión HTTP y tipado de rutas. |
| Paraderos de ruta | REST (`GET`) | Verificación inicial de tipado de paraderos asociados a ruta. |
| Actualización de ubicación | WebSocket (`emit`) | Verificación de estructura de payload de emisión de unidad. |
| Sincronización de unidades en ruta | WebSocket (`on`) | Verificación de recepción y tipado de estado de unidades en vivo. |

### 6.3. Dependencias y brechas contractuales

- Si algún endpoint o evento en tiempo real no está publicado o tiene campos distintos en el entorno de desarrollo, se registrará en el seguimiento de la fase sin inventar esquemas ficticios como definitivos.
- La autenticación final con tokens y roles se integrará conforme al contrato de autenticación vigente en la fase correspondiente.

---

## 7. Requisitos no funcionales

**NFR-001 — Arquitectura modular:** Todo el código base respetará la separación entre dominios (`src/features/*`) e infraestructura compartida (`src/services/*`) sin dependencias circulares.

**NFR-002 — Tipado estricto:** La verificación estática de tipos (`tsc`) deberá pasar sin errores antes de integrar cambios.

**NFR-003 — Sin secretos en repositorio:** Ningún token, clave real ni archivo `.env` con credenciales se incorporará al control de versiones.

**NFR-004 — Observabilidad y control de errores:** Los fallos de red o configuración en desarrollo se reportarán con claridad en español para el usuario o diagnóstico controlado sin exponer detalles internos sensibles.

---

## 8. Criterios de aceptación

1. El proyecto React Native + TypeScript estricto compila y ejecuta en Android (dispositivo físico o emulador) sin fallos de arranque.
2. El chequeo de tipos de TypeScript y el linter finalizan sin errores.
3. Existen la estructura de carpetas y los archivos base en `src/features/*`, `src/services/*`, `src/store`, `src/navigation`, `src/config`, `src/utils` y `src/types`.
4. Existen los tipos TypeScript de rutas, paraderos, respuestas/errores HTTP y eventos WebSocket de telemetría alineados con el contrato.
5. El cliente HTTP centralizado y el gestor WebSocket centralizado están implementados sin duplicar instancias en otros módulos.
6. Una consulta de prueba al endpoint de rutas/paraderos en entorno de desarrollo y la recepción/validación de un evento WebSocket de prueba se resuelven conforme al tipado definido.
7. Ante un error de red o servidor no disponible, la aplicación maneja el fallo de forma controlada sin *crash*.
8. Los cambios se realizan en una rama `feature/*` y cumplen las convenciones de idioma y commits de `constitution.md`.

---

## 9. Trazabilidad con el plan

| Requisitos de esta Spec | Referencia en `plan.md` |
|---|---|
| FR-001–FR-003 | F1-C01, secciones 2, 4.1, 5 y 11 (Etapa 1). |
| FR-004–FR-005 | F1-C02, secciones 4.2, 6 y 11 (Etapa 2). |
| FR-006–FR-007 | F1-C03/F1-C04, secciones 4.3, 5.1, 6 y 11 (Etapa 3). |
| FR-008–FR-009 | F1-C05, secciones 7, 8, 10, 11 (Etapa 4) y 12. |

---

## 10. Pendientes de definición antes de avanzar a Fase 2

1. Confirmar la URL accesible del backend y del servidor WebSocket en el entorno de pruebas/desarrollo para ejecutar pruebas integradas reales.
2. Verificar en el contrato/backend los nombres exactos de campos (por ejemplo, `camelCase` vs. `snake_case`) y formatos de trazado geométrico (`LINESTRING` / GeoJSON / arreglo de puntos).
3. Confirmar el formato exacto de autenticación (si aplica token Bearer en cabecera HTTP y/o *handshake* de WebSocket) para integrarlo en los interceptores y gestor de sockets.

---

**Fin de la especificación de la Fase 1.**