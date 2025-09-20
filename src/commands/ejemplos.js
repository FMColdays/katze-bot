import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('ejemplos')
  .setDescription('Muestra diferentes estilos de embeds y componentes')
  .addStringOption(option =>
    option
      .setName('tipo')
      .setDescription('Tipo de ejemplo a mostrar')
      .setRequired(true)
      .addChoices(
        { name: '🎨 Embed Colorido', value: 'colorido' },
        { name: '📋 Lista Organizada', value: 'lista' },
        { name: '⚠️ Mensaje de Error', value: 'error' },
        { name: '✅ Mensaje de Éxito', value: 'exito' },
        { name: '🔘 Con Botones', value: 'botones' }
      )
  )

export async function execute(interaction) {
  const tipo = interaction.options.getString('tipo')

  switch (tipo) {
    case 'colorido':
      const embedColorido = new EmbedBuilder()
        .setTitle('🌈 Embed Colorido')
        .setDescription('Este es un ejemplo de embed con muchos colores y elementos visuales')
        .setColor(0xff6b6b)
        .setThumbnail('https://cdn.discordapp.com/emojis/123456789.png') // URL de ejemplo
        .setImage('https://via.placeholder.com/400x200/FF6B6B/FFFFFF?text=Imagen+Principal')
        .addFields(
          { name: '🔥 Campo 1', value: 'Contenido del primer campo', inline: true },
          { name: '⭐ Campo 2', value: 'Contenido del segundo campo', inline: true },
          { name: '💎 Campo 3', value: 'Contenido del tercer campo', inline: true },
          { name: '📌 Campo Completo', value: 'Este campo ocupa toda la línea porque no tiene inline', inline: false }
        )
        .setFooter({ text: 'Footer con información adicional', iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()

      await interaction.reply({ embeds: [embedColorido] })
      break

    case 'lista':
      const embedLista = new EmbedBuilder()
        .setTitle('📋 Lista Organizada')
        .setDescription('Ejemplo de información bien estructurada')
        .setColor(0x4ecdc4)
        .addFields(
          {
            name: '📈 Estadísticas',
            value: '```\n• Usuarios activos: 1,234\n• Mensajes hoy: 5,678\n• Comandos ejecutados: 890\n```',
            inline: false,
          },
          {
            name: '🏆 Top 3 Usuarios',
            value: '```\n1. Usuario#1234 - 150 msgs\n2. Usuario#5678 - 120 msgs\n3. Usuario#9012 - 95 msgs\n```',
            inline: false,
          },
          { name: '🔧 Configuración', value: '```yaml\nPrefijo: !\nIdioma: Español\nModeración: Activada\n```', inline: false }
        )

      await interaction.reply({ embeds: [embedLista] })
      break

    case 'error':
      const embedError = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription('Algo salió mal. Aquí tienes los detalles:')
        .setColor(0xff4757)
        .addFields(
          { name: '🚨 Tipo de Error', value: 'ValidationError', inline: true },
          { name: '📍 Código', value: 'ERR_001', inline: true },
          { name: '💡 Solución', value: 'Verifica los parámetros e intenta de nuevo', inline: false }
        )
        .setFooter({ text: 'Si el error persiste, contacta al administrador' })

      await interaction.reply({ embeds: [embedError], ephemeral: true })
      break

    case 'exito':
      const embedExito = new EmbedBuilder()
        .setTitle('✅ Operación Exitosa')
        .setDescription('¡Todo se completó correctamente!')
        .setColor(0x2ed573)
        .addFields(
          { name: '⏱️ Tiempo', value: '0.3 segundos', inline: true },
          { name: '📊 Elementos procesados', value: '42', inline: true },
          { name: '💾 Estado', value: 'Guardado automáticamente', inline: true }
        )
        .setThumbnail('https://via.placeholder.com/128x128/2ED573/FFFFFF?text=✅')

      await interaction.reply({ embeds: [embedExito] })
      break

    case 'botones':
      const embedBotones = new EmbedBuilder()
        .setTitle('🔘 Embed con Botones')
        .setDescription('Este embed incluye botones interactivos')
        .setColor(0x5352ed)

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('primary').setLabel('Primario').setStyle(ButtonStyle.Primary).setEmoji('🔵'),
        new ButtonBuilder().setCustomId('secondary').setLabel('Secundario').setStyle(ButtonStyle.Secondary).setEmoji('⚪'),
        new ButtonBuilder().setCustomId('success').setLabel('Éxito').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId('danger').setLabel('Peligro').setStyle(ButtonStyle.Danger).setEmoji('❌')
      )

      await interaction.reply({
        embeds: [embedBotones],
        components: [row],
        content:
          'Los botones solo son visuales en este ejemplo - para hacerlos funcionales necesitas agregar un collector de interacciones.',
      })
      break
  }
}
