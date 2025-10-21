# 🚀 Deployment en Railway

## Variables de Entorno Requeridas

En Railway, necesitas configurar estas variables de entorno:

### Discord Bot
- `DISCORD_TOKEN`: Token de tu bot de Discord
- `DISCORD_CLIENT_ID`: ID de tu aplicación de Discord

### Sistema de Bienvenida
- `WELCOME_CHANNEL_ID`: ID del canal donde enviar mensajes de bienvenida

## Cómo obtener el WELCOME_CHANNEL_ID

1. En Discord, ve al canal donde quieres los mensajes de bienvenida
2. Haz click derecho en el canal → "Copiar ID"
3. Si no ves "Copiar ID", activa el Modo Desarrollador:
   - Configuración de Usuario → Avanzado → Modo Desarrollador → ON

## Configuración en Railway

1. Ve a tu proyecto en Railway
2. Pestaña "Variables"
3. Agrega cada variable:
   ```
   DISCORD_TOKEN=tu_token_aqui
   DISCORD_CLIENT_ID=tu_client_id_aqui
   WELCOME_CHANNEL_ID=123456789012345678
   ```

## Verificar Funcionamiento

Una vez configurado:
1. Usa `/welcome preview` - debería funcionar
2. Haz que alguien se una al servidor
3. Revisa los logs de Railway para mensajes de error

## Logs importantes a revivar:
- `⚠️ WELCOME_CHANNEL_ID no configurado` - Falta variable
- `⚠️ Canal de bienvenida no encontrado` - ID incorrecto
- `✅ Nuevo miembro: usuario` - Funcionando correctamente

## Troubleshooting

Si el preview funciona pero el evento no:
- Verifica que `WELCOME_CHANNEL_ID` esté configurado
- Verifica que el bot tenga permisos en ese canal
- Revisa los logs de Railway para errores