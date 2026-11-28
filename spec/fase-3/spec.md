# Spec: Fase 3 — Módulo Pasajero: Mapa, Rutas, Tiempo Real y ETA

**Rama de revisión documental previa:** `feature/mobile-phase-2-ui-ux`
**Rama de implementación activa:** `feature/mobile-phase-3-passenger-live`
**Repositorio:** `rutas-en-tiempo-real-movil`
**Fase:** 3 — Módulo Pasajero (Mapa, Rutas, Tiempo Real y ETA)
**Estado:** Seguimiento por línea conectado en el móvil. Pendiente de validación desde un teléfono contra el servicio activo.
**Plan técnico:** `spec/fase-3/plan.md`
**Base de implementación:** `origin/develop` en `b2708aa`, PR #2 de Fase 2 integrado. Sus pendientes de dispositivo/usabilidad conservan su estado.

---

## 1. Propósito

Definir el alcance funcional del módulo de **Pasajero** para la **Fase 3** de la aplicación móvil (**Android** como plataforma inicial, con proyección a iOS y Web) del sistema de monitoreo de transporte público en tiempo real en Tacna[cite: 1, 5]. Esta fase construye la experiencia principal de consulta del pasajero: visualización de rutas y paraderos en el mapa, recepción de posiciones de unidades activas vía WebSocket, animación fluida de marcadores y estimación de tiempo de llegada (`ETA`)[cite: 1].

La aplicación consumirá los servicios del backend, los contratos documentados y los eventos en tiempo real como fuente de verdad. Las solicitudes, respuestas, filtros, eventos y cálculos deberán respetar la documentación contractual del proyecto y la Constitución local (`spec/contitution.md`), sin inventar campos, endpoints ni datos simulados como si provinieran del servidor[cite: 1].

### 1.1. Objetivos

- Integrar el mapa interactivo centrado en la ubicación del pasajero y en el contexto urbano de Tacna[cite: 1].
- Renderizar el `trazado_ruta` publicado. La separación ida/vuelta y los paraderos según zoom requieren sus contratos oficiales antes de integrarse[cite: 1].
- Suscribirse al canal/_room_ de la ruta seleccionada vía WebSocket para mostrar unidades activas sin recarga manual[cite: 1].
- Animar suavemente los marcadores y, cuando existan posiciones suficientes, obtener una orientación visual local sin añadir `heading` al contrato[cite: 1].
- Mostrar cercanía calculada localmente y `ETA` consultado al servidor, identificado como aproximado, junto con la frescura de señal[cite: 1].
- Completar la composición del pasajero con mapa principal, controles superpuestos y ficha inferior usando Figma y los componentes de Fase 2 como referencia.

### 1.2. Fuera de alcance

Esta fase no incluye:

- Flujo de **Modo Conductor**, inicio/fin de turno o servicio en segundo plano (_Foreground Service_) de GPS (Fase 4)[cite: 1].
- Gestión avanzada de cuentas, planes/límites de suscripción, favoritos persistentes, alertas de proximidad o reporte de aforo/incidencias (Fase 5)[cite: 1].
- Pruebas en rutas físicas de Tacna, auditoría de batería en turno o empaquetado final de distribución (Fase 6)[cite: 1].
- Persistencia _offline_ transaccional o colas de sincronización fuera de la caché básica de catálogo acordada en esta fase.
- Cambios en el backend, base de datos, contratos o repositorios hermanos (`rutas-en-tiempo-real-docs`, `rutas-en-tiempo-real-backend`, `rutas-en-tiempo-real-frontend`, `rutas-en-tiempo-real-infraestructura`, `contexto.md`)[cite: 5].

---

## 2. Alcance funcional

| ID     | Componente                        | Descripción                                                                                                            |
| ------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| F3-C01 | Mapa y ubicación del pasajero     | SDK de mapas, permiso de ubicación en primer plano y centrado de cámara en la posición del usuario[cite: 1].           |
| F3-C02 | Rutas y paraderos                 | Caché del catálogo y trazado publicado; paraderos y sentidos separados condicionados a contratos oficiales[cite: 1].   |
| F3-C03 | Telemetría y animación en vivo    | Suscripción por ruta, actualización selectiva y animación con orientación visual derivada cuando sea posible[cite: 1]. |
| F3-C04 | Cercanía, ETA y frescura de señal | Distancia local, consulta de ETA contractual y aviso de señal antigua[cite: 1].                                        |
| F3-C05 | Composición visual del pasajero   | Mapa como área principal, selector y controles superpuestos, ficha inferior y continuidad del flujo de Fase 2.         |

