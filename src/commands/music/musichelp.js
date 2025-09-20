import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder().setName('music').setDescription('Muestra todos los comandos de música disponibles')

export async function execute(interaction) {
  const embed = {
    title: '🎵 Comandos de Música',
    description: 'Lista de todos los comandos de música disponibles:',
    fields: [
      {
        name: '🎵 `/play <canción>`',
        value: 'Reproduce música desde YouTube. Puedes usar una URL o buscar por nombre.',
        inline: false,
      },
      {
        name: '⏸️ `/pause`',
        value: 'Pausa o reanuda la música actual.',
        inline: false,
      },
      {
        name: '⏭️ `/skip`',
        value: 'Salta a la siguiente canción en la cola.',
        inline: false,
      },
      {
        name: '⏹️ `/stop`',
        value: 'Detiene la música y desconecta el bot del canal de voz.',
        inline: false,
      },
      {
        name: '📝 `/queue`',
        value: 'Muestra la cola de música actual con todas las canciones.',
        inline: false,
      },
      {
        name: '🔧 `/musictest`',
        value: 'Verifica la conexión y permisos del sistema de música.',
        inline: false,
      },
    ],
    color: 0x00ae86,
    footer: {
      text: 'Usa estos comandos dentro de un canal de voz para reproducir música',
    },
    timestamp: new Date(),
  }

  await interaction.reply({ embeds: [embed] })
}
