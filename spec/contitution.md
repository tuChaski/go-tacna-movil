# CONSTITUCIÓN TÉCNICA — APLICACIÓN MÓVIL TRANSPORTE PÚBLICO (TACNA)

## 1. Propósito

Este documento establece los principios arquitectónicos, tecnologías oficiales, estándares, restricciones y reglas de gobernanza que gobiernan exclusivamente el desarrollo de la aplicación móvil (**Android** como plataforma inicial, con proyección a iOS y Web).

Su finalidad es garantizar una aplicación móvil modular, mantenible, fluida en mapas, eficiente en batería y datos móviles, y resiliente frente a variaciones de conectividad durante la operación urbana.

Esta Constitución es de cumplimiento obligatorio para todo el equipo que participe en el desarrollo móvil.

No sustituye las especificaciones funcionales (`Specs`), los contratos de integración (`API_CONTRACTS.md` / eventos WebSocket), los registros de decisiones arquitectónicas (`ADR`) ni la documentación de gestión y cronograma.

---

## 2. Stack tecnológico oficial

La aplicación móvil utilizará las siguientes tecnologías:

| Tecnología | Responsabilidad |
|---|---|
| React Native | Construcción de la aplicación móvil multiplataforma (objetivo inicial: Android) |
| TypeScript | Tipado estático y lenguaje principal de desarrollo |
| React Navigation | Navegación y enrutamiento entre pantallas y flujos |
| Zustand (o store definido en ADR) | Gestión del estado global de la aplicación |
| Axios (o cliente HTTP oficial) | Comunicación REST con el backend |
| Socket.IO Client / WebSockets | Telemetría y sincronización en tiempo real |
| SDK de Mapas (React Native Maps / Mapbox / Google Maps) | Renderizado de mapas, rutas (`Polyline`), paraderos y unidades en movimiento |
| MMKV / AsyncStorage | Persistencia local rápida y caché de catálogo/preferencias |

### 2.1. APIs y capacidades nativas del dispositivo

Se utilizarán las siguientes capacidades del sistema operativo móvil:

- Geolocalización en primer y segundo plano (`ACCESS_FINE_LOCATION` / `ACCESS_BACKGROUND_LOCATION`).
- Servicio en primer plano (*Foreground Service*) con notificación persistente para transmisión continua del conductor.
- Notificaciones locales y/o push (alertas de proximidad o estado).
- Almacenamiento seguro del dispositivo (`EncryptedSharedPreferences` / `Keychain`) para credenciales o tokens.
- Detección del estado de red y disponibilidad de GPS.

La incorporación de nuevas dependencias debe estar técnicamente justificada y no debe duplicar funcionalidades existentes sin una razón documentada y aprobada.

> **Nota de alcance (MVP):** el núcleo del MVP prioriza la consulta en tiempo real para pasajeros y la emisión GPS estable para conductores. Las funciones complementarias o de planes ampliados se incorporan de forma escalonada mediante `Specs` y `ADR` aprobados sin bloquear el flujo esencial gratuito.

---

## 3. Principios arquitectónicos

### 3.1. Arquitectura modular

La aplicación móvil debe organizarse por dominios funcionales independientes.

Cada módulo debe mantener sus propias responsabilidades, componentes, hooks, servicios, estado y lógica específica.

La comunicación entre módulos debe realizarse mediante interfaces y contratos explícitos.

### 3.2. Separación de responsabilidades

El código debe mantener una separación clara entre:

- **Presentación:** pantallas, componentes visuales, controles de mapa y retroalimentación de interfaz.
- **Aplicación:** coordinación de casos de uso, control de turnos/recorridos, cálculo de ETA y orquestación de eventos.
- **Dominio:** reglas y modelos propios de la movilidad urbana en el cliente (estados de unidad, filtros de ruta, reglas de muestreo).
- **Infraestructura:** clientes HTTP y WebSocket, proveedor de geolocalización, almacenamiento local y servicios del sistema operativo.

Los componentes visuales no deben contener lógica de negocio compleja ni realizar directamente operaciones de red o acceso directo a APIs nativas sin pasar por hooks o servicios correspondientes.

### 3.3. Bajo acoplamiento

Los módulos no deben depender directamente de la implementación interna de otros módulos.

Se deben evitar dependencias circulares y duplicación de lógica geoespacial o de red.

### 3.4. Reutilización

Los componentes, hooks y utilidades compartidos deben ubicarse en directorios comunes cuando realmente sean reutilizables entre pantallas o dominios.

No se deben crear abstracciones prematuras ni componentes genéricos que dificulten la lectura o el mantenimiento.

### 3.5. Fuente de verdad

El backend y los servicios geoespaciales centrales son la fuente de verdad del estado del sistema.

