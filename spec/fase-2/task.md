# Tareas de Implementación — Fase 2: Diseño UI/UX, Flujos de Interacción y Estados de Pantalla

## Estado documental

- **Spec:** `spec/fase-2/spec.md` (autorizado para el alcance implementable).
- **Plan:** `spec/fase-2/plan.md` (autorizado para ejecución progresiva).
- **Fase:** 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla.
- **Rama de implementación:** `feature/mobile-phase-2-ui-ux`, creada desde `develop` actualizado.

Las tareas de este documento cubren el sistema de diseño base, la matriz de estados de pantalla, los flujos de interfaz de Pasajero y Modo Conductor, la navegación centralizada y la validación inicial de usabilidad[cite: 1]. La conexión con telemetría real, cálculo de ETA y servicio GPS en segundo plano corresponden a las Fases 3 y 4 y se mantienen fuera de este documento[cite: 1].

## Dependencias previas

Antes de iniciar la implementación, verificar:

- Base técnica de Fase 1 integrada mediante PR #1 en develop (`37f2c70`): TypeScript estricto, estructura y contratos disponibles. Las verificaciones de backend/dispositivo pendientes de Fase 1 no se dan por cerradas aquí.
- Rama de trabajo `feature/mobile-phase-2-ui-ux` creada desde `develop` actualizado.

No duplicar componentes ni lógica de red/almacenamiento ya existentes en `src/services/`.

---

## Fase 2.1: Sistema de diseño y componentes base

- [x] **T2.1.1: Tokens visuales y contraste para exteriores**
  - Definir paleta de alto contraste, tipografía legible y espaciados pensados para uso en calle y exteriores.
  - Mantener nombres de símbolos y estilos en inglés y textos visibles al usuario en español[cite: 1].

- [x] **T2.1.2: Componentes compartidos de interfaz (`src/components/`)**
  - Implementar componente de tarjeta deslizable (*Bottom Sheet*), *badge* de estado y botón de acción con área táctil mínima de `48x48dp`[cite: 1].
  - Evitar lógica de negocio dentro de los componentes visuales[cite: 1].

- [x] **T2.1.3: Matriz de estados de pantalla (`loading`, `empty`, `permission-denied`, `offline`, `error`)**
  - Definir el tipo de estado de vista y los componentes/vistas para carga, vacío, sin permisos, sin conexión y error controlado[cite: 1].
  - Redactar todos los mensajes y acciones de reintento/configuración en español claro[cite: 1].

---

## Fase 2.2: Flujo de interfaz del pasajero

- [x] **T2.2.1: Selector de ruta y vista principal del pasajero**
  - Crear la pantalla y componentes base del flujo de pasajero en `src/features/passenger/`.
  - Permitir seleccionar una ruta, visualizar el área de mapa/unidades y abrir el detalle de unidad o paradero en un máximo de tres toques[cite: 1].

- [x] **T2.2.2: Tarjeta de información de unidad y paradero**
  - Diseñar la tarjeta de detalle con espacios tipados para identificador/código, estado de señal y tiempo estimado de llegada[cite: 1].
  - Representar de forma clara los estados de carga, sin unidades activas (`empty`) y sin conexión (`offline`)[cite: 1].

---

## Fase 2.3: Flujo de interfaz del conductor (Modo Conductor)

- [x] **T2.3.1: Pantalla anti-distracción y controles de recorrido**
  - Crear la vista y componentes del **Modo Conductor** en `src/features/driver/` con bajo ruido visual y botones de área táctil mínima de `48x48dp`[cite: 1].
  - Implementar el interruptor de inicio/fin de recorrido exigiendo confirmación explícita al finalizar un recorrido activo[cite: 1].

- [x] **T2.3.2: Indicadores visuales de GPS, red y recorrido**
  - Incorporar indicadores claros y visibles del estado del GPS (`Activo`, `Buscando señal`, `Desactivado / Sin permiso`), estado de red (`Conectado`, `Reconectando`, `Sin conexión`) y estado/tiempo de recorrido[cite: 1].
  - Verificar que los estados de sin permiso y sin conexión se comuniquen de forma inmediata al conductor[cite: 1].

---

## Fase 2.4: Navegación, pruebas y validación de usabilidad

- [x] **T2.4.1: Navegación centralizada (`src/navigation/`)**
  - Centralizar las rutas/flujos de pasajero y conductor en `src/navigation/` y conectarlos desde `src/app/_layout.tsx`[cite: 1].
  - Mantener los componentes de navegación libres de lógica de negocio[cite: 1].

- [x] **T2.4.2: Pruebas de componentes y chequeo estático**
  - Ejecutar pruebas de componentes sobre los controles principales y estados de pantalla (`loading`, `empty`, `permission-denied`, `offline`, `error`)[cite: 1].
  - Verificar que TypeScript (`tsc`) y el linter finalicen sin errores[cite: 1].

