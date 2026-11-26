# Plan de Implementación: Fase 3 — Módulo Pasajero: Mapa, Rutas, Tiempo Real y ETA

**Repositorio:** `rutas-en-tiempo-real-movil`
**Rama de esta revisión documental:** `feature/mobile-phase-2-ui-ux`
**Rama de implementación prevista:** `feature/mobile-phase-3-passenger-live`
**Fase:** 3 — Módulo Pasajero (Mapa, Rutas, Tiempo Real y ETA)
**Estado:** Autorizado para ejecución progresiva
**Especificación funcional:** `spec/fase-3/spec.md`
**Revisión:** 25/11/2026; solo documentación, sin iniciar la implementación.

## 0. Documentos de referencia y estado previo

Este plan se apoya en las siguientes fuentes de verdad:

| Documento                                                                                                                                  | Uso                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `spec/contitution.md`                                                                                                                      | Constitución local: arquitectura, seguridad, pruebas y convenciones; se conserva su nombre actual[cite: 1].            |
| `spec/fase-1/spec.md`, `plan.md` y `task.md`                                                                                               | Base implementada y dependencias reales de contratos/entorno aún pendientes.                                           |
| `spec/fase-2/spec.md`, `plan.md` y `task.md`                                                                                               | Componentes, flujos y validación visual/usabilidad pendiente.                                                          |
| `spec/fase-3/spec.md`                                                                                                                      | Alcance, requisitos y criterios de aceptación de esta fase.                                                            |
| `../go-tacna-docs/contratos/openapi.yaml`, `eventos-websocket.md`, `payload-gps.md`                                                        | Referencias de contratos desde la raíz móvil; los dos Markdown están en ese mismo directorio.                          |
| [Figma go-tacna](https://www.figma.com/design/Lw9Pbwc65lMKyjsW5IWZaD/go-tacna?node-id=70-16325)                                            | Composición de pasajero; mapa `70:16325` y sin conexión `73:251`, consultados anteriormente. Revalidar al implementar. |
| Repositorios hermanos (`rutas-en-tiempo-real-docs`, `rutas-en-tiempo-real-backend`, `rutas-en-tiempo-real-infraestructura`, `contexto.md`) | Consulta de solo lectura para contratos, endpoints/eventos, entorno y contexto general[cite: 5].                       |

### 0.1. Estado de las fases previas y prerrequisitos

Antes de implementar la Fase 3, deben estar disponibles:

- Cliente HTTP centralizado, gestor WebSocket centralizado, envoltorio de almacenamiento y tipos base en `src/types/` (Fase 1)[cite: 1].
- Componentes base de UI, tokens visuales y estructura de `src/features/passenger/` (Fase 2)[cite: 1].
- Fases previas integradas en `develop` y pendientes identificados: la revisión documental no completa pruebas de dispositivo, usabilidad ni integraciones abiertas.
- Inventario de contratos vigentes, SDK 57 instalado y compatibilidad real de mapas/ubicación con Expo Go. Consultar `https://docs.expo.dev/versions/v57.0.0/` y las páginas específicas antes de escribir código de Expo/React Native; revalidar la versión si cambió.

No duplicar instancias HTTP o WebSocket ni meter lógica geoespacial o de cálculo dentro de componentes visuales[cite: 1].

## 1. Objetivo

Definir la solución de Fase 3 para mapa principal y ubicación del pasajero, catálogo publicado con caché, telemetría por ruta, animación, cercanía y consulta de ETA contractual. Paraderos y sentidos separados quedan condicionados a sus contratos. Se conserva la interfaz y el flujo de Fase 2 sin duplicar clientes ni presentar demostraciones como datos reales.

## 2. Enfoque arquitectónico

Se mantiene la arquitectura modular de `spec/contitution.md`[cite: 1]:

- **Presentación (`src/features/passenger/screens/` y `components/`):** mapa, polilíneas, marcadores, selector de ruta y tarjeta de unidad/paradero[cite: 1].
- **Aplicación / Hooks (`src/features/passenger/hooks/`):** selección, suscripciones, ubicación de primer plano, consulta de ETA y estados de pantalla.
- **Dominio y Utilidades (`src/utils/` y `src/features/passenger/`):** distancia Haversine, orientación visual derivada, frescura y presentación de ETA. No duplicar el estimador del servidor sin decisión explícita.
- **Infraestructura (`src/services/api/`, `src/services/websocket/`, `src/services/storage/`):** consumo de endpoints de catálogo, caché local y canales en tiempo real[cite: 1].

### 2.1. Tecnologías

| Responsabilidad                  | Tecnología                                                              | Estado                                                                   |
| -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Framework móvil                  | React Native / Expo + TypeScript estricto                               | Base de Fase 1[cite: 1]                                                  |
| Mapa y ubicación de primer plano | Proveedor y módulos por seleccionar con prueba en Expo Go/SDK instalado | No hay proveedor elegido ni compatibilidad acreditada.                   |
| Tiempo real                      | Cliente WebSocket / Socket.IO centralizado                              | Base de Fase 1[cite: 1]                                                  |
| Caché local                      | `storageService` existente sobre AsyncStorage                           | Reutilizar; no introducir otro motor.                                    |
| Estado compartido del pasajero   | Store del dominio conforme al estándar Zustand de la Constitución       | Planificado; dependencia aún no instalada, no se añade en esta revisión. |
| Interfaz                         | Componentes/tokens de Fase 2, Inter, Lucide y áreas seguras             | Reutilizar y adaptar al mapa principal.                                  |

Cualquier dependencia estructural nueva se documentará conforme a `spec/contitution.md`. La selección de mapas se resolverá con un ADR que registre proveedor, versión, plataformas verificadas, uso de claves y prueba en Expo Go; una alternativa que requiera build nativo no cumple este flujo. Instalar paquetes con el comando Expo compatible indicado en `AGENTS.md`. Pruebas de aplicación exclusivamente mediante `npx expo start`, sin APK, prebuild ni builds nativos.

## 3. Alcance funcional de la fase

| ID     | Capacidad                     | Descripción                                                                                               |
| ------ | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| F3-C01 | Mapa y ubicación del pasajero | Integración de SDK de mapas, permiso de ubicación en primer plano y centrado en posición actual[cite: 1]. |
| F3-C02 | Rutas y paraderos             | Trazado publicado y caché; paraderos y sentidos separados sujetos a contratos.                            |
| F3-C03 | Telemetría y animación        | Suscripciones, resincronización, control de orden y orientación visual local.                             |
| F3-C04 | Cercanía, ETA y señal         | Distancia directa, ETA remoto aproximado y antigüedad de actualización.                                   |
| F3-C05 | Composición visual            | Mapa principal, controles superpuestos y ficha inferior accesible coherente con Figma.                    |

### 3.1. Fuera de alcance

- Flujo de **Modo Conductor** y servicio en segundo plano de GPS (Fase 4)[cite: 1].
- Favoritos persistentes, alertas de proximidad, reporte de aforo/incidencias o gestión de planes (Fase 5)[cite: 1].
- Pruebas en rutas físicas de Tacna, auditoría de batería o empaquetado final (Fase 6)[cite: 1].

## 4. Diseño de la solución

### 4.1. Mapa y geolocalización del pasajero

- Solicitar permiso de ubicación en primer plano de forma clara y contextualizada en español[cite: 1].
- Centrar la cámara en la ubicación actual del usuario cuando esté disponible (con respaldo seguro si aún no hay coordenada del usuario o falta permiso).
- Si el permiso es denegado, mostrar estado explicativo en español sin impedir seleccionar rutas y revisar unidades[cite: 1].
- Liberar escuchas de ubicación al salir del contexto activo o pasar a segundo plano; al volver, recuperar una referencia válida. El pasajero no ejecuta seguimiento en segundo plano.
- No seguir recentrando la cámara en cada actualización si el usuario está explorando manualmente; ofrecer una acción explícita de volver a su ubicación cuando esté disponible.

### 4.2. Rutas y paraderos con caché local

- Extender `src/features/passenger/services/catalogService.ts` y su `getRoutes`, incluyendo todas las páginas requeridas; reutilizar `httpClient` y `storageService`.
- Política inicial de catálogo: TTL de 24 horas, configurable y propio de la app, separado del contrato. Guardar versión de esquema, origen API normalizado y fecha de actualización; no mezclar cachés de entornos ni fixtures con datos reales.
- Reutilizar datos vigentes; al vencer, revalidar. Una caché vencida podrá servir de referencia sin conexión con aviso de antigüedad, nunca como dato actualizado. Invalidar datos corruptos o de versión/origen distinto y permitir reintentar sin bloquear la pantalla.
- Dibujar únicamente el `trazado_ruta` GeoJSON `[lng, lat]` publicado. Si falta, mantener unidades y aviso de trazado no disponible. No inferir ida/vuelta invirtiendo o duplicando coordenadas.
- Mantener pendientes paraderos y sentidos separados. Tras publicarse sus contratos, definir el adaptador y el umbral de zoom con prueba visual antes de integrar esos marcadores.

### 4.3. Suscripción en tiempo real por ruta

- Usar `socketClient` y su conteo de consumidores para adquirir/liberar la ruta con el `rutaId` contractual. No crear otro Socket.IO ni repetir su bucle de reconexión.
- Aplicar `route:joined` como lista inicial de la selección vigente y actualizar por `microId`. Mientras no llegue la confirmación válida, mantener carga/error por timeout, no `empty` prematuro.
- Para `micro:position`, aceptar solo la ruta vigente y marcas `lastSeen` crecientes por unidad; descartar duplicados y eventos anteriores. No interpolar hacia una posición antigua.
- Procesar `micro:offline` y `micro:stopped` únicamente para unidades conocidas del contexto actual. Detener animaciones e invalidar ETA de esa unidad; conservar sus estados contractuales y excluirla de opciones de llegada activa.
- Cambiar de ruta, perder foco o desmontar libera escuchas, suscripción y trabajo propio e invalida solicitudes pendientes. No desconectar consumidores ajenos. Al volver o reconectar, revalidar con una nueva lista inicial y limpiar unidades ausentes de ella.
- Como los eventos de parada/desconexión no incluyen ruta ni secuencia completa, no se supondrán garantías adicionales de orden. Una contradicción con la lista vigente requiere resincronizar; probar cambios rápidos de selección y eventos tardíos.

### 4.4. Interpolación suave y orientación de marcadores

- Implementar utilidades/componentes de animación para interpolar la posición del marcador entre la coordenada anterior y la nueva en un intervalo corto y constante, evitando saltos bruscos[cite: 1].
- No consumir un campo `heading`: no existe en el contrato actual. Calcular orientación visual a partir de dos coordenadas válidas y ordenadas de la misma unidad cuando haya desplazamiento suficiente; sin movimiento fiable, conservar orientación previa o icono neutro. Documentar y probar el umbral visual antes de activarlo, sin modificar el DTO.
- Evitar re-renderizados innecesarios de todo el árbol del mapa mediante memorización y actualización aislada de cada marcador.

### 4.5. Distancia, consulta de ETA y frescura de señal

- Implementar Haversine como función pura para cercanía directa a una referencia válida. No equiparar esa distancia con recorrido vial ni deducir que la unidad se aproxima al pasajero.
- Fuente principal de ETA: `eta:request` con `{microId, lat, lng}` y confirmación por callback, preferida por contrato. Validar éxito `{microId, etaSeconds, estimated: true}` o error `{error}`. Extender tipos y operación del gestor central, no crear una conexión o endpoint REST adicional.
- Usar el timeout central existente `SOCKET_TIMEOUT_MS` (10 segundos al revisar), limitar a una solicitud pendiente por selección y espaciar nuevas consultas mediante una política documentada. Ignorar respuestas de una ruta, unidad, referencia o generación de conexión anteriores.
- Mostrar el resultado como aproximado. No activar un estimador local silencioso ni mantener ETA visible sin conexión, con señal antigua, unidad detenida/desconectada, referencia ausente, error o timeout: mostrar «No disponible».
- `speed` está documentado en m/s y `lastSeen` en milisegundos. La app no necesita resolver de nuevo esas unidades ni replicar los parámetros de suavizado del servidor para consumir ETA.
- Política visual inicial: antigüedad superior a 60 segundos = «Sin señal reciente», configurable. No equivale al estado desconectado del servidor: su referencia documental es `OFFLINE_AFTER_MS=120000` y comprobación cada 15 segundos, no una garantía de llegada exacta del evento. Fecha futura = frescura no comprobable hasta revalidar.

### 4.6. Composición visual y adaptación desde Fase 2

- Revisar en Figma la guía y los frames del pasajero y estados; registrar los nodos usados. Referencias ya identificadas: mapa `70:16325` y sin conexión `73:251`. No afirmar que se revisaron todas las ocho páginas ni modificar el archivo fuente.
- Adaptar `PassengerHomeScreen` para mapa como área principal y selector/acciones superpuestos; reutilizar tokens, cabecera, textos, iconos y ficha de Fase 2. Limitar el cambio al pasajero sin alterar el flujo del conductor.
- Ficha cerrada/parcial/expandida, zonas seguras y contenido desplazable; gestos con acciones equivalentes accesibles, controles de al menos 48dp y texto ampliado sin recortes. Evitar que paneles bloqueen marcadores o controles visibles.
- Conservar tres acciones principales desde la pantalla del pasajero. El cambio de ruta limpia selección/foco/ETA; no agrega pasos de autenticación ni confirmaciones innecesarias.
- Mostrar estados de permiso, error, carga y red dentro de la composición sin perder el mapa cuando la consulta pueda continuar. Separar explícitamente fixtures internos de datos reales.
- Comparar capturas del teléfono con las referencias, registrar diferencias y corregirlas; la generación del bundle o una prueba con mocks no valida el diseño renderizado.

## 5. Estructura del proyecto

```text
rutas-en-tiempo-real-movil/
├── src/
│   ├── features/
│   │   └── passenger/
│   │       ├── components/
│   │       │   ├── PassengerMapView.tsx
│   │       │   ├── RouteSelector.tsx
│   │       │   ├── BusMarker.tsx
│   │       │   ├── StopMarker.tsx
│   │       │   └── UnitInfoSheet.tsx
│   │       ├── hooks/
│   │       │   ├── usePassengerLocation.ts
│   │       │   ├── usePassengerRoutes.ts
│   │       │   ├── useRouteTelemetry.ts
│   │       │   └── useUnitEta.ts
│   │       ├── screens/
│   │       │   └── PassengerHomeScreen.tsx
│   │       ├── services/
│   │       │   ├── catalogService.ts       # existente; extender sin duplicar
│   │       │   └── etaService.ts           # adaptador al SocketClient central
│   │       ├── store/
│   │       │   └── passengerStore.ts
│   │       └── index.ts
│   └── utils/
│       ├── geo.ts
│       └── eta.ts
```

Notas:

- Los componentes visuales no realizan llamadas HTTP ni manejan sockets directamente[cite: 1].
- Las utilidades de distancia, rumbo visual, validación/formato de ETA y frescura deben ser puras y verificables con pruebas unitarias. La solicitud de ETA vive en servicios/hooks.
- `StopMarker` y consumo de paraderos son componentes previstos condicionados al contrato, no archivos ya implementados. El store compartido respetará el estándar del proyecto; apertura de la ficha sigue siendo estado local.
- Los adaptadores de Expo Router permanecen en `src/app/`; componentes, hooks y servicios no se ubican allí. Documentar funciones y responsabilidades con comentarios/JSDoc detallados en español.

## 6. Contratos de telemetría y catálogo

- **Catálogo REST:** `GET /rutas`, relativo a `EXPO_PUBLIC_API_BASE_URL`, paginado y con `trazado_ruta` opcional/nulo. Paraderos y sentidos separados carecen de contrato publicado; `Stop = never` se conserva hasta su definición oficial.
- **Telemetría Socket.IO:** `route:join`/`route:leave` reciben un entero positivo. `route:joined` devuelve `{rutaId, micros}`; cada posición contiene `microId`, `rutaId`, `lat`, `lng`, `speed`, `status`, `lastSeen`, sin `heading`. `micro:offline` contiene `microId/lastSeen`; `micro:stopped`, `microId`.
- **ETA:** operación documentada `eta:request` y respuesta `eta:response`, preferentemente por confirmación del envío. El cliente de Fase 1 solo expone joins/leaves: añadir la operación tipada y validada es trabajo pendiente de Fase 3. Verificar que el servicio disponible cumple el contrato antes de cerrar la integración.
- Conservar los DTO oficiales y sus validadores estrictos; cualquier nombre o estado visual derivado queda en el dominio/presentación. Una discrepancia con el backend se registra y bloquea solo esa operación.

## 7. Rutas y navegación

Integrar `PassengerHomeScreen` dentro de la navegación centralizada de la aplicación (`src/navigation/`) y mantener la accesibilidad rápida de la regla de los tres toques establecida en la Fase 2[cite: 1].

Se reutiliza Expo Router y `/passenger`; no se introduce otro contenedor de navegación. Esta preparación documental permanece en la rama de Fase 2. La rama de Fase 3 se creará más adelante desde `develop` actualizado, tras integrar y revisar el avance previo conforme al flujo acordado.

## 8. Alcance de conectividad

La consulta en vivo requiere acceso HTTP/Socket.IO desde el teléfono; verificar host LAN, puertos y enrutamiento publicados, sin suponer que `localhost` del equipo sirve para Expo Go. La caché cubre solo catálogo y sus trazados, no mapas base sin conexión, posiciones ni ETA. Ante pérdida de red, congelar posiciones como última referencia claramente antigua y ocultar ETA; reanudar tras resincronizar, sin afirmar que datos guardados están en vivo.

## 9. Seguridad y privacidad

- Solicitar permiso de ubicación en primer plano de forma transparente y solo cuando se requiera ubicación del pasajero.
- No exponer errores internos ni trazas técnicas al usuario final[cite: 1].
- No persistir ubicación personal, telemetría o ETA en la caché de catálogo ni incluir secretos de backend en variables `EXPO_PUBLIC_*`. Cualquier clave pública del proveedor se configura y restringe según la decisión de mapas.

## 10. Estrategia de pruebas

| Tipo                                       | Alcance en Fase 3                                                                                                                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chequeo estático                           | Compilación TypeScript (`tsc --noEmit` / `tsc -b`) y linter (`ESLint`).                                                                                                                                           |
| Pruebas unitarias                          | Haversine, conversión `[lng,lat]`, rumbo sin movimiento, frescura a 60s y fecha futura, validación/formato de ETA y sus errores.                                                                                  |
| Pruebas de integración / hooks             | Lista inicial/reconexión, posiciones duplicadas o antiguas, cambio rápido de ruta, parada/desconexión, limpieza y retorno de segundo plano; ETA tardío/timeout; paginación, TTL, origen y corrupción de caché.    |
| Pruebas de UI                              | Tres acciones, apertura/expansión/cierre de ficha, cambio de ruta, ETA no disponible y estados sin tapar controles; mantener regresión de Fase 2.                                                                 |
| Verificación en Expo Go (`npx expo start`) | SDK de mapas, permisos/GPS apagado, mapa real, selección, gestos y texto ampliado en teléfono; comparación con Figma. Paraderos/sentidos solo con contrato. Registrar dispositivo, capturas y resultado, sin APK. |
| Integración real                           | Catálogo, Socket.IO y ETA contra servicios accesibles desde el teléfono; separada de las pruebas con mocks. Un manifiesto o bundle HTTP 200 no acredita el flujo en vivo.                                         |

## 11. Secuencia de implementación

### Etapa 1 — Mapa y ubicación del pasajero

- Revalidar contratos, estado de fases previas y entorno; registrar ADR de SDK/compatibilidad Expo Go antes de integrar dependencias.
- Integrar visor y ubicación de primer plano, adaptando mapa principal, controles y ficha según 4.6.
- Manejar centrado de cámara y estado cuando el permiso es denegado o el GPS está apagado.

### Etapa 2 — Rutas, paraderos y caché local

- Extender catálogo existente con paginación, TTL, aislamiento por origen y recuperación de caché corrupta.
- Dibujar el trazado publicado. Integrar paraderos y sentidos únicamente cuando se resuelvan sus contratos; dejar esas subtareas abiertas mientras falten.

### Etapa 3 — Telemetría por WebSocket y animación fluida

- Integrar suscripción y resincronización por `rutaId`, eventos de ciclo de vida y descarte de datos obsoletos.
- Animar por unidad y aplicar orientación visual derivada cuando sea fiable, sin exigir `heading` al servidor.

### Etapa 4 — Cercanía, `ETA`, frescura y validación

- Ampliar el gestor central para consultar ETA, validar respuesta y vincularla a la selección vigente; añadir distancia y frescura, sin ETA local automático.
- Ejecutar pruebas, typecheck/lint, comparación visual y flujo en Expo Go con `npx expo start`; distinguir mocks de servicios reales en `task.md`.

## 12. Riesgos, bloqueos y decisiones pendientes

### 12.1. Bloqueos

| ID  | Bloqueo                                                                                                                    | Impacto                                                                   | Mitigación                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| B1  | Paraderos y sentidos separados sin contrato; `heading` no forma parte del payload.                                         | No se puede cerrar la representación contractual de paraderos/ida-vuelta. | Usar trazado publicado y orientación visual derivada; mantener dependencias abiertas sin inventar DTO.                 |
| B2  | Disponibilidad de API/Socket.IO, host accesible desde teléfono y proveedor/clave de mapas por revalidar.                   | Integración real todavía no comprobada.                                   | Preflight de entorno en Fase 3, mocks contractuales y registro separado de resultados reales; sin acceso directo a BD. |
| B3  | ETA existe en docs pero su operación no está expuesta por el cliente móvil ni se ha probado contra el servicio disponible. | No puede afirmarse ETA real por disponer solo de documentación.           | Extensión tipada del singleton, pruebas de confirmación/error/timeout e integración posterior.                         |
| B4  | Fase 2 conserva validación visual y usabilidad pendiente.                                                                  | Esta revisión no acredita su cierre ni permite omitirla.                  | Mantener trazabilidad en `spec/fase-2/task.md` y revisar antes de comenzar la implementación en vivo.                  |

### 12.2. Decisiones pendientes

| ID    | Decisión                                                                                                                | Impacto                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| DP-01 | SDK/proveedor y dependencias de ubicación compatibles con SDK instalado y Expo Go; restricciones de claves/plataformas. | ADR y prueba de visor antes de avanzar; no se preselecciona biblioteca sin comprobarla. |
| DP-02 | Umbral de desplazamiento para rumbo visual y frecuencia de consulta ETA.                                                | Parámetros de presentación/carga que deben fijarse y probarse al integrar.              |
| DP-03 | Resolución oficial de paraderos y sentidos separados.                                                                   | Requiere contrato externo; no se resuelve desde el móvil.                               |

Políticas iniciales documentadas en esta revisión: ETA contractual remoto como fuente principal sin estimador local automático, aviso visual tras 60s y TTL de catálogo de 24h. Son decisiones del cliente, no cambios al contrato; se validarán al implementar. Cualquier futuro ETA local con promedio móvil requiere una decisión expresa y rótulo de aproximación.

Ninguna de estas decisiones se resolverá por suposición sin quedar documentada.

## 13. Criterios de finalización

La Fase 3 se considerará completada cuando:

1. La documentación esté integrada desde la rama actual y la implementación se realice en `feature/mobile-phase-3-passenger-live` creada desde `develop` actualizado.
2. El mapa se muestre en el flujo Expo (`npx expo start`), solicite ubicación en primer plano y centre la cámara en el usuario[cite: 1].
3. El trazado y catálogo funcionen con caché validada; paraderos y sentidos tengan contrato y prueba para declarar su integración completa. Si siguen pendientes, se reporta entrega parcial, no cierre total de Fase 3.
4. Suscripción, reconexión, ciclo de vida, descarte de posiciones antiguas y animación funcionen sin otra instancia de socket ni un campo `heading` inventado.
5. Distancia directa, ETA remoto aproximado y señal antigua se presenten correctamente con todos sus casos de indisponibilidad.
6. TypeScript, linter y pruebas unitarias/de integración finalicen sin errores[cite: 1].
7. Mapa principal, controles y ficha se comparen con Figma en teléfono, respetando accesibilidad y tres acciones; se documenten diferencias y resultados reales.

---

**Fin del plan de implementación de la Fase 3.**
