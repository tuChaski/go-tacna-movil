# Tareas de Implementación — Fase 3: Módulo Pasajero: Mapa, Rutas, Tiempo Real y ETA

## Estado documental

- **Spec:** `spec/fase-3/spec.md` (alcance implementable y dependencias explícitas).
- **Plan:** `spec/fase-3/plan.md` (ejecución progresiva, aún no iniciada).
- **Fase:** 3 — Módulo Pasajero (Mapa, Rutas, Tiempo Real y ETA).
- **Rama de esta revisión documental:** `feature/mobile-phase-2-ui-ux`.
- **Rama de implementación prevista:** `feature/mobile-phase-3-passenger-live`, que se creará desde `develop` actualizado al iniciar esa implementación.

Las tareas cubren composición visual del mapa principal, ubicación de primer plano, catálogo y caché, telemetría por ruta, animación, distancia, ETA remoto y frescura. Paraderos y sentidos separados dependen de contratos oficiales. Modo Conductor, GPS en segundo plano, funciones complementarias y pruebas de campo siguen en Fases 4–6[cite: 1]. Esta preparación documental no inicia Fase 3 ni cierra pendientes de Fase 2.

## Dependencias previas

Antes de iniciar la implementación, verificar:

- Base implementada de Fases 1 y 2 disponible en `develop`, con revisión explícita de sus tareas pendientes de integración, dispositivo y usabilidad. No considerar completas las fases por la sola existencia de sus componentes.
- Rama de trabajo `feature/mobile-phase-3-passenger-live` creada desde `develop` actualizado.
- Contratos y entorno revalidados en los repositorios hermanos en solo lectura; probar acceso HTTP/Socket.IO desde el teléfono, no asumir que `localhost` del equipo funciona en Expo Go.

No duplicar clientes HTTP o WebSocket ni meter lógica de cálculo dentro de los componentes visuales[cite: 1]. No compilar ni generar `.apk` para probar; usar `npx expo start`.

---

## Fase 3.0: Comprobaciones previas y decisiones

- [ ] **T3.0.1: Revalidar base, contratos y dependencias reales**
  - Revisar los pendientes de Fases 1–2 antes de iniciar la rama de implementación.
  - Contrastar `GET /rutas`, GeoJSON `[lng,lat]`, `microId/rutaId`, `speed` en m/s y `lastSeen` en ms con los contratos vigentes; no exigir `heading`.
  - Registrar ausencia de contratos de paraderos/sentidos y disponibilidad real de catálogo, Socket.IO y ETA. Detener solo la integración afectada ante discrepancias.

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

- [ ] **T3.2.1: Extender catálogo existente y caché local**
  - Extender `catalogService.ts`/`getRoutes` con paginación y caché mediante `httpClient`/`storageService`; no crear otro servicio equivalente ni motor de almacenamiento.
  - Aplicar TTL inicial de 24h, versión, fecha y origen API; reutilizar datos vigentes e invalidar caché corrupta o incompatible.
  - Revalidar al vencer. Si se ofrece catálogo vencido sin red, señalar antigüedad; no persistir ubicaciones personales, posiciones o ETA como catálogo.

- [ ] **T3.2.2: Dibujar trazado contractual y tolerar geometría ausente**
  - Convertir GeoJSON `LineString` `[lng,lat]` al visor y representar el `trazado_ruta` disponible.
  - Mostrar aviso cuando falte geometría sin bloquear consulta de unidades. No inventar sentidos duplicando o invirtiendo el trazado.

- [ ] **T3.2.3: Integrar paraderos y sentidos al resolverse sus contratos**
  - Dependencia abierta: actualmente no hay endpoint/schema de paraderos ni campos oficiales para ida/vuelta separados; mantener `Stop = never` mientras corresponda.
  - Cuando existan contratos, definir adaptadores, diferenciación de sentidos y densidad por zoom con pruebas. No modificar los repositorios oficiales desde esta tarea.
  - Esta tarea y la integración completa seguirán pendientes mientras falte el contrato; no declararlas resueltas por ejemplos visuales o mocks.

---

## Fase 3.3: Telemetría por WebSocket y animación de unidades

- [ ] **T3.3.1: Suscripción y desuscripción por ruta en WebSocket**
  - Suscribir el cliente WebSocket únicamente al canal/_room_ de la ruta seleccionada y desuscribirse al cambiar de ruta o salir de la vista.
  - Usar `rutaId` entero en `route:join`/`route:leave` y el conteo de consumidores del singleton; no desconectar consumidores ajenos.
  - Aplicar `route:joined` como lista inicial. Mostrar `empty` solo después de confirmar que no hay unidades activas, y `offline`/error ante fallo de conexión.

- [ ] **T3.3.2: Animación fluida y orientación visual derivada**
  - Implementar interpolación suave (_smooth marker animation_) entre la posición anterior y la nueva para evitar saltos bruscos.
  - Calcular rumbo visual solo con posiciones válidas, ordenadas y desplazamiento suficiente de una misma unidad; en otro caso conservar orientación válida o icono neutro.
  - No añadir `heading` al payload ni confundir rumbo visual con sentido contractual; evitar renderizados masivos.

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

## Registro de avance — Fase 3 (pendiente de ejecución)

- Revisión documental del 25/11/2026 en `feature/mobile-phase-2-ui-ux`, autorizada para preparar el siguiente PR. Solo se ajustan los tres documentos de esta fase; no se crea aún la rama de implementación.
- Se corrigieron rutas documentales y nombres de telemetría y se incorporaron tareas de composición Figma, contratos pendientes, caché, ciclo de vida y validación real.
- Decisión documentada: ETA del servidor como fuente principal; no se introduce un estimador local automático. Los umbrales iniciales de 60s y TTL 24h son políticas configurables del cliente, no cambios al servidor.
- Fuentes consultadas en solo lectura: contratos OpenAPI/WebSocket/payload GPS de `../go-tacna-docs/contratos/`, tipos/clientes móviles y tareas previas. La documentación confirma m/s, ms y ausencia de `heading`; paraderos y sentidos continúan abiertos.
- Todas las tareas de implementación siguen sin marcar. No se implementaron mapas, ubicación, store o ETA; no se añadieron dependencias ni se levantaron servicios o Expo en esta revisión.
- Conectividad real y handler ETA del servicio disponible no verificados en esta revisión. No se extrapola el antiguo bloqueo de entorno de Fase 1 como un diagnóstico nuevo.
- Validación de esta revisión: formato de los tres Markdown aprobado; referencias locales y coherencia de 11 requisitos y 15 tareas pendientes comprobadas. `npm run typecheck` y `npm run lint` del repositorio finalizaron sin errores. Son chequeos de la base actual, no pruebas de una implementación de Fase 3.
- Al implementar, registrar resultados unitarios/de integración y pruebas en Expo Go por separado de mocks. No hay una prueba de Fase 3 ejecutada por el solo hecho de actualizar este registro.
