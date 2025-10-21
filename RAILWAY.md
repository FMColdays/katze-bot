# 🚀 Deployment en Railway

## Variables de Entorno Requeridas

En Railway, necesitas configurar estas variables de entorno:

### Discord Bot
- `DISCORD_TOKEN`: Token de tu bot de Discord
- `DISCORD_CLIENT_ID`: ID de tu aplicación de Discord

### Sistema de Bienvenida (Opcional)
- `WELCOME_CHANNEL_ID`: ID del canal donde enviar mensajes de bienvenida
  - **Nota**: Ahora puedes usar `/welcome canal` en Discord en lugar de esta variable

## Configurar Canal de Bienvenida

### Opción 1: Comando de Discord (Recomendado)
1. En tu servidor de Discord usa: `/welcome canal #tu-canal`
2. El bot verificará permisos automáticamente
3. Cada servidor puede tener su propio canal

### Opción 2: Variable de Entorno (Global)
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

## Configuración Completa del Sistema de Bienvenida

### Comandos Disponibles:
- `/welcome canal #canal` - Configura el canal de bienvenida
- `/welcome imagen [archivo]` - Configura imagen de fondo personalizada  
- `/welcome mensaje [texto]` - Configura mensaje de la imagen
- `/welcome descripcion [texto]` - Configura texto que aparece arriba
- `/welcome preview` - Ve una vista previa
- `/welcome reset` - Restaura configuración por defecto

## Verificar Funcionamiento

Una vez configurado:
1. Usa `/welcome canal #tu-canal` para configurar el canal
2. Usa `/welcome preview` - debería funcionar
3. Haz que alguien se una al servidor
4. Revisa los logs de Railway para mensajes de error

## Logs importantes a revisar:
- `⚠️ Canal de bienvenida no configurado` - Usa `/welcome canal` o configura `WELCOME_CHANNEL_ID`
- `⚠️ Canal de bienvenida no encontrado` - ID incorrecto o canal eliminado
- `✅ Nuevo miembro: usuario` - Funcionando correctamente
- `📁 Configuración cargada para servidor` - Configuración personalizada encontrada

## Troubleshooting

Si el preview funciona pero el evento no:
- Verifica que `WELCOME_CHANNEL_ID` esté configurado
- Verifica que el bot tenga permisos en ese canal
- Revisa los logs de Railway para errores