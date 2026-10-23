# go-tacna — App Móvil

App Android del proyecto, con dos modos:

- **Pasajero** — elige una ruta, ve los micros en el mapa y consulta cuánto falta para que lleguen.
- **Modo Conductor** — inicia su recorrido y el celular envía el GPS cada 3-5 s.

> **Pregunta que responde la app:** "¿Dónde está mi micro y cuánto falta para que llegue?"

---

## ⚠️ Estado actual

**Este repositorio está vacío.** La app vive hoy en el monorepo `go-tacna-frontend/mobile/`, y está en el **esqueleto de Expo**: la pantalla inicial es la de ejemplo del template, sin mapa ni GPS.

Este README describe el **diseño objetivo** y la estructura que ya existe.

---

## 1. Alcance

Solo **Android**, solo **Tacna**, en la primera versión. Quedan para después: iOS, funciones Premium (aforo, alertas deproximidad, historial de recorridos) y soporte de otras ciudades.

---

## 2. Stack

| Tecnología | Versión | Propósito |
|---|---|---|
| **Expo** | SDK **57** (`~57.0.26`) | Permite programar la app con TypeScript; simplifica la configuración nativa |
| **React Native** | `0.86.3` | Runtime de la app |
| **React** | `19.2.3` | Componentes |
| **Expo Router** | `~57.0.24` | Navegación por estructura de carpetas |
| **expo-location** | — | Obtiene el GPS del conductor |
| **expo-task-manager** | — | Mantiene el GPS con la pantalla apagada (Modo Conductor) |
| **expo-secure-store** | — | Guarda el token de sesión de forma segura en el celular |
| **MapLibre React Native** | — | Mapa nativo basado en OpenStreetMap, sin API key ni costo |
| **Socket.io-client** | — | Recibe las posiciones de los micros en vivo |
| **TypeScript** | `~6.0.3` | Detecta errores antes de ejecutar |
| **Development build** | — | Versión de desarrollo (ver la advertencia de abajo) |

Ya instalados en el monorepo: `expo-constants`, `expo-device`, `expo-font`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`, `expo-system-ui`, `expo-web-browser`, `react-native-safe-area-context`, `react-native-screens`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-web`.

> ### ⚠️ No funciona con Expo Go
> El Modo Conductor necesita **GPS en segundo plano** y **mapas nativos**. Expo Go solo incluye sus propios módulos nativos, así que la app necesita un **development build**:
>
> ```bash
> npx expo run:android                              # en tu máquina
> eas build --profile development                   # en la nube
> ```
>
> Agregar cualquier librería con código nativo obliga a rehacer el build.

---

## 3. Puesta en marcha

```bash
npm ci
npx expo start
npx expo start --android        # emulador o dispositivo conectado
```

Como la app usa GPS en segundo plano y mapas nativos, el flujo real es:

```bash
npx expo run:android            # compila el development build y lo instala
```

### Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo de Expo |
| `npm run android` | Abre en Android (requiere development build) |
| `npm run ios` | Abre en iOS *(fuera de alcance por ahora)* |
| `npm run web` | Abre en el navegador |
| `npm run lint` | Linter |
| `npx tsc --noEmit` | Verificación de tipos |
| `npx expo-doctor` | Diagnostica problemas de configuración y dependencias |
| `npx expo install <paquete>` | **Siempre** en vez de `npm install`, para resolver versiones compatibles |
| `npx expo install --fix` | Corrige versiones incompatibles |

### Variables de entorno

La app necesita la URL de la API y la del servidor de tiempo real. Usa `EXPO_PUBLIC_` como prefijo para que Expo las exponga al bundle:

```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_REALTIME_URL=http://localhost:3001
```

En un celular físico, `localhost` apunta al propio teléfono: usa la IP de tu computadora en la red local (por ejemplo `http://192.168.1.10:8000/api`).

---

## 4. Estructura

```
src/
  app/                    Cada archivo es una pantalla (Expo Router)
    _layout.tsx           Layout raíz y providers
    index.tsx             Pantalla de inicio
    (tabs)/               Navegación por pestañas
  components/             Componentes reutilizables
  constants/              Colores, tema y constantes
  hooks/                  Hooks propios
assets/                   Iconos y splash

app.json                  Configuración de Expo
```

Expo Router trata **cada archivo dentro de `src/app/` como una pantalla**; los `_layout.tsx` definen los navegadores. El código que no sea de navegación (componentes, hooks, utilidades) va **fuera** de `src/app/`.

### Pantallas previstas

