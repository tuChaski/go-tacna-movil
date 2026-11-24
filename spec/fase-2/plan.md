# Plan de Implementación: Fase 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla

**Repositorio:** `mobile-app`
**Rama:** `feature/mobile-phase-2-ui-ux`
**Fase:** 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla
**Estado:** Autorizado para ejecución progresiva
**Especificación funcional:** `specs/fase_2_ui_ux/spec.md`

## 0. Documentos de referencia y estado previo

Este plan se apoya en las siguientes fuentes de verdad:

| Documento | Uso |
|---|---|
| `specs/constitution.md` | Principios, stack, arquitectura, seguridad, pruebas y convenciones obligatorias[cite: 1]. |
| `specs/fase_1_base/spec.md` y `plan.md` | Base técnica, estructura de carpetas, tipos y clientes centrales de Fase 1[cite: 1]. |
| `specs/fase_2_ui_ux/spec.md` | Alcance, requisitos funcionales y criterios de aceptación de la Fase 2. |

### 0.1. Estado de la Fase 1 y prerrequisitos

Antes de implementar las interfaces de la Fase 2, deben estar disponibles:

- Proyecto React Native + TypeScript estricto inicializado y compilando en Android[cite: 1].
- Estructura de carpetas de `constitution.md` creada (`src/features/{passenger,driver,auth,extras}`, `src/components`, `src/navigation`, `src/types`, etc.)[cite: 1].
- Tipos base de catálogo y telemetría definidos en `src/types/`[cite: 1].

No duplicar utilidades de red o almacenamiento ya definidas en `src/services/`.

## 1. Objetivo

Definir la solución técnica de la **Fase 2** para construir los componentes de interfaz, flujos de navegación, pantallas base de **Pasajero** y **Modo Conductor**, y la matriz de estados de pantalla (`loading`, `empty`, `permission-denied`, `offline`, `error`) sobre la base de la Fase 1[cite: 1].

## 2. Enfoque arquitectónico

Se mantiene la arquitectura modular y separación de responsabilidades de `constitution.md`[cite: 1]:

- **Presentación (`screens/` y `components/`):** renderizado de vistas, controles de interacción y representación de estados; sin lógica de negocio compleja ni llamadas HTTP/WebSocket directas[cite: 1].
- **Aplicación / Hooks (`hooks/`):** gestión de interacción de UI y transiciones de estado locales o de flujo[cite: 1].
- **Dominio y Tipos (`types/` y `features/<domain>/`):** modelos de vista y estados bien tipados[cite: 1].
- **Navegación (`src/navigation/`):** definición centralizada de rutas y transiciones entre flujos[cite: 1].

### 2.1. Tecnologías

| Responsabilidad | Tecnología | Estado |
|---|---|---|
| Interfaz móvil | React Native | Base de Fase 1[cite: 1] |
| Lenguaje | TypeScript (modo estricto) | Base de Fase 1[cite: 1] |
| Navegación | React Navigation (o navegación centralizada definida) | Integración en Fase 2[cite: 1] |
| Estilos y tokens | Sistema de diseño / temas / estilos tipados | Definición en Fase 2 |

No se incorporan dependencias nuevas sin justificación técnica y aprobación conforme a `constitution.md`[cite: 1].

## 3. Alcance funcional de la fase

| ID | Capacidad | Descripción |
|---|---|---|
| F2-C01 | Sistema de diseño y componentes base | Tokens de color/contraste, *Bottom Sheets*, *badges* de estado, botones de alta legibilidad y componentes compartidos[cite: 1]. |
| F2-C02 | Flujo de interfaz del pasajero | Selector de ruta, contenedor de vista principal y tarjeta de unidad/paradero bajo la regla de los tres toques[cite: 1]. |
| F2-C03 | Flujo de interfaz del conductor | Vista anti-distracción con interruptor de recorrido, confirmación de cierre e indicadores de GPS y red[cite: 1]. |
| F2-C04 | Matriz de estados de pantalla | Estados estandarizados de carga, vacío, sin permisos, sin conexión y error en español[cite: 1]. |
| F2-C05 | Validación de usabilidad | Prueba con usuarios simulando flujos de pasajero y conductor y registro de ajustes[cite: 1]. |

### 3.1. Fuera de alcance