### 2.1. Actor principal en esta fase

- **Pasajero:** Consulta rutas disponibles, ubica su posición y los paraderos, observa unidades activas en tiempo real y revisa su tiempo estimado de llegada[cite: 1].

---

## 3. Historias de usuario

### US-001 — Ver rutas y paraderos en el mapa

Como pasajero, quiero ver la ruta elegida trazada en el mapa junto con sus paraderos y mi ubicación actual, para orientarme y saber por dónde circula el servicio[cite: 1].

### US-002 — Seguir micros en tiempo real sin saltos

Como pasajero, quiero ver las unidades activas de mi ruta desplazarse de forma fluida en el mapa sin recargar manualmente, para identificar qué unidad está más cerca de mí o de mi paradero[cite: 1].

### US-003 — Conocer el tiempo estimado de llegada y si la señal está al día

Como pasajero, quiero ver el tiempo estimado de llegada de la unidad y saber si su última actualización es reciente o lleva tiempo sin reportar, para decidir si esperar o buscar otra opción[cite: 1].

---

## 4. Requisitos funcionales

### 4.1. Mapa y geolocalización del usuario — F3-C01

**FR-001 — Visor de mapa y ubicación actual**
La aplicación deberá integrar un SDK de mapas cuyo funcionamiento se haya comprobado en Expo Go con la versión instalada de Expo (SDK 57 al revisar), solicitar permiso de ubicación en primer plano de forma explicada y centrar la cámara en la ubicación actual del pasajero[cite: 1]. La elección de proveedor, claves y limitaciones se documentará antes de instalar dependencias; no se elegirá una alternativa que exija un build nativo para estas pruebas.

**FR-002 — Respaldo ante permiso denegado o ubicación no disponible**
Si el usuario niega el permiso de ubicación o el GPS está desactivado, la vista deberá mostrar el estado correspondiente en español y permitir seguir explorando rutas y unidades en el mapa sin bloquear la consulta[cite: 1].

### 4.2. Rutas y paraderos — F3-C02

**FR-003 — Consulta y caché de catálogo geoespacial**
El módulo deberá reutilizar `getRoutes` de `src/features/passenger/services/catalogService.ts`, el cliente HTTP y `storageService` para consultar y cachear el catálogo paginado de rutas[cite: 1]. Los paraderos solo se consultarán cuando exista contrato oficial. La caché tendrá versión, origen de API, fecha de actualización y caducidad; datos vencidos o corruptos nunca se presentarán como recién descargados.

**FR-004 — Visualización de ida/vuelta y control de densidad de paraderos**
Se dibujará el GeoJSON `LineString` de `trazado_ruta`, convirtiendo `[longitud, latitud]` a la representación que requiera el visor. Un trazado ausente o inválido mostrará un aviso sin impedir consultar unidades. El contrato actual no distingue ida/vuelta ni publica paraderos: no se duplicará o invertirá el trazado para aparentar sentidos oficiales ni se fabricarán puntos. Estas dos integraciones quedarán pendientes hasta disponer de contratos; entonces se diferenciarán sentidos y se limitará la densidad de paraderos por zoom[cite: 1].

### 4.3. Telemetría en tiempo real y animación — F3-C03

**FR-005 — Suscripción segmentada por ruta**
Al seleccionar una ruta se reutilizará el gestor Socket.IO centralizado y su suscripción mediante `route:join` con `rutaId` entero[cite: 1]. Al cambiar de ruta o salir de la vista se liberarán suscripciones, escuchas y solicitudes asociadas sin desconectar consumidores ajenos. Tras reconectar se procesará `route:joined` como nueva lista inicial; se descartarán respuestas de selecciones anteriores y posiciones duplicadas o más antiguas que la última aceptada por unidad. Volver del segundo plano exige revalidar datos, sin activar GPS del pasajero en segundo plano.

**FR-006 — Animación fluida y rumbo de unidades**
Las posiciones se interpolarán sin provocar renderizados masivos[cite: 1]. El contrato no contiene `heading`: la orientación visual podrá calcularse entre dos posiciones válidas y cronológicamente crecientes de una misma unidad. Sin desplazamiento suficiente, se conservará una orientación válida anterior o un icono neutro. Este valor derivado pertenece a presentación/dominio y no modifica payloads ni implica conocer el sentido oficial de circulación.