- [ ] **T2.4.3: Validación de usabilidad con usuarios**
  - Realizar pruebas de usabilidad con al menos 3–5 usuarios simulando consulta de pasajero (regla de tres toques) e inicio/fin de recorrido de conductor[cite: 1].
  - Documentar los hallazgos y aplicar los ajustes de interfaz acordados antes de cerrar la fase[cite: 1].

---

## Capacidades expresamente diferidas a fases posteriores

Estas capacidades no tienen tareas de implementación en esta fase y se abordarán en sus `Specs` correspondientes:

- Renderizado de mapa en vivo, polilíneas de ruta, animación de marcadores y cálculo dinámico de ETA (Fase 3)[cite: 1].
- Servicio en segundo plano (*Foreground Service*), muestreo GPS continuo y cola *offline* de telemetría (Fase 4)[cite: 1].
- Autenticación, gestión de roles/planes, favoritos, alertas de proximidad y aforo/incidencias (Fase 5)[cite: 1].
- Pruebas en rutas reales de Tacna, auditoría de batería y empaquetado final de distribución (Fase 6)[cite: 1].

## Regla de ejecución

La implementación deberá respetar `constitution.md`, `spec.md` y `plan.md`[cite: 1]. Si una tarea encuentra una dependencia de contrato o SDK aún no definida para la Fase 3, se aislará mediante interfaces/props sin inventar comportamientos definitivos ni ampliar el alcance unilateralmente.

## Registro de avance — Fase 2 (25/11/2026)

- Rama activa `feature/mobile-phase-2-ui-ux`, creada desde `origin/develop` en
  `37f2c70` tras verificar que contiene `6f43ae3` (Fase 1). Directorio de trabajo
  limpio al iniciar. No se hizo commit, push, merge ni PR durante Fase 2.
- Se actualizaron únicamente los SDD existentes de esta fase en `spec/fase-2/`.
  Se corrigieron sus referencias antiguas a rutas inexistentes `specs/fase_2_ui_ux/`.
  `contexto.md` y los cuatro repositorios hermanos se mantuvieron en solo lectura.
- Diseño: guía T049, T051 y hallazgos T054/T095 consultados. Azul principal, texto
  secundario más oscuro, Inter cargada en ejecución y fuente del sistema si falla.
  Se comprobaron por fórmula combinaciones de contraste de texto ≥4.5:1. Esto no
  certifica accesibilidad ni legibilidad bajo sol sin una prueba real de dispositivo.
- Componentes: botones 56dp y control de recorrido 80dp, mínimo ancho 48dp;
  bottom sheet expandible con gesto y alternativas accesibles; badges con texto y
  símbolo; diálogo de confirmación; contenedor con áreas seguras y desplazamiento.
  `Button` reutiliza `ActionButton`, sin un segundo estilo de botón genérico.
- Pasajero: ruta → micro/punto de espera → «Ver ubicación», probado en tres toques
  desde la pantalla principal. Fichas de ejemplo; ETA no calculado y no mostrado
  para unidad sin señal reciente. Cambiar de ruta limpia la selección anterior.
  La entrada desde bienvenida no se incluye en el conteo, conforme al alcance.
- Conductor: simulación de inicio/fin, contador local y confirmación al finalizar
  o salir. Cancelar conserva el recorrido. Una pérdida de red simulada no lo cierra
  sin confirmación. GPS/red/estado del recorrido están fuera del área desplazable.
  No se solicitan permisos, ni se ejecuta GPS, HTTP, Socket.IO o servicio en segundo plano.
- Matriz: seis estados tipados (`ready`, `loading`, `empty`, `permission-denied`,
  `offline`, `error`) para ambos flujos, verificables en `/ui-preview`. Es una
  galería interna; sus acciones solo cambian estados de demostración.
- Navegación: Expo Router, stack/constantes en `src/navigation/`; adaptadores de
  pantalla en `src/app/`. Se conserva el acceso existente y se añade consulta
  invitada y demostración del conductor, sin implementar autenticación ni roles.
- [x] Prueba de desarrollo con `npx expo start --port 8083`: manifiesto Android
  HTTP 200 y bundle sin carga diferida HTTP 200 (7 372 152 bytes en la primera
  comprobación). Sin APK, Gradle, prebuild ni builds nativos.
- [x] `npm run typecheck`: sin errores; TypeScript estricto y tipos de Jest verificados.
- [x] `npm run lint`: sin errores ni advertencias.
- [x] `npm run test:ui`: 18 pruebas aprobadas (componentes, ambos flujos, matriz,
  contraste, confirmación/cancelación/salida y limpieza del temporizador local).