La aplicación móvil puede mantener caché local y colas temporales para mejorar la fluidez, reducir el consumo de datos y tolerar microcortes de red, pero debe respetar las reglas de sincronización, frescura de datos y validación establecidas.

---

## 4. Organización de dominios funcionales

La aplicación móvil se organiza en los siguientes dominios:

| Identificador | Dominio |
|---|---|
| M1 | Pasajero y Mapa en Tiempo Real (rutas, paraderos, unidades activas, ETA) |
| M2 | Modo Conductor y Telemetría GPS (inicio/fin de recorrido, emisión en segundo plano, resiliencia) |
| M3 | Autenticación, Perfiles y Permisos (acceso invitado/usuario/conductor, sesión y límites por rol/plan) |
| M4 | Favoritos, Alertas y Funciones Complementarias (rutas/paraderos frecuentes, proximidad, aforo/incidencias) |

Cada dominio debe implementarse dentro de su propio directorio en `src/features/`.

Reglas obligatorias:

- Cada dominio mantiene sus pantallas, componentes, hooks y servicios específicos.
- Los módulos no deben modificar directamente el estado interno de otros módulos.
- Las funcionalidades compartidas deben exponerse mediante interfaces o servicios reutilizables.
- Las dependencias entre módulos deben ser explícitas y unidireccionales cuando sea posible.
- No se permiten dependencias circulares.
- El comportamiento detallado y criterios de aceptación de cada dominio se definen en las `Specs` correspondientes.

Esta sección establece únicamente la organización arquitectónica, no el detalle funcional de cada módulo.

---

## 5. Estructura del proyecto

La organización inicial del proyecto móvil será la siguiente:

```text
mobile-app/
├── android/
├── ios/
├── src/
│   ├── features/
│   │   ├── passenger/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── index.ts
│   │   ├── driver/
│   │   ├── auth/
│   │   └── extras/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   │   ├── api/
│   │   ├── websocket/
│   │   ├── location/
│   │   └── storage/
│   ├── store/
│   ├── navigation/
│   ├── config/
│   ├── utils/
│   ├── types/
│   └── App.tsx
├── .env.example
├── tsconfig.json
└── package.json
```

Esta estructura es una referencia arquitectónica obligatoria en cuanto a la separación de responsabilidades. Los subdirectorios internos de cada módulo pueden ampliarse según sus necesidades sin romper los límites establecidos.

### 5.1. Organización de servicios de red y tiempo real

Se establecen las siguientes reglas:

- Los servicios HTTP específicos de cada dominio viven en `src/features/<modulo>/services/`.
- El cliente HTTP centralizado y su configuración común viven en `src/services/api/`.
- La gestión centralizada de conexiones y suscripciones WebSocket vive en `src/services/websocket/`.
- Los componentes visuales no deben realizar peticiones HTTP ni gestionar sockets directamente.

No se deben duplicar clientes HTTP ni instancias de sockets dispersas en distintos componentes.

### 5.2. Organización de hooks y geolocalización

Los hooks transversales y reutilizables deben ubicarse en `src/hooks/`.

Los hooks específicos de un dominio deben permanecer dentro de su módulo en `src/features/<modulo>/hooks/`.

La integración con la geolocalización y el servicio en segundo plano debe separarse entre:

- `src/services/location/`: lógica de captura GPS, filtros de distancia/tiempo, cola temporal (*buffer*) y control del servicio nativo.
- `hooks` del módulo correspondiente: integración con el ciclo de vida de React y exposición de estado a la interfaz.

---

## 6. Gestión del estado

Se utilizará una gestión de estado global centralizada y predecible (Zustand como estándar oficial).

Se establecen las siguientes reglas:

- El estado global debe utilizarse cuando la información sea compartida entre varias pantallas o componentes (ej. sesión, ruta seleccionada, unidades activas, estado de transmisión del conductor).
- El estado local de interfaz (ej. apertura de un modal, estado de un input) debe permanecer dentro del componente cuando corresponda.
- Los stores deben mantener responsabilidades claramente delimitadas.
- No se deben duplicar innecesariamente datos voluminosos o persistentes entre el store en memoria y el almacenamiento local.
- Los datos derivados (como distancias, ordenamiento por cercanía o estimaciones de tiempo) deben calcularse de forma controlada y eficiente a partir de sus fuentes originales.

Los stores específicos de un dominio deben ubicarse dentro de su módulo y los transversales en `src/store/`.

---

## 7. Comunicación con el backend y telemetría en tiempo real

La aplicación móvil se comunica con el backend mediante peticiones HTTP/REST y canales bidireccionales en tiempo real (WebSockets).

### 7.1. Fuente de verdad de los contratos

La fuente oficial de los contratos REST, payloads, parámetros, códigos de error y eventos de telemetría debe consultarse en los contratos oficiales del proyecto y en la documentación de API publicada por el backend.