**FR-007 — Manejo de ruta sin unidades activas**
La vista mostrará `empty` solo tras recibir una lista válida sin unidades activas[cite: 1]. Esperar la lista inicial es `loading`; perder conexión es `offline`. `micro:offline` y `micro:stopped` actualizarán la unidad según el contrato, detendrán su animación e invalidarán su ETA; no se borrarán ni modificarán otras unidades por esas notificaciones.

### 4.4. Cercanía, ETA y frescura de señal — F3-C04

**FR-008 — Distancia y consulta de estimación de llegada (`ETA`)**
La cercanía se calculará mediante Haversine entre la unidad y una referencia válida del pasajero o un paradero contractual. Será distancia directa, no distancia de recorrido. El ETA principal se consultará mediante `eta:request` y su confirmación de respuesta documentada: `{microId, etaSeconds, estimated: true}` o `{error}`. Se mostrará como aproximado, sin afirmar que considera tráfico, trayecto vial o que el vehículo se acerca efectivamente. Sin referencia, con señal antigua, unidad detenida/desconectada, pérdida de conexión, error o timeout, se mostrará «No disponible». No habrá un cálculo local alternativo silencioso; cualquier futura aproximación local con velocidad suavizada requiere una decisión documentada antes de implementarla.

**FR-009 — Indicador de frescura de la última actualización**
La tarjeta mostrará la antigüedad desde `lastSeen` (milisegundos). Como política visual inicial configurable, una antigüedad superior a 60 segundos indicará «Sin señal reciente» y ocultará el ETA. Este aviso no cambia el `status` contractual. El timeout de desconexión documentado del servidor es 120 segundos por defecto, con comprobación periódica; `micro:offline` o el estado recibido son la fuente del estado desconectado. Fechas futuras no se considerarán automáticamente recientes: se tratarán como frescura no comprobable y sin ETA hasta revalidar.

### 4.5. Composición visual y continuidad — F3-C05

**FR-010 — Mapa principal y ficha inferior**
Figma será la referencia visual de la composición: mapa como superficie principal, selector/controles superpuestos y ficha inferior con estados cerrado, parcial y expandido. Se reutilizarán tokens, Inter, iconos y componentes de Fase 2, con áreas seguras, controles de al menos `48x48dp`, desplazamiento para texto ampliado y acciones accesibles equivalentes a los gestos. Las superposiciones no deberán impedir seleccionar marcadores visibles.

**FR-011 — Flujo y validación visual**
Se conservará el máximo de tres acciones principales desde la vista del pasajero: ruta → unidad/paradero contractual → ubicación y detalle. Cambiar de ruta limpiará la selección, foco y ETA anteriores. Se comparará la interfaz renderizada en teléfono con los frames de referencia, incluidos los estados de carga, vacío, permiso denegado, sin conexión y error. Los ejemplos de la galería interna quedarán identificados y separados de datos reales.

---

## 5. Rutas y vistas del módulo pasajero

| Vista / componente                      | Propósito en Fase 3                                                                                           | Acceso                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Pantalla principal del pasajero         | Mapa en vivo, selector de ruta, polilíneas, paraderos, marcadores de unidades y estados de pantalla[cite: 1]. | Pasajero / usuario en consulta[cite: 1].   |
| Tarjeta de detalle de unidad / paradero | Información de unidad activa, distancia, `ETA` estimado y antigüedad de última actualización[cite: 1].        | Al seleccionar unidad o paradero[cite: 1]. |

---

## 6. Integración y contratos

### 6.1. Fuente contractual

Las llamadas REST y los eventos Socket.IO respetarán los contratos oficiales y `src/types/`[cite: 1, 5]. Fuentes consultadas en solo lectura, con rutas relativas a la raíz del repositorio móvil: `../go-tacna-docs/contratos/openapi.yaml`, `eventos-websocket.md` y `payload-gps.md` dentro del mismo directorio de contratos. La disponibilidad de un contrato no acredita que el servicio esté desplegado ni accesible.

Ante cualquier discrepancia o campo no confirmado en el contrato, se documentará la dependencia sin inventar esquemas definitivos.

### 6.2. Eventos y operaciones en alcance

