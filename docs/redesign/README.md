# Rediseño móvil de Go Tacna

La rama `feature/mobile-ui-ux-redesign` parte de `develop` en `e3fd4dd`. El historial contiene la base de `main`, los clientes y contratos de Fase 1, los flujos y pruebas de Fase 2, el seguimiento de Fase 3 y la actualización `fix/expo-sdk-58-dependencies`. El mapa público utiliza la implementación de Fase 3 integrada en SDK 58.

## Pantallas y capturas

| Pantalla | Cambios | Captura Android |
| --- | --- | --- |
| Bienvenida | Marca vectorial, ilustración inspirada en el Arco Parabólico y acceso principal al mapa | [320 dp](welcome-320.png), [360 dp](welcome-360.png), [390 dp](welcome-390.png), [412 dp](welcome-412.png), [480 dp](welcome-480.png) |
| Acceso y registro | Estructura compartida, etiquetas visibles y formularios de prueba identificados | [Acceso](login.png), [teclado abierto](login-keyboard.png), [navegación de tres botones](login-three-buttons.png), [registro](register.png), [confirmación local](success.png) |
| Pasajero público | Catálogo con búsqueda local, selección por línea, mapa nativo y ficha de unidades | [Catálogo sin conexión en el emulador](passenger.png) |
| Conductor | Unidad y tiempo en una superficie oscura, indicadores compactos y control principal | [Simulación de recorrido](driver.png) |
| Revisión interna | Selector de escenario plegable y modo de pantalla completa | [Galería](ui-preview.png) |

## Diseño y navegación

- `src/theme/index.tsx` concentra la escala de Inter, los colores semánticos y la asignación estable de color por identificador de ruta. El catálogo público proporciona nombre e identificador de empresa. El selector admite el nombre de empresa cuando su fuente se lo facilita.
- `AppHeader` y `MapPreview` dibujan la identidad con SVG. `AuthLayout` comparte área segura, teclado y composición. Se reutilizan `AppText`, `ActionButton`, `AppIcon`, `ScreenLayout`, `TextField` y `BottomSheetCard`. `IconButton` identifica las acciones cartográficas para lectores de pantalla.
- El pasajero entra directamente al mapa y cambia de línea desde el buscador. Las pantallas de cuenta siguen siendo demostraciones. El perfil autenticado queda para su fase funcional.
- Para abrir la galería en desarrollo, entrar al menú de React Native desde Expo Go y seleccionar «Go Tacna · Revisión de interfaz». En web de desarrollo se puede abrir `/ui-preview`. Expo Router protege las rutas de galería y conductor con `Stack.Protected`. El engranaje superpuesto que se observa en las capturas corresponde al entorno de desarrollo de Expo Go, fuera del diseño público.
- Seguimiento, suscripción por línea, frescura, permiso de ubicación y ETA siguen usando los servicios existentes. El control de recorrido de la galería sigue siendo una simulación local.
- Los cambios de dependencias se limitan a Jest y sus tipos para las versiones de desarrollo compatibles con SDK 58.

## Validación

TypeScript y lint aprobados, 30 pruebas de servicios y 23 de interfaz aprobadas. La comprobación de dependencias de Expo y las 20 comprobaciones de Expo Doctor pasaron. Expo Go abrió el proyecto en un Pixel 10a emulado. Se comprobó el diálogo de confirmación al pulsar Atrás de Android durante una simulación activa. La captura de pasajero refleja el estado real del catálogo durante la prueba. La verificación con un micro en movimiento, el ETA desde un teléfono físico y la revisión manual con TalkBack siguen pendientes.
