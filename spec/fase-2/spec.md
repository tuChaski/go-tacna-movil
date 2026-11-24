# Spec: Fase 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla

**Rama prevista:** `feature/mobile-phase-2-ui-ux`
**Repositorio:** `mobile-app`
**Fase:** 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla
**Estado:** Autorizado para el alcance implementable
**Plan técnico:** `specs/fase_2_ui_ux/plan.md`

---

## 1. Propósito

Definir el alcance funcional y de experiencia de usuario para la **Fase 2** de la aplicación móvil (**Android** como plataforma inicial, con proyección a iOS y Web) del sistema de monitoreo de transporte público en tiempo real en Tacna[cite: 1]. Esta fase traduce los flujos de consulta del **pasajero** y de operación del **conductor** en componentes de interfaz, jerarquía visual, navegación base y matriz de estados de pantalla antes de conectar la telemetría y el GPS en vivo[cite: 1].

La aplicación consumirá los datos y eventos del backend como fuente de verdad[cite: 1]. Los estados visuales, flujos de interacción y textos mostrados al usuario deberán respetar `constitution.md` y no asumir comportamientos no confirmados del backend[cite: 1].

### 1.1. Objetivos

- Establecer el sistema de diseño móvil (*design tokens*, tipografía, contraste para exteriores y componentes reutilizables)[cite: 1].
- Definir y estructurar el flujo de consulta del **pasajero** bajo la regla de acceso rápido (máximo tres toques: ruta → unidad/paradero → ubicación y tiempo estimado de llegada)[cite: 1].
- Definir y estructurar el flujo del **Modo Conductor** con criterios anti-distracción, áreas táctiles amplias y controles claros de inicio y fin de recorrido[cite: 1].
- Estandarizar la matriz de estados obligatorios por pantalla (`loading`, `empty`, `permission-denied`, `offline` y error controlado) con textos en español[cite: 1].
- Validar la claridad y navegación de los flujos mediante pruebas de usabilidad iniciales[cite: 1].

### 1.2. Fuera de alcance

Esta fase no incluye:

- Renderizado definitivo de mapas en vivo, animaciones de unidades en movimiento o cálculo dinámico de ETA en calle (Fase 3)[cite: 1].
- Servicio en segundo plano (*Foreground Service*), lectura real de GPS continuo o cola *offline* de coordenadas (Fase 4)[cite: 1].
- Gestión completa de cuentas, planes/límites de suscripción ni funciones complementarias como favoritos, alertas de proximidad o reporte de aforo/incidencias (Fase 5)[cite: 1].
- Pruebas en rutas físicas de Tacna, medición de batería en turno o empaquetado final de distribución (Fase 6)[cite: 1].

---

## 2. Alcance funcional

| ID | Componente | Descripción |
|---|---|---|
| F2-C01 | Sistema de diseño y componentes base | Tokens de color/contraste, tipografía, *Bottom Sheets*, *badges* de estado, pines/tarjetas y botones de alta legibilidad[cite: 1]. |
| F2-C02 | Flujo de interfaz del pasajero | Estructura de navegación y pantallas/componentes para selección de ruta, visualización de unidad/paradero y ficha de llegada[cite: 1]. |
| F2-C03 | Flujo de interfaz del conductor | Vista anti-distracción con interruptor de recorrido (`ON/OFF`), confirmación de cierre e indicadores de estado de GPS y red[cite: 1]. |
| F2-C04 | Matriz de estados de pantalla | Estados visuales estandarizados de carga, vacío, sin permisos, sin conexión y error recuperable en español[cite: 1]. |
| F2-C05 | Validación de usabilidad | Prueba de recorrido guiado/no asistido con usuarios simulando consulta de pasajero e inicio/fin de turno de conductor[cite: 1]. |

### 2.1. Roles y perfiles contemplados en el diseño de interfaz

- **Pasajero:** Requiere consulta rápida, directa y de baja fricción para ubicar unidades y estimar su llegada[cite: 1].
- **Conductor:** Requiere una interfaz de alto contraste, baja densidad de información, botones amplios (mínimo `48x48dp`) y prevención de toques accidentales durante la jornada[cite: 1].

---

## 3. Historias de usuario

### US-001 — Consultar ruta y llegada en pocos pasos (Pasajero)

Como pasajero, quiero navegar de forma clara e inmediata desde la selección de una ruta hasta ver la información de la unidad o paradero, para saber dónde viene el micro sin perderme en menús complejos[cite: 1].

