import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos disponibles del bot')

export async function execute(interaction) {
  const embed = {
    title: '🤖 Katze Bot - Comandos Disponibles',
    description: 'Aquí tienes todos los comandos que puedes usar:',
    fields: [
      {
        name: '🎵 **Comandos de Música**',
        value:
          '`/play` - Reproduce música\n`/pause` - Pausa/reanuda\n`/skip` - Salta canción\n`/stop` - Detiene música\n`/queue` - Ve la cola\n`/music` - Ayuda de música',
        inline: true,
      },
      {
        name: '🔧 **Comandos de Utilidad**',
        value:
          '`/ping` - Latencia del bot\n`/info` - Info del servidor/usuario\n`/say` - Hace que el bot diga algo\n`/reload` - Recarga comandos',
        inline: true,
      },
      {
        name: '🎨 **Comandos de Demostración**',
        value:
          '`/ejemplos` - Ejemplos de embeds\n`/voice` - Info de canales de voz\n`/audio` - Diagnósticos de audio\n`/musictest` - Test del sistema',
        inline: true,
      },
      {
        name: '📋 **Información del Bot**',
        value: 'Bot creado con Discord.js v14\nSistema de música con DistubJS\nSoporte para YouTube',
        inline: false,
      },
    ],
    color: 0x00ae86,
    thumbnail: { url: interaction.client.user.displayAvatarURL() },
    footer: {
      text: `Bot creado para ${interaction.guild?.name || 'Discord'}`,
    },
    timestamp: new Date(),
  }

  await interaction.reply({ embeds: [embed] })
}