| Operación / evento                | Dirección                    | Uso en Fase 3                                                                                          |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| Catálogo `GET /rutas`             | REST, relativo a la base API | Respuesta paginada y `trazado_ruta` GeoJSON opcional/nulo.                                             |
| `route:join` / `route:leave`      | Socket.IO cliente → servidor | Payload entero positivo `rutaId`; sala del servidor `ruta:{rutaId}`.                                   |
| `route:joined`                    | Socket.IO servidor → cliente | `{rutaId, micros: MicroPosition[]}`; lista inicial y resincronización.                                 |
| `micro:position`                  | Socket.IO servidor → cliente | `{microId, rutaId, lat, lng, speed, status, lastSeen}`.                                                |
| `micro:offline` / `micro:stopped` | Socket.IO servidor → cliente | `{microId, lastSeen}` / `{microId}`.                                                                   |
| `eta:request`                     | Socket.IO cliente → servidor | `{microId, lat, lng}` de la referencia; respuesta por confirmación (callback), preferida por contrato. |
| `eta:response`                    | Respuesta de ETA documentada | Éxito `{microId, etaSeconds, estimated: true}` o error `{error}`; no requiere otra conexión.           |
| Paraderos y sentidos separados    | Contrato pendiente           | No hay endpoint/schema ni campos diferenciados confirmados; no se inventan.                            |

`speed` se expresa en m/s; `lastSeen` es un entero de milisegundos desde época Unix. Los estados son `moviendo`, `detenido` y `desconectado`. No se sustituirán los nombres oficiales por `unitId`, `routeId` o `timestamp` en el intercambio ni se añadirá `heading`. El cliente central ya expone `requestEta` con tipos, validación, timeout, cancelación y descarte de confirmaciones tardías, verificado con transporte aislado. La operación observada en backend usa `callback(null, eta)` para éxito y `callback({error})` para fallo; no se ha probado aún contra un Socket.IO accesible.

### 6.3. Dependencias y brechas contractuales

- Paraderos y sentidos ida/vuelta separados son dependencias abiertas. Se puede implementar mapa, catálogo publicado y telemetría sin ellos; no se marcarán como terminados esos requisitos condicionales hasta verificar sus contratos e integración.
- Si un contrato y el servicio disponible discrepan, se detendrá únicamente la operación afectada y se registrará la aclaración necesaria. No se modificarán repositorios hermanos ni se conectará la app directamente a BD.
- SDK/proveedor de mapas, credenciales públicas necesarias y conectividad desde Expo Go quedan por comprobar antes de integrar. Las restricciones o necesidades de builds nativos no se resolverán cambiando el flujo de prueba autorizado.
- Catálogo local verificado: `GET http://127.0.0.1:8001/api/v1/rutas` responde 200 y el nuevo servicio obtiene tres rutas con geometría. Socket.IO público responde 404 y `127.0.0.1:3001` rechaza conexión; no hay prueba de ETA en vivo ni desde teléfono.

### 6.4. Resultado del contraste y condición de detención

Se consultaron ramas actuales de los cinco repositorios en GitHub y sus fuentes sin modificar sus checkouts. Backend publica el catálogo en `main` (`6d7c4a9`) y el servidor de tiempo real en `develop` (`9bd86f3`); docs se contrastó en su `develop` actualizado (`3358eb0`). La existencia de código en ramas distintas no acredita su despliegue conjunto.

- **Falta contrato/soporte de paraderos:** no hay endpoint público ni esquema de paradero en el catálogo auditado. Se mantiene `Stop = never` y T3.2.3 pendiente.
- **Faltan datos de sentidos:** `trazado_ruta` es un único `LineString`, sin campos oficiales separados de ida/vuelta. Su representación diferenciada queda detenida.
- **Lista inicial corregida en backend:** en `fix/passenger-realtime-contract-access` (`9fe9bd0`), `route:joined` y `micro:position` aplican `toMicroDto`. Las muestras de velocidad son privadas del servidor.
- **Servicio accesible pendiente:** rooms y ETA existen en código (`route:join/leave`, `eta:request`), pero no están disponibles en los puertos locales comprobados. Falta desplegar/enrutar el servidor existente; no se debe duplicar la implementación de T035/T036.
- **Rumbo visual:** cada marcador deriva su orientación de dos posiciones ordenadas separadas por al menos 5 m.

La entrada `/passenger` utiliza el catálogo, el trazado disponible y la sala de la línea seleccionada. Permite consultar un micro, centrarlo y estimar su llegada a la ubicación del pasajero. Paraderos e ida/vuelta quedan diferidos con independencia del seguimiento.

