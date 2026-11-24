# Tareas de Implementación — Fase 1: Base Técnica, Entorno Móvil y Contratos

## Estado documental

- **Spec:** `specs/fase_1_base/spec.md` (autorizado para el alcance implementable).
- **Plan:** `specs/fase_1_base/plan.md` (autorizado para ejecución progresiva).
- **Fase:** 1 — Base Técnica, Entorno Móvil y Contratos.
- **Rama de implementación prevista:** `feature/mobile-phase-1-base`, creada desde `develop` actualizado.

Las tareas de este documento cubren la preparación del entorno móvil, la definición de modelos/contratos base y la implementación de los clientes centrales de configuración, almacenamiento, HTTP y WebSocket. Las capacidades que dependen de pantallas o flujos de fases posteriores permanecen fuera de esta lista y se incorporarán en sus respectivas fases.

## Dependencias previas

Antes de iniciar la implementación, verificar:

- Entorno de desarrollo móvil (Node.js, React Native, TypeScript y Android SDK / dispositivo o emulador) operativo.
- Repositorio inicializado con ramas `main` y `develop` y rama de trabajo `feature/mobile-phase-1-base`.
- Contrato o documentación de endpoints/eventos del backend disponible para contraste.

No duplicar clientes HTTP ni instancias de WebSocket fuera de `src/services/`.

---

## Fase 1.1: Entorno, repositorio y estructura base

- [ ] **T1.1.1: Inicialización del proyecto React Native + TypeScript**
  - Inicializar el proyecto móvil con TypeScript en modo estricto (`"strict": true`).
  - Verificar que el proyecto compila y arranca en entorno Android.
  - Configurar scripts de verificación de tipos (`typecheck`) y estilo (`lint`, `format`).

- [ ] **T1.1.2: Flujo de ramas y variables de entorno**
  - Crear y trabajar sobre la rama `feature/mobile-phase-1-base` desde `develop`.
  - Crear `.env.example` con las variables base (`API_BASE_URL`, `WS_URL`, `MAPS_API_KEY`).
  - Confirmar que `.env` y archivos sensibles estén excluidos en `.gitignore`.

- [ ] **T1.1.3: Estructura de carpetas de la aplicación móvil**
  - Crear la estructura de `src/features/{passenger,driver,auth,extras}` (con subcarpetas base e `index.ts`).
  - Crear `src/components`, `src/hooks`, `src/services/{api,websocket,location,storage}`, `src/store`, `src/navigation`, `src/config`, `src/utils` y `src/types`.
  - Respetar la separación de responsabilidades y convención de nombres en inglés de `constitution.md`[cite: 1].

---

## Fase 1.2: Modelos y contratos TypeScript

- [ ] **T1.2.1: Modelos geoespaciales y de catálogo (`src/types/geo.ts`)**
  - Definir tipos para coordenadas (`lat`, `lng`), rutas (`id`, `code`, `name`, `colorHex`, trazado de ida/vuelta) y paraderos (`id`, `name`, `lat`, `lng`, `order`).
  - Contrastar nombres de campos con el contrato del backend sin inventar propiedades no documentadas.

- [ ] **T1.2.2: Modelos de telemetría en tiempo real (`src/types/telemetry.ts`)**
  - Definir tipos para la emisión de ubicación de unidad y la sincronización de unidades activas por ruta (`unitId`, `routeId`, `lat`, `lng`, `speed`, `heading`, `timestamp`).
  - Documentar cualquier campo pendiente de confirmación en el backend.

- [ ] **T1.2.3: Modelos de red y errores normalizados (`src/types/api.ts`)**
  - Definir interfaces para respuestas estructuradas y errores normalizados de red o servidor.
  - Garantizar tipado explícito sin uso injustificado de `any`.

---

## Fase 1.3: Configuración y servicios centrales de infraestructura

- [ ] **T1.3.1: Configuración de entorno y constantes (`src/config/`)**
  - Implementar `src/config/env.ts` para cargar y validar variables de entorno y reportar faltantes de forma controlada.
  - Implementar `src/config/constants.ts` para *timeouts* y constantes técnicas base.

- [ ] **T1.3.2: Almacenamiento local base (`src/services/storage/storageService.ts`)**
  - Implementar envoltorio tipado de lectura, escritura y eliminación para claves locales.
  - Evitar accesos directos al almacenamiento dispersos en componentes.

- [ ] **T1.3.3: Cliente HTTP centralizado (`src/services/api/httpClient.ts`)**
  - Configurar instancia única con `baseURL`, `timeout`, cabeceras base e interceptores.
  - Normalizar errores HTTP y de red sin exponer detalles internos sensibles.

- [ ] **T1.3.4: Gestor WebSocket centralizado (`src/services/websocket/socketClient.ts`)**
  - Implementar conexión, desconexión, suscripción/desuscripción a canales o *rooms*, emisión tipada y reconexión básica.
  - Mantener una gestión centralizada para evitar múltiples sockets abiertos sin control.

---

## Fase 1.4: Verificación y cierre de la fase

- [ ] **T1.4.1: Pruebas de humo HTTP y WebSocket**
  - Verificar consulta de prueba a rutas/paraderos y parseo contra los tipos de `src/types/geo.ts`.
  - Verificar recepción y validación de evento de prueba contra `src/types/telemetry.ts`.
  - Registrar si la prueba se ejecutó contra backend en vivo o entorno simulado/mock según disponibilidad de red.

- [ ] **T1.4.2: Manejo de fallos de conexión y entorno**
  - Simular URL inválida, *timeout* o servidor no disponible.
  - Confirmar que la aplicación captura el error de forma controlada y no sufre *crash*.

- [ ] **T1.4.3: Revisión de criterios de aceptación y calidad**
  - Ejecutar chequeo de tipos de TypeScript, linter y compilación Android sin errores.
  - Verificar todos los criterios de aceptación de `specs/fase_1_base/spec.md`.
  - Actualizar las tareas a `[x]` solo después de completar y verificar su resultado.

---

## Capacidades expresamente diferidas a fases posteriores

Estas capacidades no tienen tareas de implementación en esta fase y se abordarán en sus `Specs` correspondientes:

- Diseño de pantallas, jerarquía visual y matriz de estados UI de Pasajero y Modo Conductor (Fase 2).
- Renderizado de mapa, polilíneas, animación de marcadores y cálculo de ETA (Fase 3).
- Servicio en segundo plano (*Foreground Service*), muestreo GPS continuo y cola *offline* de telemetría (Fase 4).
- Autenticación, gestión de roles/planes, favoritos, alertas de proximidad y aforo/incidencias (Fase 5).
- Pruebas en rutas reales de Tacna, auditoría de batería y empaquetado final de distribución (Fase 6).

## Regla de ejecución

La implementación deberá respetar `constitution.md`, `spec.md`, `plan.md` y el contrato vigente[cite: 1]. Si una tarea encuentra un DTO/evento incompleto o una discrepancia, se detendrá únicamente esa integración y se documentará la dependencia; no se completará mediante suposiciones ni se ampliará el alcance unilateralmente.

## Registro de avance — Fase 1 (pendiente de ejecución)

- Estado inicial: documentos `spec.md`, `plan.md` y `task.md` preparados para la Fase 1.
- Pendiente registrar fecha, resultados de compilación, pruebas de humo HTTP/WebSocket y observaciones de entorno al ejecutar las tareas.