| Pantalla | Modo | Para qué |
|---|---|---|
| **Login** | ambos | Iniciar sesión y guardar el token |
| **Selector de ruta** | pasajero | Elegir la ruta a seguir |
| **Mapa en vivo** | pasajero | Ver los micros de la ruta y su ETA |
| **Modo Conductor** | conductor | Iniciar y detener el recorrido |
| **Confirmar micro y ruta** | conductor | Elegir a qué unidad y ruta pertenece |

---

## 5. Cómo funciona el Modo Conductor

1. El conductor inicia sesión. La app guarda el token en `expo-secure-store` (nunca en `AsyncStorage`, porque el token da acceso a la transmisión).
2. Elige su **micro** y la **ruta** que va a recorrer.
3. Pulsa **iniciar recorrido**: la app registra una tarea en background con `expo-task-manager`.
4. Cada **3-5 segundos** lee el GPS con `expo-location` y envía `POST /tracking/position`:

   ```json
   { "lat": -18.0146, "lng": -70.2536, "speed": 8.4 }
   ```

   El token va en `Authorization: Bearer <token>`; el servidor toma `micro_id` y `ruta_id` de sus claims.

5. Android exige un **foreground service** —una notificación fija— para seguir enviando GPS con la pantalla apagada. El usuario debe aceptarla.
6. Al terminar, la app llama `POST /tracking/stop`.

Se eligió **HTTP POST en vez de WebSocket para enviar el GPS** porque en celulares una conexión permanente es mucho más frágil que peticiones cortas; la conexión abierta se reserva para el pasajero, que solo recibe.

El límite del servidor es de **60 peticiones por minuto por micro**, así que el intervalo de 3-5 s deja margen amplio.

---

## 6. Contrato con los demás repositorios

Este repo **no** define los contratos; los consume.

- **Endpoints de la API** → `go-tacna-docs/docs/openapi.yaml`
- **Eventos WebSocket y claims del JWT** → `go-tacna-docs`
- **Certificados HTTPS** → `go-tacna-infraestructura`

> **El GPS requiere HTTPS.** Android no permite ubicación en una conexión no segura fuera de `localhost`. El certificado lo emite Let's Encrypt desde `go-tacna-infraestructura`.

Si un contrato cambia, se cambia primero en `docs/`.

---

## 7. Problemas conocidos

1. **La app es el esqueleto del template de Expo**: no hay mapa, ni GPS, ni llamadas a la API.
2. **Faltan las librerías que sostienen el Modo Conductor**: `expo-location`, `expo-task-manager`, `expo-secure-store`, MapLibre React Native y `socket.io-client` no están instaladas.
3. **`app.json` no declara permisos** de ubicación ni el foreground service.
4. **No hay `eas.json`**, así que todavía no hay perfiles de build ni firma configurados.
5. **No hay variables de entorno** definidas (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_REALTIME_URL`).

---

## 8. Glosario

- **Foreground service:** notificación fija en Android que permite seguir enviando GPS aunque la pantalla esté apagada.
- **Development build:** compilación propia que incluye los módulos nativos. Necesaria porque Expo Go no trae GPS en segundo plano ni MapLibre.
- **Background task:** tarea que se ejecuta aunque la app no esté en pantalla (configurada con `expo-task-manager`).
- **Continuously Native Generation:** los directorios `ios/` y `android/` los genera Expo. **Nunca se editan a mano**: el comportamiento nativo se configura en `app.json` y en los *config plugins*.
- **Variable de entorno en Expo:** cualquier variable con prefijo `EXPO_PUBLIC_` queda expuesta en el bundle. Nunca pongas un secreto ahí.

---

## 9. Equipo

| Integrante | Rol prioritario |
|---|---|
| Royfrankly Navarro | Coordinación general, Backend y DevOps |
| David Montador | Arquitectura de software y módulo GPS en tiempo real |
| Alex Huaracha | Diseño UI/UX y desarrollo Frontend/Móvil |
| Edison Catari | Calidad (QA), pruebas y automatización |

---

## 10. Enlaces

| Repositorio | Propósito |
|---|---|
| `go-tacna-movil` | Este repositorio. App Android. |
| `go-tacna-backend` | API Laravel y servidor de tiempo real. |
| `go-tacna-frontend` | Web pública y panel de administración. |
| `go-tacna-infraestructura` | Docker, k3s, Traefik y despliegue. |
| `go-tacna-docs` | Informe, requisitos, contratos y cronograma. |

Tablero de tareas: [Planificación go-tacna](https://github.com/orgs/go-tacna/projects/1)