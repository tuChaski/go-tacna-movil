# Tareas de Implementación — Fase 3: Módulo Pasajero: Mapa, Rutas, Tiempo Real y ETA

## Estado documental

- **Spec:** `spec/fase-3/spec.md` (alcance implementable y dependencias explícitas).
- **Plan:** `spec/fase-3/plan.md` (seguimiento integrado; validación de campo pendiente).
- **Fase:** 3 — Módulo Pasajero (Mapa, Rutas, Tiempo Real y ETA).
- **Rama de revisión documental previa:** `feature/mobile-phase-2-ui-ux`.
- **Rama de implementación activa:** `feature/mobile-phase-3-passenger-live`, creada desde `origin/develop` actualizado en `b2708aa` (PR #2 integrado).

Las tareas cubren composición visual del mapa principal, ubicación de primer plano, catálogo y caché, telemetría por ruta, animación, distancia, ETA remoto y frescura. Paraderos y sentidos separados dependen de contratos oficiales. Modo Conductor, GPS en segundo plano, funciones complementarias y pruebas de campo siguen en Fases 4–6[cite: 1]. La implementación actual es parcial y no cierra los pendientes de dispositivo/usabilidad de Fase 2.

## Estado vigente del seguimiento por línea

- El backend `fix/passenger-realtime-contract-access` (`9fe9bd0`) aplica `toMicroDto` tanto en `route:joined` como en `micro:position`. Se conserva el validador oficial. Paraderos y sentidos separados quedan diferidos y no condicionan este flujo.
- La entrada real `/passenger` muestra catálogo, trazado, marcadores y ficha. La sala se libera al cambiar de línea, salir o perder el primer plano. La prueba de integración con transporte aislado comprueba orden temporal, parada, pérdida de señal, reconexión y liberación. La prueba de pantalla comprueba línea sin trazado, selección, ficha y vuelta del segundo plano.
- La ubicación requiere permiso de primer plano y se obtiene al pulsar el control. La distancia es directa y el ETA procede del servidor. La lista de micros también se puede explorar sin ubicación. En el navegador se conserva la lista.
- API local en 8001 responde HTTP 200 para rutas y 404 para Socket.IO. Los puertos 3001 (Node) y 8080 (proxy opcional) rechazan la conexión. En el móvil se debe configurar la IP accesible del servidor en las variables públicas indicadas en `.env.example`. No se conoce la IP del equipo de despliegue.
- Faltan la sesión con un micro emitiendo posiciones, la comprobación de ETA y permisos reales, y la comparación visual y de accesibilidad en teléfono con Figma. El selector está encima del visor en el flujo de lectura para que los controles sigan accesibles al ampliar el texto.

### Validación del seguimiento integrado

- TypeScript y lint aprobados. Las 30 pruebas de servicios pasaron con acceso al servidor HTTP local de pruebas.
- La nueva prueba de la pantalla de pasajero pasó con el límite normal. Una prueba previa de Fase 2 excedió los 5 s en dos ejecuciones. Las 19 pruebas de interfaz pasaron al ejecutar `npm run test:ui -- --testTimeout=30000`, sin cambiar el límite del repositorio.
- `npx expo start --port 8091` sirvió el manifiesto y el bundle completo de Android con HTTP 200 (7 837 751 bytes de JavaScript). La prueba física y el ETA con telemetría real siguen abiertos.

## Dependencias previas

Antes de iniciar la implementación, verificar:

- Base implementada de Fases 1 y 2 disponible en `develop`, con revisión explícita de sus tareas pendientes de integración, dispositivo y usabilidad. No considerar completas las fases por la sola existencia de sus componentes.
- Rama de trabajo `feature/mobile-phase-3-passenger-live` creada desde `develop` actualizado.
- Contratos y entorno revalidados en los repositorios hermanos en solo lectura; probar acceso HTTP/Socket.IO desde el teléfono, no asumir que `localhost` del equipo funciona en Expo Go.

No duplicar clientes HTTP o WebSocket ni meter lógica de cálculo dentro de los componentes visuales[cite: 1]. No compilar ni generar `.apk` para probar; usar `npx expo start`.

---

## Fase 3.0: Comprobaciones previas y decisiones

- [x] **T3.0.1: Revalidar base, contratos y dependencias reales**
  - Revisar los pendientes de Fases 1–2 antes de iniciar la rama de implementación.
  - Contrastar `GET /rutas`, GeoJSON `[lng,lat]`, `microId/rutaId`, `speed` en m/s y `lastSeen` en ms con los contratos vigentes; no exigir `heading`.
  - Registrar ausencia de contratos de paraderos/sentidos y disponibilidad real de catálogo, Socket.IO y ETA. Detener solo la integración afectada ante discrepancias.
  - Verificado: cinco remotos consultados; PR #2 en base; API local 200, Socket.IO 404 y puerto 3001 sin servicio. Incompatibilidad inicial reproducida en develop y corregida en la revisión posterior 9fe9bd0. Conexión desde teléfono no comprobada.

- [ ] **T3.0.2: Elegir SDK y registrar parámetros de integración**
  - Consultar documentación de la versión instalada de Expo (SDK 57 al revisar) y registrar ADR del proveedor, ubicación, claves y compatibilidad comprobada en Expo Go.
  - Documentar las dependencias estructurales que se incorporarán, incluido el store del dominio conforme a la Constitución; reutilizar AsyncStorage y los clientes centrales.
  - Registrar frecuencia de consulta ETA y umbral de movimiento para rumbo visual antes de activarlos. Políticas iniciales: aviso de señal tras 60s y TTL de catálogo de 24h, configurables y separadas del contrato.
  - Conservar `npx expo start` como único flujo para levantar/probar la app; no resolver incompatibilidades mediante builds nativos.

---

## Fase 3.1: Mapa y geolocalización del pasajero

- [ ] **T3.1.1: Integración del visor de mapa y permiso de ubicación**
  - Integrar en `PassengerMapView` el SDK seleccionado y comprobado en Expo Go; configurar únicamente claves públicas del proveedor cuando correspondan.
  - Implementar la solicitud de permiso de ubicación en primer plano con explicación clara en español.

- [ ] **T3.1.2: Centrado de cámara y respaldo sin permiso/GPS**
  - Centrar la cámara en la ubicación actual del pasajero cuando esté disponible, con respaldo seguro si no hay coordenada aún.
  - Garantizar que si el permiso es denegado o el GPS está apagado se muestre el estado correspondiente y se pueda seguir consultando rutas en el mapa.
  - Respetar exploración manual de cámara y ofrecer recentrado explícito; liberar escuchas al salir/pasar a segundo plano y revalidar al volver.

- [ ] **T3.1.3: Adaptar composición visual a Figma sin duplicar Fase 2**
  - Revalidar guía y frames de referencia, incluidos mapa `70:16325` y sin conexión `73:251`; registrar nodos usados y diferencias deliberadas.
  - Adaptar mapa principal, selector/controles superpuestos y ficha cerrada/parcial/expandida, reutilizando tokens y componentes existentes.
  - Conservar tres acciones principales, controles mínimos de 48dp, áreas seguras, texto ampliado y alternativas accesibles a los gestos, sin tapar marcadores.
  - Mantener los fixtures de revisión separados de catálogo/telemetría reales y documentar funciones con JSDoc/comentarios en español.

---

## Fase 3.2: Rutas, paraderos y caché local

- [x] **T3.2.1: Extender catálogo existente y caché local**
  - Extender `catalogService.ts`/`getRoutes` con paginación y caché mediante `httpClient`/`storageService`; no crear otro servicio equivalente ni motor de almacenamiento.
  - Aplicar TTL inicial de 24h, versión, fecha y origen API; reutilizar datos vigentes e invalidar caché corrupta o incompatible.
  - Revalidar al vencer. Si se ofrece catálogo vencido sin red, señalar antigüedad; no persistir ubicaciones personales, posiciones o ETA como catálogo.
  - Verificado: paginación/caché con pruebas automatizadas y consulta HTTP real de tres rutas con geometría. Driver nativo aislado; la pantalla ya consume el catálogo. Persistencia en teléfono pendiente.

- [ ] **T3.2.2: Dibujar trazado contractual y tolerar geometría ausente**
  - Convertir GeoJSON `LineString` `[lng,lat]` al visor y representar el `trazado_ruta` disponible.
  - Mostrar aviso cuando falte geometría sin bloquear consulta de unidades. No inventar sentidos duplicando o invirtiendo el trazado.

- [ ] **T3.2.3: Integrar paraderos y sentidos al resolverse sus contratos**
  - Dependencia abierta: actualmente no hay endpoint/schema de paraderos ni campos oficiales para ida/vuelta separados; mantener `Stop = never` mientras corresponda.
  - Cuando existan contratos, definir adaptadores, diferenciación de sentidos y densidad por zoom con pruebas. No modificar los repositorios oficiales desde esta tarea.
  - Esta ampliación queda diferida. El seguimiento se implementa con la línea y el trazado disponibles.

---

## Fase 3.3: Telemetría por WebSocket y animación de unidades

- [x] **T3.3.1: Suscripción y desuscripción por ruta en WebSocket**
  - Suscribir el cliente WebSocket únicamente al canal/_room_ de la ruta seleccionada y desuscribirse al cambiar de ruta o salir de la vista.
  - Usar `rutaId` entero en `route:join`/`route:leave` y el conteo de consumidores del singleton; no desconectar consumidores ajenos.
  - Aplicar `route:joined` como lista inicial. Mostrar `empty` solo después de confirmar que no hay unidades activas, y `offline`/error ante fallo de conexión.

- [ ] **T3.3.2: Animación fluida y orientación visual derivada**
  - Implementar interpolación suave (_smooth marker animation_) entre la posición anterior y la nueva para evitar saltos bruscos.
  - Calcular rumbo visual solo con posiciones válidas, ordenadas y desplazamiento suficiente de una misma unidad; en otro caso conservar orientación válida o icono neutro.
  - No añadir `heading` al payload ni confundir rumbo visual con sentido contractual; evitar renderizados masivos.
  - Avance parcial verificado: `getVisualHeading` valida unidad/ruta, orden temporal y desplazamiento mínimo 5m. El visor interpola con un intervalo de 600 ms. Falta revisar la fluidez en teléfono.

- [ ] **T3.3.3: Resincronización, orden y ciclo de vida**
  - Descartar posiciones duplicadas/antiguas por `microId/lastSeen` y datos de rutas o selecciones anteriores.
  - Procesar `micro:offline` y `micro:stopped` sin afectar otras unidades; detener su animación e invalidar ETA.
  - Limpiar suscripciones, escuchas y trabajo propio al perder foco, cambiar ruta o desmontar; volver del segundo plano y reconectar exige una lista inicial vigente.
  - Cubrir cambios rápidos de selección, eventos tardíos y contradicciones que requieren resincronización, sin asumir un número de secuencia inexistente.

---

## Fase 3.4: Cercanía, `ETA`, frescura de señal y validación

- [ ] **T3.4.1: Distancia, ETA contractual y frescura de señal**
  - Implementar Haversine para cercanía directa y ampliar el gestor central con consulta tipada `eta:request` y validación de confirmación/respuesta `eta:response`, sin otra conexión.
  - Validar `{microId, etaSeconds, estimated: true}` o `{error}`, timeout central y selección/referencia vigentes; ignorar respuestas tardías o de otra conexión.
  - Mostrar ETA aproximado del servidor, sin cálculo local alternativo automático ni promesa de tráfico/ruta vial. Sin referencia, con señal antigua, parada/desconexión, pérdida de red, error o timeout: «No disponible».
  - Usar `lastSeen` en ms, advertir tras más de 60s e invalidar ETA. Una fecha futura no prueba frescura. No confundir ese aviso visual con el estado desconectado del servidor, documentado en 120s por defecto.
  - Avance parcial verificado: DTO/validadores de ETA, `SocketClient.requestEta`, cancelación/desconexión/timeout y utilidades de distancia, conversión, frescura, elegibilidad y formato. La ficha ya consume el cliente ETA con referencia de primer plano. Falta la medición con un micro real.

- [ ] **T3.4.2: Pruebas unitarias, chequeo estático y verificación con `npx expo start`**
  - Probar distancia, conversión de coordenadas, rumbo sin movimiento, frescura/fechas futuras, validación de ETA y timeout.
  - Probar lista inicial, reconexión, mensajes antiguos, parada/desconexión, cambio de ruta y limpieza; paginación, TTL, origen y corrupción de caché; regresión de UI y regla de tres acciones.
  - Verificar que TypeScript (`tsc`) y el linter pasen sin errores y probar el arranque/flujo mediante `npx expo start` (sin generar `.apk`).
  - Actualizar las tareas a `[x]` solo después de completar y verificar su resultado.

- [ ] **T3.4.3: Verificar integración real y registrar bloqueos de entorno**
  - Probar HTTP/Socket.IO y ETA desde un teléfono contra el servicio disponible. Confirmar que su implementación cumple lo documentado; publicar el contrato no acredita conectividad.
  - Si faltan servicio, red o credenciales, registrar dependencia real y resultados de mocks por separado; no cerrar la integración en vivo ni conectar directamente con BD.

- [ ] **T3.4.4: Comparación visual y accesibilidad en Expo Go**
  - Levantar únicamente con `npx expo start` y comparar capturas del teléfono con Figma para mapa, superposiciones, ficha y estados.
  - Registrar dispositivo, tamaño de texto, gestos, botones de expansión/cierre, retorno y foco de lector de pantalla. Corregir recortes o controles tapados.
  - Conservar la validación de usabilidad pendiente de Fase 2 en su registro; esta tarea no inventa participantes ni sustituye esa ronda con pruebas automatizadas.

---

## Capacidades expresamente diferidas a fases posteriores

Estas capacidades no tienen tareas de implementación en esta fase y se abordarán en sus `Specs` correspondientes:

- Servicio en segundo plano (_Foreground Service_), muestreo GPS continuo del conductor y cola _offline_ de telemetría (Fase 4)[cite: 1].
- Autenticación, gestión de roles/planes, favoritos, alertas de proximidad y reporte de aforo/incidencias (Fase 5)[cite: 1].
- Pruebas en rutas físicas de Tacna, auditoría de batería en turno y empaquetado final de distribución (Fase 6)[cite: 1].

## Regla de ejecución

La implementación deberá respetar `spec/contitution.md`, `spec/fase-3/spec.md` y `plan.md`. Ante discrepancias entre contrato y servicio se detendrá solo la operación afectada y se registrará la dependencia sin fabricar payloads. Se mantienen UI, documentación, JSDoc y comentarios en español; identificadores en inglés y nombres oficiales de campos/eventos sin traducir. Las tareas bloqueadas por contratos no se marcan completas ni se elimina su alcance para afirmar un cierre total.

## Registro documental previo — preparación de Fase 3 (25/11/2026)

- Revisión documental del 25/11/2026 en `feature/mobile-phase-2-ui-ux`, autorizada para preparar el siguiente PR. Solo se ajustan los tres documentos de esta fase; no se crea aún la rama de implementación.
- Se corrigieron rutas documentales y nombres de telemetría y se incorporaron tareas de composición Figma, contratos pendientes, caché, ciclo de vida y validación real.
- Decisión documentada: ETA del servidor como fuente principal; no se introduce un estimador local automático. Los umbrales iniciales de 60s y TTL 24h son políticas configurables del cliente, no cambios al servidor.
- Fuentes consultadas en solo lectura: contratos OpenAPI/WebSocket/payload GPS de `../go-tacna-docs/contratos/`, tipos/clientes móviles y tareas previas. La documentación confirma m/s, ms y ausencia de `heading`; paraderos y sentidos continúan abiertos.
- Todas las tareas de implementación siguen sin marcar. No se implementaron mapas, ubicación, store o ETA; no se añadieron dependencias ni se levantaron servicios o Expo en esta revisión.
- Conectividad real y handler ETA del servicio disponible no verificados en esta revisión. No se extrapola el antiguo bloqueo de entorno de Fase 1 como un diagnóstico nuevo.
- Validación de esta revisión: formato de los tres Markdown aprobado; referencias locales y coherencia de 11 requisitos y 15 tareas pendientes comprobadas. `npm run typecheck` y `npm run lint` del repositorio finalizaron sin errores. Son chequeos de la base actual, no pruebas de una implementación de Fase 3.
- Al implementar, registrar resultados unitarios/de integración y pruebas en Expo Go por separado de mocks. No hay una prueba de Fase 3 ejecutada por el solo hecho de actualizar este registro.

## Registro histórico — primera entrega parcial, anterior a la corrección del backend

### Contraste de los cinco repositorios y Figma

Se consultaron los cinco remotos de `https://github.com/tuChaski` mediante lectura de referencias; no se hizo fetch, checkout ni modificación dentro de los repositorios hermanos. La copia actualizada de objetos de docs se obtuvo solo en `.git` del móvil, sin crear ramas ni alterar su repositorio de origen.

| Repositorio     | Snapshot consultado                       | Resultado relevante                                                                                                                                                                                                                                 |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Móvil           | `develop` / `b2708aa`                     | PR #2 integrado. Se creó `feature/mobile-phase-3-passenger-live` desde esta base limpia; sin commits ni publicación de este avance.                                                                                                                 |
| Backend         | `main` / `6d7c4a9`; `develop` / `9bd86f3` | Core implementa catálogo paginado y trazado; Node en `realtime/` implementa rooms y ETA (T035/T036). Se detectó snapshot con campo interno no permitido y ramas/rutas de servicio que requieren integración de despliegue. No recrear esos módulos. |
| Docs            | `develop` / `3358eb0`; `main` / `6014469` | OpenAPI y schemas confirman campos/unidades, ETA aproximado y ausencia de paraderos, sentidos separados y heading. DEC-002 Expo/MapLibre figura pendiente; no acredita elección o compatibilidad Expo Go.                                           |
| Frontend        | `develop` / `54a7b4d`                     | Ya hay administración/editor de rutas y GeoJSON; se usa de referencia sin replicar tareas de administración en móvil.                                                                                                                               |
| Infraestructura | `develop` / `a76080f`                     | Compose/Nginx prevén API pública y proxy `/socket.io/` hacia servicio 3001. Su configuración no demuestra que el servicio esté disponible ahora.                                                                                                    |

Figma: contexto y capturas de pasajero/mapa `70:16325` y sin conexión `73:251` obtenidos mediante la integración. Se identificaron selector superpuesto, ficha inferior, controles y requisitos de navegación. No se editó Figma ni se implementó una nueva composición de pantalla en esta entrega.

### Qué falta y qué se detuvo

1. **Paraderos:** falta endpoint REST y DTO/schema oficial, incluida su asociación a ruta y coordenadas. No se crean consultas ni puntos como datos definitivos; T3.2.3 sigue abierta.
2. **Sentidos de ruta:** falta representación oficial de ida/vuelta separados; existe un único `trazado_ruta` LineString. No se fabrican trazados inversos.
3. **Lista inicial:** `realtime/src/handlers/passenger.js` emite `getRuta(rutaId)` de `realtime/src/services/fleetState.js`; el objeto contiene `speedSamples`, prohibido por `additionalProperties: false` en el esquema de Micro. Se ejecutó ese módulo puro desde el snapshot auditado en memoria y el validador móvil rechazó el resultado. Backend debe proyectar los campos oficiales, o resolver formalmente la discrepancia con docs. No se amplían validadores ni se oculta el campo desde móvil.
4. **Acceso al servidor existente:** sondeos reales desde este equipo: `/api/v1/rutas` en `127.0.0.1:8001` devuelve 200; `/socket.io/?EIO=4&transport=polling` devuelve 404; `127.0.0.1:3001/health` da `ECONNREFUSED`. Falta servir/enrutar el Node ya implementado y probar desde el teléfono. No se levantó ni modificó infraestructura.
5. **Heading:** no existe como campo recibido. La utilidad local ya puede derivar orientación visual; no sustituye la falta de sentidos oficiales ni acredita animación integrada.

Por la condición del usuario se detuvo la integración de lista inicial/reconexión y del circuito completo del pasajero en vivo. No se instalaron SDK de mapas/ubicación ni Zustand, no se implementaron GPS, marcadores animados, paraderos, hooks de seguimiento o ETA visible. La pantalla de Fase 2 mantiene su identificación de demostración. La fase no queda completada.

### Avance independiente implementado y verificado

- `catalogService.ts`: se extiende el servicio existente con paginación, operación compartida entre consumidores, TTL 24h, versión/origen, caché vencida señalada, invalidación por corrupción y recuperación controlada. Proyecta únicamente campos de catálogo y geometría, excluyendo relaciones expandidas de unidades/ETA. Sin duplicar HTTP/almacenamiento ni guardar GPS/ETA.
- `SocketClient.requestEta`: usa el socket existente y el callback observado `callback(null, eta)` / `callback({error})`; tipos y validadores estrictos, timeout 10s, aborto, desconexión y descarte de respuestas tardías. Su prueba usa transporte aislado, no un servidor en vivo.
- `src/utils/geo.ts` y `eta.ts`: Haversine, conversión `[lng,lat]`, rumbo visual con tiempo creciente y umbral 5m, frescura 60s/fecha futura, elegibilidad y formato de ETA. Sin cálculo local de llegada alternativo ni campo heading inventado.
- Los códigos `CANCELLED`/`REMOTE` son internos de `Result`; los payloads y estados contractuales del backend se conservan. Comentarios/JSDoc añadidos en español.
- Prueba HTTP real del nuevo catálogo: tres rutas y tres geometrías, segundo acceso desde caché. El driver de almacenamiento fue en memoria aislada; no demuestra persistencia ni conectividad en teléfono.
- `npm run typecheck` y `npm run lint`: aprobados.
- `npm run test:smoke`: 29 pruebas aprobadas (10 previas y 19 nuevas), incluyendo caché, exclusión de relaciones, ETA, geometría y rechazo de la lista inicial incompatible.
- `npm run test:ui`: 18 aprobadas al repetir sin cambios. La primera ejecución fría agotó el límite de 5s en el primer montaje del conductor (17/18); la repetición pasó en 1.9s total, sin ampliar timeout ni modificar UI.
- `npx expo start --port 8084`: Metro iniciado; manifiesto Android HTTP 200 y bundle completo sin carga diferida HTTP 200 (7 438 343 bytes). Esta comprobación acredita arranque/compilación JavaScript, no visualización en teléfono ni funcionamiento de servicios en vivo. No se generó APK ni se ejecutaron builds nativos.
- Pendientes globales: SDK/visor y permiso real, pantalla adaptada a Figma, flota en vivo, integración del ETA y validación manual/accesibilidad/usabilidad. Los avances parciales no marcan completas sus tareas principales.