En caso de discrepancias entre el contrato documentado, la documentación de API y la implementación disponible, se debe solicitar aclaración formal antes de desarrollar una integración incompatible.

La aplicación móvil no debe inventar endpoints, modificar unilateralmente payloads ni asumir estructuras de respuesta no documentadas.

### 7.2. Reglas de consumo en tiempo real

- El cliente debe suscribirse únicamente a los canales o *rooms* relevantes para el contexto activo (por ejemplo, la ruta consultada por el pasajero) para optimizar el consumo de datos y batería.
- Las actualizaciones de posición deben incorporar control de frescura (`timestamp` / antigüedad de la última señal) para informar claramente si una unidad tiene señal reciente o desactualizada.
- El cliente debe manejar reconexiones automáticas con espera exponencial (*exponential backoff*) ante caídas de red.

---

## 8. Autenticación, roles y permisos

La aplicación móvil debe contemplar los distintos perfiles de uso definidos para el sistema (por ejemplo, pasajero/invitado, usuario registrado, conductor y roles administrativos si aplican).

Reglas obligatorias:

- Toda comunicación con endpoints protegidos debe adjuntar las credenciales o tokens correspondientes según el contrato definido por el backend.
- Las credenciales sensibles y tokens de sesión deben almacenarse utilizando mecanismos seguros del dispositivo y no en texto plano ni en almacenamientos inseguros.
- La aplicación debe contemplar expiración de sesión, cierre de sesión limpio y redirección o bloqueo de flujos restringidos según el rol.
- Las restricciones visuales o de navegación en la app **no sustituyen** la validación y autorización obligatoria del backend.

---

## 9. Geolocalización, segundo plano y resiliencia

Dado que el núcleo del sistema depende de la ubicación en tiempo real, el manejo de GPS y conectividad es crítico:

- **Permisos explícitos:** solicitar permisos de ubicación en primer plano y, cuando corresponda al **Modo Conductor**, en segundo plano, explicando claramente al usuario para qué se utiliza la ubicación.
- **Continuidad en segundo plano:** el **Modo Conductor** debe mantener la transmisión activa mediante un servicio en primer plano (*Foreground Service*) con notificación persistente visible en Android mientras el recorrido esté en curso.
- **Optimización de muestreo:** aplicar intervalos razonables de frecuencia de envío y/o umbral de desplazamiento para equilibrar precisión, consumo de batería y carga sobre el servidor.
- **Tolerancia a fallos:** contemplar escenarios de GPS apagado, señal deficiente o pérdida temporal de internet mediante alertas visibles y almacenamiento temporal controlado cuando aplique.

---

## 10. Rendimiento, batería y consumo de datos

La aplicación móvil operará en dispositivos Android variados y en condiciones de movilidad real:

- **Fluidez de mapa:** evitar re-renderizados innecesarios del mapa o de todos los marcadores ante cada actualización; animar o actualizar las posiciones de forma eficiente.
- **Eficiencia energética:** detener la escucha o emisión continua de GPS cuando no haya un recorrido o seguimiento activo que lo requiera.
- **Consumo de datos:** cachear catálogos estáticos o semiestáticos (como trazados de rutas y paraderos) localmente para evitar descargas repetitivas innecesarias.

---

## 11. Navegación y flujos de usuario

La navegación de la aplicación móvil debe centralizarse en `src/navigation/`.

Se establecen las siguientes reglas:

- Las rutas y stacks de navegación deben estar organizados por contexto/rol y centralizados.
- El flujo de consulta del pasajero debe priorizar la inmediatez y simplicidad (acceso rápido a ruta, ubicación y tiempo estimado de llegada).
- El flujo del conductor debe priorizar claridad, botones amplios de fácil pulsación y baja distracción visual.
- Las pantallas deben contemplar explícitamente sus estados de carga, vacío, sin permisos y sin conexión.

---

## 12. Estándares de desarrollo

### 12.1. Convención de idiomas

Se establece una convención uniforme para todo el proyecto móvil:

| Elemento | Idioma |
|---|---|
| Código fuente | Inglés |
| Nombres de archivos y carpetas | Inglés |
| Variables, funciones y hooks | Inglés |
| Tipos, interfaces y clases | Inglés |
| Nombres de componentes y pantallas | Inglés |
| Endpoints de API y eventos técnicos | Inglés |
| Textos visibles en la interfaz (UI) | Español |
| Mensajes de validación y alertas al usuario | Español |
| Documentación técnica y `Specs` | Español |
| Mensajes de commit | Inglés |

Todos los textos mostrados al usuario final en la aplicación deben redactarse en español claro y natural.

### 12.2. Calidad del código

Todo el código debe respetar los siguientes principios:

