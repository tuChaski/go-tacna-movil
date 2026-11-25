# Plan de Desarrollo de la Aplicación Móvil — Sistema de Transporte Público (Tacna)

Este documento define las fases estructuradas de ingeniería, diseño, implementación y validación para el desarrollo de la aplicación móvil (**Android** como plataforma inicial) del sistema de monitoreo de transporte público en tiempo real.

---

## Resumen Ejecutivo de Fases

| Fase | Nombre | Enfoque Principal | Entregable Clave |
| :--- | :--- | :--- | :--- |
| **Fase 1** | Arquitectura Móvil, Contratos y Entorno Base | Setup del repositorio, capas y contratos API/WS | Proyecto base compilando + contratos congelados |
| **Fase 2** | Diseño UI/UX, Flujos y Estados de Pantalla | Prototipos Pasajero/Conductor y manejo de estados | Prototipo validado + Matriz de estados UI |
| **Fase 3** | Módulo Pasajero (Mapa, Rutas, Tiempo Real y ETA) | Visor geoespacial, WebSockets y cálculo de llegada | Consulta en vivo operativa (< 3s latencia) |
| **Fase 4** | Módulo "Modo Conductor" y Telemetría GPS | Servicio en segundo plano y resiliencia de red | Transmisión GPS continua con pantalla bloqueada |
| **Fase 5** | Gestión de Cuentas, Roles y Funciones Extra | Autenticación, reglas de negocio y alertas | App con gestión de roles y funciones de valor |
| **Fase 6** | Pruebas de Campo, Optimización y Despliegue | QA físico en rutas de Tacna, batería y APK firmado | APK / AAB de producción validado en calle |

---

## Fase 1: Arquitectura Móvil, Contratos y Entorno Base

**Objetivo:** Establecer la infraestructura técnica en el repositorio móvil y congelar los formatos de intercambio de datos con el backend antes de iniciar el desarrollo de interfaces.

### 1.1. Configuración del Proyecto y Arquitectura de Carpetas
- [ ] Inicializar el proyecto móvil para Android (**React Native** con **TypeScript** en modo estricto).
- [ ] Configurar flujo de trabajo en Git (`main`, `develop`, `feature/*`) y linters (`ESLint`, `Prettier`).
- [ ] Definir variables de entorno (`.env` para `API_BASE_URL`, `WS_URL`, `MAPS_API_KEY`).
- [ ] Estructurar el código fuente bajo una arquitectura modular por características (*feature-based*):

```text
src/
├── api/             # Clientes HTTP (Axios/Fetch) y gestor de WebSockets
├── components/      # Componentes UI reutilizables y elementos de mapa
├── features/
│   ├── auth/        # Inicio de sesión, registro y manejo de tokens
│   ├── passenger/   # Mapa de consulta, selección de rutas, paraderos y ETA
│   └── driver/      # Modo conductor, transmisión GPS y control de turno
├── hooks/           # Hooks personalizados (permisos, geolocalización, red)
├── store/           # Estado global de la aplicación
└── utils/           # Cálculos geoespaciales (Haversine, interpolación, ETA)