- [x] `npm run test:smoke`: las 10 pruebas de Fase 1 continúan aprobadas.
- [x] `git diff --check` y formato de los archivos modificados: verificados.
- [ ] T2.4.3: no se realizó una ronda con usuarios de esta implementación. Los
  informes previos del prototipo se usan como referencia y no como participantes
  ni resultados nuevos. No hay métricas inventadas de satisfacción, tiempos o éxito.
- [x] Acceso de lectura a Figma: resuelto mediante la integración, sin ampliar
  permisos del archivo. Se identificaron las ocho páginas y se inspeccionaron
  capturas de mapa (`70:16325`), conductor (`70:16808`) y sin conexión (`73:251`).
  El intento inicial por navegador se mantuvo detenido tras su bloqueo. No se
  editaron diseños, permisos ni componentes del archivo de Figma.
- [ ] Verificación manual en Expo Go: deslizamiento del sheet, retorno Android,
  foco de lector de pantalla, texto ampliado y legibilidad exterior pendientes.

### Ajustes derivados de la revisión

- Se añadieron comentarios JSDoc y explicaciones internas en español a los
  componentes, hooks, pantallas, navegación, tokens y pruebas de Fase 2. Describen
  responsabilidades, props, transiciones, confirmaciones, limpieza de recursos
  y límites de los datos simulados. Por indicación del usuario, la documentación
  del código se mantiene en español y los identificadores en inglés. Esta revisión
  documental no cambia la lógica.
  Verificación posterior: `npm run typecheck` y `npm run lint` aprobados; formato
  de los archivos comentados y `git diff --check` sin errores.
- Tras obtener acceso directo a Figma se aplicó una primera pasada estética en
  la misma rama: `AppHeader` de marca, `AppIcon` decorativo con Lucide existente,
  badges con iconos outline, estados centrados con fondo tintado y CTA destacada,
  tarjeta de unidad/temporizador del conductor y panel de estimación del pasajero.
  Se mantienen los textos en español y las áreas táctiles mínimas. No se añaden
  dependencias, contratos ni funciones operativas.
- Verificación de la pasada: TypeScript y lint sin errores; 18 pruebas UI y las
  10 pruebas de infraestructura aprobadas. Los iconos se importan individualmente
  desde los exports públicos de Lucide para evitar cargar todo el catálogo.
  Expo se reinició en 8083 y sirvió manifiesto y bundle Android HTTP 200
  (7 425 877 bytes); no se generaron builds nativos. Esto no sustituye una captura
  y comparación de la app renderizada en un dispositivo.
- La composición del mapa del pasajero aún es el contenedor ilustrativo de la
  implementación inicial. Su adaptación completa al lienzo principal y tarjetas
  superpuestas de Figma requiere otra revisión visual específica. No se presenta
  esta pasada como una reproducción completa del mockup ni como usabilidad validada.

- Los informes T054/T095 describen transiciones sin conectar en inicio/finalización
  del conductor. Aquí se prueban botones, cancelación y salida con confirmación;
  no se marcan como resueltos los tickets de Figma ni de otros repositorios.
- Se evita mostrar ETA con señal desactualizada y se identifica la simulación para
  no confundirla con información operativa. Los indicadores del conductor no se
  desplazan con el contenido y su estado no depende únicamente del color.
- Se compactaron encabezado y selector del pasajero para reducir desplazamientos
  en pantallas pequeñas; los controles conservan el mínimo táctil y el texto puede
  crecer. No se afirma haber medido sus dimensiones físicas con todos los tamaños.

### Guion pendiente de usabilidad (3–5 participantes)

La revisión del diseño fuente en Figma no sustituye esta prueba de la app.

1. Desde la vista del pasajero, elegir Línea 10, Micro 01 y consultar su ubicación.
2. Consultar el punto de espera y explicar qué significa «estimación de ejemplo».
3. Revisar sin conexión, sin permisos y error; describir qué acción tomaría.
4. Iniciar un recorrido de prueba, intentar finalizarlo, cancelar y confirmar al final.
5. Registrar por participante anónimo: dispositivo/tamaño de texto, toques, éxito
   sin ayuda, fricciones observadas y ajuste propuesto. Estado actual: sin ejecutar.

### Dependencias hacia Fase 3

- Conectar props/hooks a catálogo y telemetría reales; confirmar SDK de mapas y
  proveedor de ETA sin sustituir los datos de ejemplo por contratos inventados.
- Obtener contrato de paraderos/puntos de espera y resolver el destino de tracking
  Core/Node registrado en Fase 1 antes de conectar el flujo conductor.
- Ejecutar validación con participantes y revisión física antes del cierre de Fase 2.
