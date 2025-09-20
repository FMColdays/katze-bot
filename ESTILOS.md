# 🎨 Guía de Estilos para Comandos

Esta guía te muestra cómo hacer que tus comandos se vean profesionales y atractivos usando **embeds** de Discord.

## 🚀 Embeds Básicos

### Importar EmbedBuilder
```javascript
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
```

### Estructura básica
```javascript
const embed = new EmbedBuilder()
  .setTitle('Título del embed')
  .setDescription('Descripción principal')
  .setColor(0x00AE86) // Color en hexadecimal
  .addFields(
    { name: 'Campo 1', value: 'Valor 1', inline: true },
    { name: 'Campo 2', value: 'Valor 2', inline: true }
  )
  .setFooter({ text: 'Texto del footer' })
  .setTimestamp();

await interaction.reply({ embeds: [embed] });
```

## 🎨 Colores Recomendados

```javascript
// Colores por estado
const colores = {
  exito: 0x00FF00,    // Verde
  error: 0xFF0000,     // Rojo  
  advertencia: 0xFFFF00, // Amarillo
  info: 0x00AE86,      // Azul verdoso
  neutro: 0x99AAB5     // Gris
};
```

## 📊 Campos y Formato

### Campos en línea vs completos
```javascript
.addFields(
  { name: 'Inline 1', value: 'Valor', inline: true },  // Se muestran en la misma línea
  { name: 'Inline 2', value: 'Valor', inline: true },
  { name: 'Completo', value: 'Ocupa toda la línea', inline: false }
)
```

### Formato de texto
```javascript
// Texto con formato
{ name: 'Estadísticas', value: '```\n• Línea 1\n• Línea 2\n```' }

// Con código
{ name: 'Código', value: '```javascript\nconsole.log("Hola");\n```' }

// Con énfasis
{ name: 'Texto', value: '**Negrita** *Cursiva* `Código` [Enlace](https://example.com)' }
```

## 🖼️ Elementos Visuales

### Imágenes y thumbnails
```javascript
.setThumbnail(user.displayAvatarURL({ dynamic: true }))
.setImage('https://via.placeholder.com/400x200')
```

### Timestamps y footers
```javascript
.setFooter({ 
  text: `Solicitado por ${interaction.user.tag}`, 
  iconURL: interaction.user.displayAvatarURL() 
})
.setTimestamp() // Timestamp actual
.setTimestamp(new Date('2023-01-01')) // Timestamp específico
```

## 🔘 Componentes Interactivos

### Botones
```javascript
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('mi_boton')
      .setLabel('Hacer clic')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🔵')
  );

await interaction.reply({ embeds: [embed], components: [row] });
```

## 📋 Timestamps Dinámicos

```javascript
// Formato de Discord que se actualiza automáticamente
const timestamp = Math.floor(Date.now() / 1000);

{ name: 'Fecha', value: `<t:${timestamp}:F>` }     // Fecha completa
{ name: 'Hora', value: `<t:${timestamp}:T>` }      // Solo hora
{ name: 'Relativo', value: `<t:${timestamp}:R>` }  // "hace 5 minutos"
```

## 🎯 Consejos de Diseño

1. **Usa emojis** para hacer los campos más visuales
2. **Colores consistentes** según el tipo de mensaje
3. **Campos inline** para información compacta
4. **Thumbnails** para avatares o iconos
5. **Footers** para información adicional
6. **Timestamps** para mostrar cuándo ocurrió algo

## ✨ Ejemplos Listos

Usa `/ejemplos` con estas opciones:
- `colorido` - Embed con muchos elementos visuales
- `lista` - Información bien estructurada
- `error` - Mensaje de error profesional
- `exito` - Mensaje de confirmación
- `botones` - Embed con componentes interactivos

¡Experimenta con diferentes combinaciones para crear comandos únicos y atractivos!