### US-002 — Operar el inicio y fin de recorrido sin distracciones (Conductor)

Como conductor, quiero contar con una pantalla clara, botones amplios e indicadores visibles del estado de GPS y red, para iniciar o finalizar el reporte de mi recorrido con seguridad y sin toques accidentales[cite: 1].

### US-003 — Entender qué ocurre cuando falta señal, permiso o unidades

Como usuario de la aplicación, quiero ver mensajes claros en español cuando no hay micros activos, falta permiso de ubicación o se pierde la conexión, para saber qué acción corresponde tomar[cite: 1].

---

## 4. Requisitos funcionales

### 4.1. Sistema de diseño y componentes — F2-C01

**FR-001 — Legibilidad y contraste en exteriores**
Los componentes visuales deberán contemplar contraste adecuado y tamaños legibles para uso en calle y exteriores en Tacna, evitando elementos diminutos o saturación visual.

**FR-002 — Reutilización de componentes base**
Los controles compartidos (tarjetas deslizables/*Bottom Sheets*, indicadores de estado/*badges*, banners de aviso, botones y modales) deberán diseñarse e implementarse como componentes reutilizables en `src/components/` o en los módulos correspondientes sin duplicar estilos ni lógica[cite: 1].

### 4.2. Flujo de interfaz del pasajero — F2-C02

**FR-003 — Acceso rápido (regla de tres toques)**
El flujo de interfaz del pasajero deberá permitir llegar desde la vista principal hasta la información de ubicación y estimación de llegada de una unidad o paradero en un máximo de tres interacciones principales (selección de ruta → selección de micro o paradero → consulta de estado y tiempo estimado)[cite: 1].

**FR-004 — Estructura de tarjeta de unidad / paradero**
El diseño de la tarjeta de detalle deberá reservar espacios claros para el identificador/código de la unidad, estado de frescura de señal, ubicación/referencia y tiempo estimado de llegada, sin hardcodear datos reales como si fueran definitivos[cite: 1].

### 4.3. Flujo de interfaz del conductor — F2-C03

**FR-005 — Diseño anti-distracción y área táctil**
La pantalla del **Modo Conductor** deberá priorizar simplicidad visual, bajo texto innecesario y controles con área táctil mínima de `48x48dp` para facilitar su uso[cite: 1].

**FR-006 — Control de inicio y fin de recorrido con confirmación**
El interruptor principal de transmisión deberá distinguir claramente los estados activo e inactivo y exigir confirmación explícita al finalizar un recorrido para evitar cortes accidentales[cite: 1].

**FR-007 — Indicadores de estado operativos**
La vista del conductor deberá mostrar indicadores visuales distinguibles para el estado de geolocalización (activo, buscando señal, inactivo/sin permiso), estado de conectividad (conectado, reconectando, sin red) y estado/tiempo del recorrido[cite: 1].

### 4.4. Matriz de estados de pantalla — F2-C04

**FR-008 — Estados obligatorios por flujo**
Cada pantalla o flujo principal deberá contemplar explícitamente sus estados visuales:
- **Cargando:** indicadores o *skeletons* no bloqueantes cuando sea posible.
- **Vacío:** mensaje claro cuando no existan unidades activas o elementos disponibles en el contexto consultado[cite: 1].
- **Sin permisos:** explicación clara del motivo por el que se solicita ubicación y guía/acción para habilitarlo[cite: 1].
- **Sin conexión:** aviso visible e informativo ante pérdida de red o reconexión[cite: 1].
- **Error controlado:** mensaje en español sin detalles técnicos internos sensibles y con opción de reintento cuando aplique[cite: 1].

**FR-009 — Idioma de interfaz**
Todos los textos, etiquetas, estados, confirmaciones y mensajes visibles al usuario en la interfaz deberán redactarse en **español** claro y natural, manteniendo código, archivos, componentes y props en **inglés**[cite: 1].

### 4.5. Validación de usabilidad — F2-C05

**FR-010 — Prueba de recorrido con usuarios**
Antes de cerrar la fase, los flujos diseñados deberán probarse con un grupo reducido de usuarios simulando al menos un recorrido de consulta de pasajero y un recorrido de inicio/fin de turno de conductor, registrando observaciones y ajustes necesarios[cite: 1].

---

## 5. Rutas y navegación de interfaz

En esta fase se organiza la navegación base en `src/navigation/` para conectar las vistas/pantallas en desarrollo[cite: 1]:

| Contexto / flujo | Propósito en Fase 2 | Acceso / relación con roles |
|---|---|---|
| Flujo Pasajero | Vista principal de consulta, selector de ruta y tarjeta de detalle de unidad/paradero[cite: 1]. | Enfocado en consulta rápida del pasajero[cite: 1]. |
| Flujo Modo Conductor | Vista operativa de inicio/fin de recorrido e indicadores de GPS y red[cite: 1]. | Enfocado en operación del conductor[cite: 1]. |
| Estados transversales | Pantallas o modales/banners de permisos, red, vacío o error[cite: 1]. | Compartidos entre flujos según contexto[cite: 1]. |

---

## 6. Integración y contratos

### 6.1. Relación con contratos de Fase 1 y módulos de Fases 3–4

La Fase 2 consume los tipos y estructuras base definidos en `src/types/` durante la Fase 1 y prepara la interfaz para recibir datos reales en las Fases 3 y 4 sin acoplar la UI a respuestas simuladas permanentes.

### 6.2. Dependencias y límites de esta fase

- No se exige conexión en vivo a datos de producción o telemetría real para validar el diseño y los estados de interfaz.
- Cualquier cambio en los campos visibles de unidad o recorrido que dependa de contratos del backend debe alinearse con la documentación contractual vigente[cite: 1].

---

## 7. Requisitos no funcionales

**NFR-001 — Arquitectura modular:** Los componentes y pantallas específicos de pasajero y conductor deben residir en sus respectivos directorios dentro de `src/features/`[cite: 1].

**NFR-002 — Reutilización:** Los componentes genéricos de interfaz y estados deben ubicarse en `src/components/` para evitar duplicación[cite: 1].

**NFR-003 — Baja fricción y claridad:** Los flujos deben evitar pasos innecesarios o modales excesivos que entorpezcan el uso rápido en movilidad.

**NFR-004 — Convenciones de `constitution.md`:** Respeto estricto al idioma del código en inglés, textos de UI en español, tipado estricto en TypeScript y flujo GitFlow (`feature/*` → Pull Request)[cite: 1].

---

## 8. Criterios de aceptación

1. Existen componentes UI base reutilizables y tipados en TypeScript (incluyendo *Bottom Sheet*, *badges* de estado, controles de acción y estados de carga/vacío/sin permisos/sin conexión/error)[cite: 1].
2. El flujo del pasajero contempla la navegación desde selección de ruta hasta tarjeta de unidad/paradero en un máximo de tres toques principales[cite: 1].
3. La pantalla del **Modo Conductor** presenta diseño anti-distracción, botones de área táctil amplia (`>= 48x48dp`), confirmación al finalizar recorrido e indicadores visibles de GPS y red[cite: 1].
4. Todas las pantallas contemplan los estados de carga, vacío, sin permisos, sin conexión y error con mensajes visibles en español[cite: 1].
5. La navegación centralizada en `src/navigation/` conecta los flujos sin lógica de negocio pesada dentro de los componentes visuales[cite: 1].
6. Se ha ejecutado al menos una ronda de validación de usabilidad con usuarios (3–5 participantes como referencia) y se han documentado los hallazgos o ajustes aplicados[cite: 1].
7. El chequeo de tipos de TypeScript y el linter pasan sin errores en la rama `feature/mobile-phase-2-ui-ux`[cite: 1].

---

## 9. Trazabilidad con el plan

| Requisitos de esta Spec | Referencia en `plan.md` |
|---|---|
| FR-001–FR-002 | F2-C01, secciones 2, 4.1, 5 y 11 (Etapa 1). |
| FR-003–FR-004 | F2-C02, secciones 4.2, 7 y 11 (Etapa 2). |
| FR-005–FR-007 | F2-C03, secciones 4.3, 7 y 11 (Etapa 3). |
| FR-008–FR-010 | F2-C04/F2-C05, secciones 4.4, 8, 10 y 11 (Etapa 4). |

---

## 10. Pendientes de definición antes de avanzar a Fase 3

1. Confirmar qué SDK de mapas y librería de marcadores/polilíneas se utilizará en la integración real de la Fase 3 para acoplar los contenedores de mapa creados en Fase 2.
2. Verificar los campos finales de la tarjeta de unidad y del cálculo de tiempo estimado de llegada (ETA) con los contratos de la Fase 3.
3. Incorporar los ajustes derivados de las pruebas de usabilidad de la Fase 2 antes de iniciar la implementación en vivo de la Fase 3.

---

**Fin de la especificación de la Fase 2.**