- Telemetría real por WebSocket o animación de unidades en mapa (Fase 3)[cite: 1].
- Servicio GPS en segundo plano o cola *offline* de coordenadas (Fase 4)[cite: 1].
- Funciones complementarias de favoritos, alertas de proximidad o aforo/incidencias (Fase 5)[cite: 1].
- Pruebas en rutas físicas de Tacna o empaquetado final (Fase 6)[cite: 1].

## 4. Diseño de la solución

### 4.1. Sistema de diseño (*design tokens* y componentes compartidos)

En `src/components/` (y configuración visual correspondiente en `src/config/` o `src/theme/`):

- **Tokens visuales:** paleta de alto contraste pensada para lectura en exteriores con luz solar, escalas tipográficas legibles, espaciados y radios consistentes.
- **Componentes base:**
  - `ScreenStateView` (o componentes especializados de carga, vacío, sin permisos, sin conexión y error) con mensajes en español y acción de reintento/configuración cuando aplique.
  - `BottomSheetCard`: contenedor deslizable para mostrar información contextual sin ocultar todo el mapa.
  - `StatusBadge`: indicador visual de estado (`En ruta`, `Detenido`, `Sin señal`, `Conectado`, `Reconectando`, `Sin red`).
  - `ActionButton`: botón con área táctil mínima de `48x48dp` y estados visualmente diferenciados (`normal`, `disabled`, `loading`, `danger`).

### 4.2. Flujo de interfaz del pasajero (`src/features/passenger/`)

- **Flujo de 3 toques:**
  1. Seleccionar una ruta desde un selector accesible y visible.
  2. Seleccionar una unidad activa o paradero en el área de visualización/mapa.
  3. Inspeccionar la tarjeta de detalle con identificador de unidad, estado/frescura y estimación de llegada.
- **Estados cubiertos:** lista o selector de rutas cargando, ruta sin unidades activas (`empty`), ubicación del usuario sin permiso (`permission-denied`) y pérdida de conexión (`offline`).

### 4.3. Flujo de interfaz del conductor (`src/features/driver/`)

- **Diseño anti-distracción:**
  - Jerarquía simple, alto contraste y textos breves en español.
  - Botones de gran tamaño (`>= 48x48dp`) para evitar errores de pulsación.
  - Interruptor principal de recorrido (**Iniciar recorrido / Finalizar recorrido**) con modal o diálogo de confirmación al detener un recorrido activo.
- **Indicadores permanentes:**
  - Estado del GPS (`Activo`, `Buscando señal`, `Desactivado / Sin permiso`).
  - Estado de red (`Conectado`, `Reconectando`, `Sin conexión`).
  - Estado/tiempo de recorrido en curso.

### 4.4. Matriz de estados de pantalla

Todas las vistas principales deben modelar explícitamente un estado de vista tipado (por ejemplo, `ScreenStatus = 'loading' | 'ready' | 'empty' | 'permission_denied' | 'offline' | 'error'`) para evitar renders inconsistentes o pantallas vacías sin explicación.

## 5. Estructura del proyecto

```text
mobile-app/
├── src/
│   ├── features/
│   │   ├── passenger/
│   │   │   ├── components/
│   │   │   │   ├── RouteSelector.tsx
│   │   │   │   └── UnitInfoSheet.tsx
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   │   └── PassengerHomeScreen.tsx
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── index.ts
│   │   └── driver/
│   │       ├── components/
│   │       │   ├── TripToggleButton.tsx
│   │       │   └── TelemetryStatusBar.tsx
│   │       ├── hooks/
│   │       ├── screens/
│   │       │   └── DriverConsoleScreen.tsx
│   │       ├── services/
│   │       ├── store/
│   │       └── index.ts
│   ├── components/
│   │   ├── BottomSheetCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ActionButton.tsx
│   │   └── ScreenStateView.tsx
│   └── navigation/
│       └── AppNavigator.tsx
```

Notas:

- Los nombres de archivos y componentes pueden ajustarse en detalle según la convención de la Fase 1 siempre que respeten la separación por dominio y responsabilidad[cite: 1].
- Los componentes visuales no realizan llamadas HTTP ni manejan sockets directamente.

## 6. Contratos y datos de prueba en interfaz

En la Fase 2 se utilizan datos de ejemplo o estados simulados exclusivamente en el ámbito de presentación/prototipado de interfaz para validar flujos y estados visuales; no se deben tratar datos simulados como datos reales del sistema ni dejar lógica *mock* acoplada dentro de los componentes finales.

## 7. Rutas y navegación