---

## 7. Requisitos no funcionales

**NFR-001 — Arquitectura modular:** Todo el código específico del pasajero debe residir en `src/features/passenger/`, reutilizando clientes y utilidades compartidas de `src/services/`, `src/utils/` y `src/components/`[cite: 1].

**NFR-002 — Fluidez y bajo consumo:** Las actualizaciones por WebSocket no deben degradar la fluidez del mapa ni disparar descargas repetitivas innecesarias de catálogo[cite: 1].

**NFR-003 — Idioma y claridad:** UI, documentación técnica, JSDoc y comentarios detallados de funciones se redactarán en **español** por indicación del usuario; identificadores, archivos, componentes y props se mantienen en **inglés**. Se conservarán los nombres oficiales de campos y eventos del contrato aunque su idioma difiera[cite: 1].

**NFR-004 — Manejo seguro de errores:** Los errores de red, WebSocket o cálculo no deben provocar fallos no capturados ni exponer información interna[cite: 1].

**NFR-005 — Flujo de prueba Expo/OTA:** Las pruebas y verificaciones interactivas de esta fase deben ejecutarse mediante `npx expo start`, sin generar compilaciones nativas ni `.apk` para probar.

---

## 8. Criterios de aceptación

1. El mapa se renderiza en el flujo Expo (`npx expo start`), solicita ubicación en primer plano de forma explicada y centra la cámara en la ubicación actual del usuario[cite: 1].
2. Se muestra el trazado publicado, se toleran geometrías ausentes y la caché evita descargas redundantes. Paraderos y sentidos separados se verifican cuando exista contrato; mientras falte permanecen registrados como pendientes[cite: 1].
3. La suscripción procesa lista inicial, posiciones, parada/desconexión y reconexión; no mezcla rutas ni retrocede por mensajes antiguos. Los marcadores se animan sin exigir un campo `heading` inexistente[cite: 1].
4. Se muestran distancia directa, ETA aproximado procedente de la operación contractual y antigüedad de señal. Se comprueban error, timeout, referencia ausente, señal antigua, unidad detenida/desconectada y respuestas de una selección anterior.
5. Se cubren los estados de carga, ruta sin unidades activas (`empty`), permiso denegado (`permission-denied`), sin conexión (`offline`) y error controlado en español[cite: 1].
6. El chequeo de tipos de TypeScript y el linter pasan sin errores en la rama `feature/mobile-phase-3-passenger-live`[cite: 1].
7. La composición de mapa, controles y ficha se compara con Figma en teléfono mediante `npx expo start`; se documentan capturas, tamaño de texto, gestos y áreas táctiles. Servir el bundle no sustituye esta revisión.
8. Las pruebas verifican caducidad/corrupción de caché, resincronización y limpieza al cambiar de ruta, salir o volver del segundo plano. Los resultados con mocks se distinguen de los de servicios reales.

---

## 9. Trazabilidad con el plan

| Requisitos de esta Spec | Referencia en `plan.md`                           |
| ----------------------- | ------------------------------------------------- |
| FR-001–FR-002           | F3-C01, secciones 2, 4.1, 5 y 11 (Etapa 1).       |
| FR-003–FR-004           | F3-C02, secciones 4.2, 6 y 11 (Etapa 2).          |
| FR-005–FR-007           | F3-C03, secciones 4.3–4.4, 6, 7 y 11 (Etapa 3).   |
| FR-008–FR-009           | F3-C04, secciones 4.5, 8, 10 y 11 (Etapa 4).      |
| FR-010–FR-011           | F3-C05, secciones 4.6, 7, 10 y 11 (Etapas 1 y 4). |

---

## 10. Pendientes de definición antes de avanzar a Fase 4

1. Registrar paraderos y sentidos como ampliaciones futuras cuando existan contratos.
2. Verificar SDK/Expo Go y acceso real a catálogo, Socket.IO y ETA; registrar cada dependencia de entorno sin darla por resuelta por mocks.
3. Revisar el umbral visual inicial de 60 segundos y la coherencia del ETA aproximado sin alterar el timeout contractual del servidor.
4. Comprobar limpieza de suscripciones y ubicación de primer plano al salir o pasar al Modo Conductor de Fase 4, y conservar pendientes propios de validación de Fase 2 en sus documentos.

---

**Fin de la especificación de la Fase 3.**
