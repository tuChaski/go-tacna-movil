# Plan de Implementación: Fase 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla

**Repositorio:** `mobile-app`
**Rama:** `feature/mobile-phase-2-ui-ux`
**Fase:** 2 — Diseño UI/UX, Flujos de Interacción y Estados de Pantalla
**Estado:** Autorizado para ejecución progresiva
**Especificación funcional:** `spec/fase-2/spec.md`

## 0. Documentos de referencia y estado previo

Este plan se apoya en las siguientes fuentes de verdad:

| Documento | Uso |
|---|---|
| `spec/contitution.md` | Principios, stack, arquitectura, seguridad, pruebas y convenciones obligatorias[cite: 1]. |
| `spec/fase-1/spec.md` y `plan.md` | Base técnica, estructura de carpetas, tipos y clientes centrales de Fase 1[cite: 1]. |
| `spec/fase-2/spec.md` | Alcance, requisitos funcionales y criterios de aceptación de la Fase 2. |

### 0.1. Estado de la Fase 1 y prerrequisitos

Antes de implementar las interfaces de la Fase 2, deben estar disponibles:

- Base React Native + TypeScript estricto de Fase 1 integrada en `origin/develop` (`37f2c70`, PR #1). Se valida mediante Expo/OTA, sin APK ni builds nativos.
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
| Navegación | Expo Router, según AGENTS.md | Rutas y stack declarados en `src/navigation/` |
| Estilos y tokens | Sistema de diseño / temas / estilos tipados | Definición en Fase 2 |

No se incorporan dependencias nuevas sin justificación técnica y aprobación conforme a `constitution.md`[cite: 1].

Para el alcance autorizado se añade `@expo-google-fonts/inter` (tipografía de la
guía T049, carga en ejecución compatible con Expo Go) y herramientas de prueba:
Jest, jest-expo y React Native Testing Library. No se añaden módulos nativos de
mapas, geolocalización ni bottom sheet. `Modal` y `PanResponder` resuelven las
interacciones base. Se conserva el cliente HTTP/Socket.IO/storage de Fase 1 sin cambios.

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

La implementación usa `permission-denied` (con guion), coherente con la Spec.
`src/types/ui.ts` concentra estados y textos; `src/dev/PreviewScreen.tsx` permite
revisar ambos flujos con los seis estados desde `/ui-preview`, sin poner controles
de diagnóstico dentro de la consola del conductor. La entrada se muestra en desarrollo.

| Estado | Pasajero | Conductor |
|---|---|---|
| ready | Selector, mapa ilustrativo y ficha | Interruptor habilitado y temporizador local |
| loading | Indicador y mensaje de carga | GPS buscando / red reconectando; inicio bloqueado |
| empty | Ruta sin micros | Sin unidad asignada en el escenario; inicio bloqueado |
| permission-denied | Explicación y continuar sin ubicación en la demo | Indicador sin permiso; inicio bloqueado |
| offline | Sin ubicaciones/llegadas en vivo, reintento | Aviso y red sin conexión; un recorrido activo puede finalizar con confirmación |
| error | Mensaje controlado y reintento | Red no disponible e inicio bloqueado |

Las acciones de recuperación de la galería cambian solo el escenario de UI. No
solicitan permisos nativos ni hacen peticiones de red. GPS/red/recorrido permanecen
fuera del ScrollView del conductor. Cancelar el diálogo o el retorno de Android
con el diálogo abierto conserva el recorrido; volver desde un recorrido activo
también pide confirmación.

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

Los fixtures están separados en `passenger/data/passengerPreview.ts` y reutilizan
`Route`/`MicroPosition`. Los componentes reciben datos/acciones por props y los hooks
mantienen exclusivamente estado de interacción. No hay ETA calculado: los rótulos
se identifican como ejemplos y se ocultan para la unidad desactualizada. El punto
de espera es un modelo local de presentación, sin inventar un contrato de paraderos.

## 7. Rutas y navegación

`src/navigation/` centraliza la navegación entre los flujos definidos en esta fase y expone transiciones claras entre las vistas de pasajero, conductor y estados de soporte.

`AppNavigator.tsx` declara el Stack de Expo Router y `routes.ts` concentra las rutas.
`src/app/{passenger,driver,ui-preview}.tsx` adapta las pantallas de dominio. El acceso
como invitado y la demostración del conductor se abren desde la bienvenida existente;
esto no habilita transmisión ni sustituye autorización de roles de fases posteriores.

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

Se comprueban contraste ≥4.5:1 en combinaciones de texto normal, controles de 48dp,
matriz en ambos flujos, tres toques, punto de espera, señal antigua sin ETA, cambio
de ruta, inicio/finalización/cancelación/salida y limpieza del intervalo local.
RNTL 14 usa render/eventos asíncronos; se prueba con su API instalada. Los mocks
nativos de jest-expo no equivalen a evaluación visual, lector de pantalla o usuarios.

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

Registro 25/11/2026 actualizado: el acceso por navegador fue bloqueado inicialmente;
la integración de Figma permite ahora lectura directa. Se identificaron sus ocho
páginas y se inspeccionaron capturas del mapa, inicio de conductor y estado sin
conexión. No se editó Figma. Se mantienen la guía T049 y documentación T051 como
referencia. Se leyeron hallazgos T054/T095: las transiciones de inicio
y finalización del conductor y el ocultamiento de ETA antiguo tienen pruebas en el
móvil; esas comprobaciones no cierran los tickets del prototipo ni una nueva ronda
de usabilidad. Falta ejecutar esta última con participantes y revisión física.

Primera pasada estética: `AppHeader` y `AppIcon` compartidos, iconos Lucide ya
instalados, badges sin símbolos de texto improvisados, panel de estados centrado,
tarjeta de unidad del conductor y mayor énfasis en la estimación del pasajero. Los
iconos son decorativos para accesibilidad; las etiquetas, estados y acciones
siguen siendo texto. No se agregan dependencias. Jest usa el build CommonJS oficial
de Lucide para verificar los componentes reales, sin simular su renderizado. El mapa de demostración conserva
su composición actual; reorganizarlo como el lienzo principal de Figma requiere
una revisión visual propia, sin integrar todavía mapas o telemetría de Fase 3.

Se consultaron en solo lectura las ramas remotas de los cinco repositorios. Móvil:
`develop` con PR #1 integrado; docs: ramas T049/T050/T051/T092/T093/T095 y main;
backend: develop, T035/T036 y pruebas T071; frontend: develop y ramas T049/T055/T056/T059;
infraestructura: develop/main. La presencia de una rama no demuestra integración ni
aprobación. No se cambian sus checkouts, archivos o ramas.

Las dependencias reales de API, contrato de paraderos y discrepancia de tracking de
Fase 1 quedan para su integración en Fases 3–4; no bloquean este prototipo. No se
revalida ni levanta la pila de backend/BD para esta fase de interfaz.

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