`src/navigation/` centraliza la navegación entre los flujos definidos en esta fase y expone transiciones claras entre las vistas de pasajero, conductor y estados de soporte.

## 8. Alcance de conectividad

La Fase 2 no requiere conectividad continua a un servidor en vivo para operar sus vistas y estados, pero sí debe representar visualmente los estados `offline`, `error` y reconexión de forma clara y coherente[cite: 1].

## 9. Seguridad y accesibilidad visual

- No se exponen datos sensibles en mensajes de error o estados de pantalla[cite: 1].
- Se respetan áreas táctiles amplias (`>= 48x48dp`), buen contraste y mensajes claros en español[cite: 1].

## 10. Estrategia de pruebas y validación de usabilidad

| Tipo | Alcance en Fase 2 |
|---|---|
| Chequeo estático | Compilación TypeScript (`tsc --noEmit` / `tsc -b`) y linter (`ESLint`). |
| Pruebas de componentes | Renderizado de componentes compartidos, tarjetas, controles de conductor y estados (`loading`, `empty`, `permission-denied`, `offline`, `error`). |
| Pruebas de usabilidad | Sesión de prueba con 3–5 usuarios simulando consulta de pasajero e inicio/fin de recorrido de conductor, registrando fricciones y mejoras. |

## 11. Secuencia de implementación

### Etapa 1 — Sistema de diseño y componentes base

- Definir tokens de contraste, tipografía y espaciado.
- Implementar componentes compartidos en `src/components/` y estado tipado de pantalla.

### Etapa 2 — Flujo de interfaz del pasajero

- Implementar selector de ruta, contenedor de vista principal y tarjeta de unidad/paradero cumpliendo la regla de los tres toques[cite: 1].
- Integrar estados de carga, vacío, sin permisos y sin conexión en el flujo del pasajero[cite: 1].

### Etapa 3 — Flujo de interfaz del conductor

- Implementar pantalla anti-distracción del conductor con botones de área táctil amplia (`>= 48x48dp`).
- Implementar interruptor de inicio/fin de recorrido con confirmación e indicadores visibles de GPS y red[cite: 1].

### Etapa 4 — Navegación, pruebas y validación de usabilidad

- Centralizar rutas/flujos en `src/navigation/`.
- Ejecutar pruebas de componentes, chequeo de tipos/linter y prueba de usabilidad con usuarios.
- Registrar resultados en `task.md`.

## 12. Riesgos, bloqueos y decisiones pendientes

### 12.1. Bloqueos

| ID | Bloqueo | Impacto | Mitigación |
|---|---|---|---|
| B1 | Detalles de SDK de mapas o formato de datos de ETA aún no cerrados para Fase 3. | Riesgo de acoplar la UI a un proveedor específico antes de tiempo. | Mantener un contenedor de mapa/tarjeta desacoplado mediante *props* e interfaces claras. |
| B2 | Disponibilidad de participantes para prueba de usabilidad. | Puede retrasar el cierre de F2-C05. | Coordinar pruebas breves con compañeros/usuarios representativos durante la etapa de validación. |

### 12.2. Decisiones pendientes

| ID | Decisión | Impacto |
|---|---|---|
| DP-01 | Elección definitiva del SDK de mapas (`react-native-maps`, Mapbox o Google Maps SDK) para la Fase 3. | Contenedor del mapa en `PassengerHomeScreen`[cite: 1]. |
| DP-02 | Nivel de detalle visible en la tarjeta de unidad antes de calcular el ETA en Fase 3. | Campos mostrados en `UnitInfoSheet`[cite: 1]. |

Ninguna de estas decisiones se resolverá por suposición dentro de la implementación.

## 13. Criterios de finalización

La Fase 2 se considerará completada cuando:

1. La Spec y el Plan estén autorizados y registrados en la rama `feature/mobile-phase-2-ui-ux`.
2. Los componentes base y la matriz de estados de pantalla estén implementados en español para el usuario.
3. El flujo del pasajero cumpla la regla de los tres toques y el flujo del conductor cumpla los criterios anti-distracción (`>= 48x48dp`, confirmación de cierre e indicadores de GPS y red)[cite: 1].
4. La navegación esté centralizada en `src/navigation/`.
5. Se haya realizado la validación de usabilidad y documentado sus hallazgos.
6. TypeScript, linter y pruebas de componentes finalicen sin errores.

---

**Fin del plan de implementación de la Fase 2.**