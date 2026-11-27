# Go Tacna — App móvil

Aplicación Expo y React Native. Este repositorio usa **Expo SDK 58**. Se ejecuta con Expo en la laptop y se abre en el teléfono; **no se ejecuta dentro de Docker**. Docker levanta la base de datos, la API, Socket.IO y la web desde el repositorio de infraestructura.

## Ejecutar en un teléfono Android

1. Arranca Docker desde `../rutas-en-tiempo-real-infraestructura`:

   ```bash
   sudo systemctl start docker
   cd ../rutas-en-tiempo-real-infraestructura
   sudo docker compose up -d --build --wait
   ```

2. Para que el teléfono alcance el backend, cambia `GATEWAY_BIND_HOST=0.0.0.0` en el `.env` de infraestructura y aplica el cambio:

   ```bash
   sudo docker compose up -d --force-recreate nginx
   hostname -I
   ```

   Elige la IP de la laptop en la misma red Wi-Fi que el teléfono. En el navegador del teléfono comprueba `http://IP_DE_TU_LAPTOP:8001/api/v1/rutas`. Si no abre, revisa el firewall de la laptop para el puerto 8001.

3. En **otra terminal**, desde este repositorio móvil, inicia Expo:

   ```bash
   cd /home/david/Documentos/rutas-en-tiempo-real/rutas-en-tiempo-real-movil
   cp .env.example .env   # solo si todavía no existe .env
   npm ci
   npx expo start --lan --port 8084
   ```

   En el `.env` móvil, cambia `API_BASE_URL` y `WS_URL` para que usen `IP_DE_TU_LAPTOP` en lugar de `localhost`. El archivo de ejemplo expone esos valores a Expo mediante `EXPO_PUBLIC_API_BASE_URL` y `EXPO_PUBLIC_WS_URL`. No copies aquí la contraseña de la base de datos ni `JWT_SECRET`.

   Escanea el QR con **Expo Go compatible con SDK 58** en Android. El teléfono y la laptop deben estar en la misma red. Si Expo Go muestra un error de versión, confirma `expo` en `package.json` e instala la versión de Expo Go correspondiente. Si el puerto 8084 está bloqueado por el firewall, el teléfono no podrá descargar el bundle.

Docker queda encendido en segundo plano mientras Expo corre en la otra terminal. Para cerrar Expo, presiona `Ctrl+C`; para detener Docker, ejecuta `sudo docker compose down` desde infraestructura. El [README de infraestructura](../rutas-en-tiempo-real-infraestructura/README.md) explica los puertos y los logs.

## Estado de la integración

El código ya incluye clientes para la API y Socket.IO y lee `EXPO_PUBLIC_API_BASE_URL` y `EXPO_PUBLIC_WS_URL`. El flujo completo de mapa, GPS y seguimiento en vivo sigue en desarrollo. Para un teléfono físico, la URL de API debe ser `http://IP_DE_TU_LAPTOP:8001/api/v1` y la de Socket.IO `http://IP_DE_TU_LAPTOP:8001`. `localhost` dentro del teléfono apunta al propio teléfono.

No guardes `JWT_SECRET`, contraseñas ni otros secretos en variables `EXPO_PUBLIC_*`: Expo las incluye en la aplicación distribuida.

## Desarrollo

```bash
npx expo start --lan --port 8084 --clear  # reiniciar con caché limpia
npx tsc --noEmit                         # revisar TypeScript
npx expo install --check                 # revisar versiones compatibles
```

Usa `npx expo install <paquete>` para agregar módulos compatibles con el SDK instalado. `npm run lint` y `npm run typecheck` comprueban el código. Las funciones que necesiten módulos nativos no incluidos en Expo Go requerirán una compilación de desarrollo propia.

La API y el contrato WebSocket están definidos en [docs](../rutas-en-tiempo-real-docs/contratos/); el código de los servicios está en [backend](../rutas-en-tiempo-real-backend/).
