# Tareas de Implementación — Fase 2: Diseño UI/UX, Flujos de Interacción y Estados de Pantalla

## Estado documental

- **Spec:** `specs/fase_2_ui_ux/spec.md` (autorizado para el alcance implementable).
- **Plan:** `specs/fase_2_ui_ux/plan.md` (autorizado para ejecución progresiva).
- **Fase:** 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla.
- **Rama de implementación prevista:** `feature/mobile-phase-2-ui-ux`, creada desde `develop` actualizado.

Las tareas de este documento cubren el sistema de diseño base, la matriz de estados de pantalla, los flujos de interfaz de Pasajero y Modo Conductor, la navegación centralizada y la validación inicial de usabilidad[cite: 1]. La conexión con telemetría real, cálculo de ETA y servicio GPS en segundo plano corresponden a las Fases 3 y 4 y se mantienen fuera de este documento[cite: 1].

## Dependencias previas

Antes de iniciar la implementación, verificar:

- Fase 1 completada y disponible en la rama base: proyecto React Native + TypeScript estricto, estructura de carpetas y tipos base[cite: 1].
- Rama de trabajo `feature/mobile-phase-2-ui-ux` creada desde `develop` actualizado.

No duplicar componentes ni lógica de red/almacenamiento ya existentes en `src/services/`.

---

## Fase 2.1: Sistema de diseño y componentes base

- [ ] **T2.1.1: Tokens visuales y contraste para exteriores**
  - Definir paleta de alto contraste, tipografía legible y espaciados pensados para uso en calle y exteriores.
  - Mantener nombres de símbolos y estilos en inglés y textos visibles al usuario en español[cite: 1].

- [ ] **T2.1.2: Componentes compartidos de interfaz (`src/components/`)**
  - Implementar componente de tarjeta deslizable (*Bottom Sheet*), *badge* de estado y botón de acción con área táctil mínima de `48x48dp`[cite: 1].
  - Evitar lógica de negocio dentro de los componentes visuales[cite: 1].

- [ ] **T2.1.3: Matriz de estados de pantalla (`loading`, `empty`, `permission-denied`, `offline`, `error`)**
  - Definir el tipo de estado de vista y los componentes/vistas para carga, vacío, sin permisos, sin conexión y error controlado[cite: 1].
  - Redactar todos los mensajes y acciones de reintento/configuración en español claro[cite: 1].

---

## Fase 2.2: Flujo de interfaz del pasajero

- [ ] **T2.2.1: Selector de ruta y vista principal del pasajero**
  - Crear la pantalla y componentes base del flujo de pasajero en `src/features/passenger/`.
  - Permitir seleccionar una ruta, visualizar el área de mapa/unidades y abrir el detalle de unidad o paradero en un máximo de tres toques[cite: 1].

- [ ] **T2.2.2: Tarjeta de información de unidad y paradero**
  - Diseñar la tarjeta de detalle con espacios tipados para identificador/código, estado de señal y tiempo estimado de llegada[cite: 1].
  - Representar de forma clara los estados de carga, sin unidades activas (`empty`) y sin conexión (`offline`)[cite: 1].

---

## Fase 2.3: Flujo de interfaz del conductor (Modo Conductor)

- [ ] **T2.3.1: Pantalla anti-distracción y controles de recorrido**
  - Crear la vista y componentes del **Modo Conductor** en `src/features/driver/` con bajo ruido visual y botones de área táctil mínima de `48x48dp`[cite: 1].
  - Implementar el interruptor de inicio/fin de recorrido exigiendo confirmación explícita al finalizar un recorrido activo[cite: 1].

- [ ] **T2.3.2: Indicadores visuales de GPS, red y recorrido**
  - Incorporar indicadores claros y visibles del estado del GPS (`Activo`, `Buscando señal`, `Desactivado / Sin permiso`), estado de red (`Conectado`, `Reconectando`, `Sin conexión`) y estado/tiempo de recorrido[cite: 1].
  - Verificar que los estados de sin permiso y sin conexión se comuniquen de forma inmediata al conductor[cite: 1].

---

## Fase 2.4: Navegación, pruebas y validación de usabilidad

- [ ] **T2.4.1: Navegación centralizada (`src/navigation/`)**
  - Centralizar las rutas/flujos de pasajero y conductor en `src/navigation/` y conectarlos desde `src/App.tsx`[cite: 1].
  - Mantener los componentes de navegación libres de lógica de negocio[cite: 1].

- [ ] **T2.4.2: Pruebas de componentes y chequeo estático**
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

## Registro de avance — Fase 2 (pendiente de ejecución)

- Estado inicial: documentos `spec.md`, `plan.md` y `task.md` preparados para la Fase 2.
- Pendiente registrar fecha, resultados de pruebas de componentes, hallazgos de usabilidad y ajustes aplicados al ejecutar las tareas.