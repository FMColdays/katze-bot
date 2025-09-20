# katze-bot

Bot de Discord básico con slash commands.

## Requisitos
- Node.js 18.17+ (o superior)
- Una aplicación de Discord con un bot (https://discord.com/developers/applications)

## Configuración
1. Copia `.env.example` a `.env` y completa:
   - `DISCORD_TOKEN`: token del bot (pestaña Bot -> Reset Token)
   - `DISCORD_CLIENT_ID` (opcional): ID de la aplicación para registrar comandos globales.
2. Invita el bot a tu servidor:
   - Ve a "OAuth2 -> URL Generator" en el portal de Discord.
   - Scopes: `bot` y `applications.commands`.
   - Permisos: al menos `Send Messages`, `Read Messages/View Channels`.
   - Abre la URL generada e invita el bot.

## Scripts
- `npm run dev` inicia el bot en modo watch.
- `npm start` inicia el bot normalmente.

## Comandos
- `/ping` responde "Pong!".
- `/say texto:<mensaje>` repite el mensaje.
- `!ping` (prefijo) responde "Pong!".

## Registro de comandos
- Global (tarda hasta 1h): define `DISCORD_CLIENT_ID` en `.env` y arranca el bot; registrará globalmente.
- Por servidor (rápido): puedes adaptar `registerCommands(guildId)` llamándolo con el `GUILD_ID` si lo deseas.

## Desarrollo
- Edita `src/index.js` para agregar más comandos y eventos.
