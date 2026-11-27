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
   npm ci
   npx expo start --lan --port 8084
   ```

   Escanea el QR con **Expo Go compatible con SDK 58** en Android. El teléfono y la laptop deben estar en la misma red. Si Expo Go muestra un error de versión, confirma `expo` en `package.json` e instala la versión de Expo Go correspondiente. Si el puerto 8084 está bloqueado por el firewall, el teléfono no podrá descargar el bundle.

Docker queda encendido en segundo plano mientras Expo corre en la otra terminal. Para cerrar Expo, presiona `Ctrl+C`; para detener Docker, ejecuta `sudo docker compose down` desde infraestructura. El [README de infraestructura](../rutas-en-tiempo-real-infraestructura/README.md) explica los puertos y los logs.

## Estado de la integración

El código que hay actualmente en este repositorio incluye pantallas de acceso y componentes visuales. **Todavía no consume las variables `EXPO_PUBLIC_API_URL` ni `EXPO_PUBLIC_REALTIME_URL`**, y no contiene la integración completa del mapa, GPS y seguimiento en vivo. Abrir la app con Expo confirma que la interfaz arranca; no demuestra que ya consulte la API o reciba posiciones de Socket.IO. Cuando se integre el cliente móvil, su URL de API deberá ser `http://IP_DE_TU_LAPTOP:8001/api/v1` y la de Socket.IO `http://IP_DE_TU_LAPTOP:8001` para un teléfono físico. `localhost` dentro del teléfono apunta al propio teléfono.

No guardes `JWT_SECRET`, contraseñas ni otros secretos en variables `EXPO_PUBLIC_*`: Expo las incluye en la aplicación distribuida.

## Desarrollo

```bash
npx expo start --lan --port 8084 --clear  # reiniciar con caché limpia
npx tsc --noEmit                         # revisar TypeScript
npx expo install --check                 # revisar versiones compatibles
```

Usa `npx expo install <paquete>` para agregar módulos compatibles con el SDK instalado. `npm run lint` aún requiere configurar ESLint en este repositorio. Las funciones que necesiten módulos nativos no incluidos en Expo Go requerirán una compilación de desarrollo propia.

La API y el contrato WebSocket están definidos en [docs](../rutas-en-tiempo-real-docs/contratos/); el código de los servicios está en [backend](../rutas-en-tiempo-real-backend/).
