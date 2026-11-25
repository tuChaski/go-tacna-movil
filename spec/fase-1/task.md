# Tareas de Implementación — Fase 1: Base Técnica, Entorno Móvil y Contratos

## Estado documental

- **Spec:** `spec/fase-1/spec.md` (autorizado para el alcance implementable).
- **Plan:** `spec/fase-1/plan.md` (autorizado para ejecución progresiva).
- **Fase:** 1 — Base Técnica, Entorno Móvil y Contratos.
- **Rama de implementación:** `feature/mobile-phase-1-base`, creada desde `develop` actualizado.

Las tareas de este documento cubren la preparación del entorno móvil, la definición de modelos/contratos base y la implementación de los clientes centrales de configuración, almacenamiento, HTTP y WebSocket. Las capacidades que dependen de pantallas o flujos de fases posteriores permanecen fuera de esta lista y se incorporarán en sus respectivas fases.

## Dependencias previas

Antes de iniciar la implementación, verificar:

- Node.js, TypeScript y Expo operativos; pruebas de aplicación exclusivamente mediante `npx expo start` y Expo Go, sin builds nativos.
- Repositorio inicializado con ramas `main` y `develop` y rama de trabajo `feature/mobile-phase-1-base`.
- Contrato o documentación de endpoints/eventos del backend disponible para contraste.

No duplicar clientes HTTP ni instancias de WebSocket fuera de `src/services/`.

---

## Fase 1.1: Entorno, repositorio y estructura base

- [ ] **T1.1.1: Inicialización del proyecto React Native + TypeScript**
  - Inicializar el proyecto móvil con TypeScript en modo estricto (`"strict": true`).
  - Verificar Metro, manifiesto y bundle Android servido mediante `npx expo start`; registrar aparte la ejecución visual en Expo Go.
  - Configurar scripts de verificación de tipos (`typecheck`) y estilo (`lint`, `format`).

- [x] **T1.1.2: Flujo de ramas y variables de entorno**
  - Crear y trabajar sobre la rama `feature/mobile-phase-1-base` desde `develop`.
  - Crear `.env.example` con las variables base (`API_BASE_URL`, `WS_URL`, `MAPS_API_KEY`).
  - Confirmar que `.env` y archivos sensibles estén excluidos en `.gitignore`.

- [x] **T1.1.3: Estructura de carpetas de la aplicación móvil**
  - Crear la estructura de `src/features/{passenger,driver,auth,extras}` (con subcarpetas base e `index.ts`).
  - Crear `src/components`, `src/hooks`, `src/services/{api,websocket,location,storage}`, `src/store`, `src/navigation`, `src/config`, `src/utils` y `src/types`.
  - Respetar la separación de responsabilidades y convención de nombres en inglés de `constitution.md`[cite: 1].

---

## Fase 1.2: Modelos y contratos TypeScript

- [ ] **T1.2.1: Modelos geoespaciales y de catálogo (`src/types/geo.ts`)**
  - [x] Coordenadas, GeoJSON `LineString` `[lng,lat]` y ruta oficial (`id`, `empresa_id`, `nombre_ruta`, `activo`, `trazado_ruta`) con validadores.
  - [ ] Paraderos: falta endpoint/schema en OpenAPI. `Stop = never`; no se inventan campos.
  - Contrastar nombres de campos con el contrato del backend sin inventar propiedades no documentadas.

- [x] **T1.2.2: Modelos de telemetría en tiempo real (`src/types/telemetry.ts`)**
  - Tipos y validación estricta de `route:joined`, `micro:position`, `micro:offline`, `micro:stopped`, `error`; emisión tipada `route:join` / `route:leave` con entero positivo.
  - `lastSeen` en milisegundos, `speed` en m/s, estados oficiales y `microId/rutaId`. Payloads HTTP Node y Core separados; su discrepancia no se oculta con un mapper supuesto.

- [x] **T1.2.3: Modelos de red y errores normalizados (`src/types/api.ts`)**
  - Definir interfaces para respuestas estructuradas y errores normalizados de red o servidor.
  - Garantizar tipado explícito sin uso injustificado de `any`.

---

