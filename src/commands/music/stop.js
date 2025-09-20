// src/commands/stop.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getDistube } from './play.js'

export const data = new SlashCommandBuilder().setName('stop').setDescription('Detiene la música y limpia la cola')

export async function execute(interaction) {
  try {
    const voiceChannel = interaction.member?.voice?.channel
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription('Debes estar en un canal de voz para usar este comando.')
            .setColor(0xff0000),
        ],
        ephemeral: true,
      })
    }

    const dt = getDistube(interaction.client)
    const queue = dt.getQueue(interaction.guildId)

    if (!queue) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle('🛑 Nada que detener').setDescription('No hay una cola activa.').setColor(0xffa500)],
        ephemeral: true,
      })
    }

    if (queue.voiceChannel && queue.voiceChannel.id !== voiceChannel.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Canal incorrecto')
            .setDescription(`Debes estar en **${queue.voiceChannel.name}** para controlar la música.`)
            .setColor(0xff0000),
        ],
        ephemeral: true,
      })
    }

    await dt.stop(interaction.guildId) // listeners ya desconectan al bot en 'stop'
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('⏹️ Música detenida')
          .setDescription('La reproducción se detuvo y la cola fue limpiada.')
          .setColor(0x00ae86),
      ],
    })
  } catch (err) {
    console.error('Error en comando stop:', err)
    const embed = new EmbedBuilder().setTitle('❌ Error').setDescription('Ocurrió un error al detener la música.').setColor(0xff0000)
    if (interaction.deferred || interaction.replied) return interaction.followUp({ embeds: [embed], ephemeral: true })
    return interaction.reply({ embeds: [embed], ephemeral: true })
  }
}