- Responsabilidad única por función, hook, servicio y componente.
- Bajo acoplamiento y alta cohesión.
- Tipado explícito y estricto en TypeScript (evitar `any` sin justificación).
- Manejo controlado de errores y ausencia de lógica duplicada.

### 12.3. Convenciones de commits

Los mensajes de commit deben seguir **Conventional Commits**.

Ejemplos:

- `feat(passenger): add live bus markers on route map`
- `feat(driver): implement background location foreground service`
- `fix(websocket): handle reconnect backoff on network drop`
- `refactor(map): optimize polyline and marker updates`
- `docs(mobile): update technical constitution`

### 12.4. Control de versiones y Pull Requests

El desarrollo debe seguir un flujo basado en GitFlow simplificado.

Ramas principales:

| Rama | Responsabilidad |
|---|---|
| `main` | Código estable y listo para compilación/entrega |
| `develop` | Integración continua de funcionalidades desarrolladas |
| `feature/*` | Desarrollo de funcionalidades o tareas específicas |

Reglas obligatorias:

- No se permiten commits directos a `main` ni a `develop`.
- Todo trabajo debe realizarse en una rama `feature/*` y fusionarse mediante Pull Request.
- Antes de integrar un PR, debe verificarse que TypeScript compile sin errores y que no se rompan los flujos críticos.

---

## 13. Seguridad y privacidad

La aplicación móvil debe aplicar buenas prácticas de seguridad y privacidad:

- No exponer claves secretas ni credenciales sensibles en el código fuente.
- No almacenar información sensible innecesaria en el dispositivo.
- Solicitar únicamente los permisos estrictamente necesarios para cada función.
- Manejar con cuidado los datos de ubicación y sesión, respetando las reglas de autenticación y autorización del backend.
- No confiar en validaciones exclusivas del cliente para reglas críticas de negocio o seguridad.

---

## 14. Pruebas y calidad

La aplicación móvil debe someterse a verificaciones proporcionales a la criticidad de cada módulo:

- **Pruebas unitarias:** validación de utilidades (cálculos geoespaciales, ETA, formateo), hooks y lógica de estado.
- **Pruebas de integración:** validación de servicios, clientes de red y flujos entre componentes y stores.
- **Pruebas en dispositivo físico y campo:** validación obligatoria en dispositivos Android reales y en rutas urbanas para verificar permisos, segundo plano, latencia, batería y comportamiento ante cortes de señal.

Ninguna funcionalidad crítica se considera terminada sin haber verificado su comportamiento real y sus casos de error.

---

## 15. Specs, contratos y decisiones arquitectónicas (ADR)

Esta Constitución define las reglas generales del desarrollo móvil. Los detalles específicos de cada funcionalidad deben documentarse en artefactos separados:

### 15.1. Especificaciones (`Specs`)

Cada funcionalidad o módulo debe contar con su `Spec`, definiendo al menos:

- Objetivo y alcance.
- Flujos de usuario y reglas de negocio.
- Comportamiento de la interfaz y estados (`loading`, `empty`, `permission-denied`, `offline`).
- Criterios de aceptación medibles.
- Dependencias con backend, GPS o permisos del sistema.

### 15.2. Contratos de integración

Los contratos deben especificar endpoints, eventos WebSocket, payloads, códigos de error, reglas de autenticación y estructuras de datos compartidas.

### 15.3. Registros de decisiones arquitectónicas (`ADR`)

Las decisiones estructurales o técnicas relevantes deben quedar registradas en un `ADR` antes de implementarse.

---

## 16. Gobernanza arquitectónica

Toda implementación móvil debe respetar esta Constitución. Requieren documentación y aprobación previa mediante `Spec` o `ADR`:

1. Incorporación de nuevas librerías o dependencias estructurales.
2. Cambios en la arquitectura de carpetas o separación de dominios.
3. Modificaciones en la estrategia de autenticación o almacenamiento seguro de sesión.
4. Cambios en los contratos de API REST o eventos WebSocket.
5. Modificaciones en la frecuencia de muestreo GPS, estrategia de segundo plano o manejo de cola offline.
6. Incorporación de nuevas funciones complementarias o cambios en reglas de acceso por rol/plan.

No deben implementarse cambios estructurales basándose únicamente en suposiciones o acuerdos informales.

---

## 17. Principio rector

La Constitución define cómo debe construirse y organizarse la aplicación móvil.

Las `Specs` definen qué debe hacer cada módulo y cómo debe comportarse.

Los contratos definen cómo se comunica la aplicación con el backend y los eventos en tiempo real.

Los `ADR` documentan por qué se toman decisiones técnicas críticas.

La documentación de gestión define quién ejecuta cada tarea y en qué plazos.

**La aplicación móvil debe mantenerse modular, fluida, confiable en condiciones reales de movilidad y preparada para evolucionar sin comprometer la estabilidad del sistema.**