## Fase 1.3: Configuración y servicios centrales de infraestructura

- [x] **T1.3.1: Configuración de entorno y constantes (`src/config/`)**
  - Implementar `src/config/env.ts` para cargar y validar variables de entorno y reportar faltantes de forma controlada.
  - Implementar `src/config/constants.ts` para *timeouts* y constantes técnicas base.

- [x] **T1.3.2: Almacenamiento local base (`src/services/storage/storageService.ts`)**
  - Implementar envoltorio tipado de lectura, escritura y eliminación para claves locales.
  - Evitar accesos directos al almacenamiento dispersos en componentes.

- [x] **T1.3.3: Cliente HTTP centralizado (`src/services/api/httpClient.ts`)**
  - Configurar instancia única con `baseURL`, `timeout`, cabeceras base e interceptores.
  - Normalizar errores HTTP y de red sin exponer detalles internos sensibles.

- [x] **T1.3.4: Gestor WebSocket centralizado (`src/services/websocket/socketClient.ts`)**
  - Implementar conexión, desconexión, suscripción/desuscripción a canales o *rooms*, emisión tipada y reconexión básica.
  - Mantener una gestión centralizada para evitar múltiples sockets abiertos sin control.

---

## Fase 1.4: Verificación y cierre de la fase

- [ ] **T1.4.1: Pruebas de humo HTTP y WebSocket**
  - [x] Consulta de rutas mediante HTTP local de fixture y parseo de paginación/GeoJSON oficial.
  - [x] Recepción y validación de eventos contractuales con transporte Socket.IO mock.
  - [ ] Integración real con API/Socket.IO, y paraderos cuando exista contrato.
  - Registrar si la prueba se ejecutó contra backend en vivo o entorno simulado/mock según disponibilidad de red.

- [ ] **T1.4.2: Manejo de fallos de conexión y entorno**
  - Simular URL inválida, *timeout* o servidor no disponible.
  - Confirmar que la aplicación captura el error de forma controlada y no sufre *crash*.

- [ ] **T1.4.3: Revisión de criterios de aceptación y calidad**
  - Ejecutar TypeScript, linter, pruebas y `npx expo start`; no ejecutar compilación nativa ni generar APK.
  - Verificar todos los criterios de aceptación de `spec/fase-1/spec.md`.
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

## Registro de avance — Fase 1 (24/11/2026)

- Rama activa: `feature/mobile-phase-1-base`, creada desde `origin/develop` actualizado,
  base `54dc929e426109110b0d6fa7630d0526251c355f`. Sin commits, push, merge ni PR.
- Se actualizan los documentos existentes en `spec/fase-1/`; las referencias previas
  a `specs/fase_1_base/` no correspondían a directorios reales. Constitución vigente:
  `spec/contitution.md`. El archivo local previo `contexto.md` se conserva sin cambios.
- [x] T1.1.1 parcial: Expo 57 + React Native 0.86.3, TypeScript estricto y scripts
  `typecheck`, `lint`, `format`, `format:check`, `test:smoke` configurados.
- [x] `npm run typecheck`: sin errores.
- [x] `npm run lint`: sin errores ni advertencias.
- [x] `npm run test:smoke`: 10 pruebas aprobadas con fixtures de OpenAPI/payload-gps
  y handlers Node. HTTP usa servidor local; Socket.IO un transporte mock; storage un
  driver en memoria. Se prueban geometrías, paginación, payloads/rangos, errores de red,
  503, parseo, timeout de petición/cuerpo, interceptores, conexión única, reconexión y
  restauración de rooms, limpieza compartida y fallos de consumidores/almacenamiento.
  La configuración de cinco reintentos/backoff se comprueba sobre las opciones enviadas
  a Socket.IO; no se afirma haber medido su transporte contra un servidor real.
- [x] `npx expo start --port 8082`: Metro iniciado (8081 estaba ocupado). Se probó
  inicialmente con `CI=1` y luego se reinició sin CI, con acceso de red para resolver
  los assets del manifiesto. URLs públicas de desarrollo suministradas al proceso.
  `/status` devuelve `200 packager-status:running`; manifiesto Android HTTP 200 para
  `rutas-en-tiempo-real-movil`; bundle servido por Metro HTTP 200, 7 259 053 bytes,
  1587 módulos en la comprobación final. Sin APK ni build nativo en esta continuación.
- Ante la instrucción actual se detuvo el intento de Gradle iniciado en el turno
  anterior y sus procesos Java; no se reanuda. Los artefactos CNG anteriores siguen
  ignorados. Prebuild/export/Gradle no forman parte de la validación vigente.
- [x] `.env`, `.env.local` y `.env.production` ignorados, verificado con `git check-ignore`.
- Fuentes consultadas (solo lectura): `../go-tacna-docs/contratos/openapi.yaml`,
  `eventos-websocket.md`, `payload-gps.md`, `jwt-claims.md`; handlers/config de
  `../go-tacna-backend/realtime`; `docker-compose.yml`, Makefile y Nginx de
  `../go-tacna-infraestructura`. Los nombres locales `go-tacna-*` corresponden a
  los repositorios de referencia indicados por el usuario.
- [x] Catálogo de rutas: servicio mínimo `getRoutes`, sin pantallas ni store de negocio.
- [ ] T1.2.1: falta únicamente el contrato de paraderos; no existe en OpenAPI.
- [ ] T1.4.1 integración real: no hay HTTP accesible en `127.0.0.1:8001` ni `:3001`.
  Docker CLI/Compose existen, pero `docker ps` falla por daemon/pipe inexistente,
  incluso fuera del sandbox. No se atribuye este fallo solo a permisos.
- Dependencia para levantar el entorno: faltan los bind mounts de backend
  `gotacna-backend-core`, `gotacna-api-gateway`, `go-tacna-location-service`. Solo
  está `realtime`, y no tiene `.env`; su configuración exige `JWT_SECRET`. No se
  crean esas carpetas ni se inventan credenciales para arrancar una pila incompleta.
- Infraestructura definida: PostgreSQL/PostGIS 16, base `gotacna_db`, puerto 5432
  restringido a loopback; Nginx `127.0.0.1:8001`, `/api/` -> Gateway/Core y
  `/socket.io/` -> Node 3001. Comando de arranque documentado: desde infraestructura,
  `docker compose up -d --build --wait`, tras restaurar fuentes y activar daemon.
- `.env.example` móvil listo para API `http://localhost:8001/api/v1` y origen
  Socket.IO `http://localhost:8001`. Usa prefijos Expo públicos y alias solicitados.
  Emulador: `10.0.2.2`; teléfono: host/túnel accesible. El bind loopback de Compose
  impide acceder por LAN sin configuración adicional en el entorno de referencia.
  No hay acceso directo de la app a BD ni secretos de backend en el bundle.
- [ ] Envío GPS: OpenAPI `/api/v1/tracking/position` usa Core (`201` y recurso),
  Node `/tracking/position` usa `202 {ok:true}`. Nginx no publica esa ruta hacia Node.
  Se mantienen tipos separados y se detiene solo esa integración hasta aclaración.
- [ ] T1.4.2: fallos verificados a nivel de infraestructura automatizada; la ausencia de
  crash y visualización del aviso en un dispositivo Android aún requieren ejecución real.
- [ ] T1.1.1 / T1.4.3: ejecución visual en Expo Go no realizada. La generación y
  entrega del bundle no sustituyen la comprobación en teléfono. El primer proceso
  dentro del sandbox avisó de assets no resueltos; al reiniciar con acceso de red,
  la comprobación de manifiesto/bundle pasó sin ese aviso. Metro permanece activo
  en 8082. La CLI notificó actualizaciones de paquetes disponibles; no se hizo un
  upgrade de SDK ajeno al alcance de la fase.
- Los servicios se exportan como singletons; constructores/transportes se exponen para
  pruebas aisladas. No hay llamadas de red ni acceso directo a storage en componentes.
- T1.3.4 usa ahora `socket.io-client` 4.x confirmado por docs y backend, no un
  WebSocket nativo incompatible. Singleton, timeouts, eventos tipados, rooms con
  conteo de consumidores, reconexión limitada y sin cola de emisión desconectada.
