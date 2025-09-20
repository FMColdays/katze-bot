// src/commands/resume.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getDistube } from './play.js' // reutiliza la MISMA instancia de DisTube

export const data = new SlashCommandBuilder().setName('resume').setDescription('Reanuda la música pausada')

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

    // Validaciones de cola
    if (!queue) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setTitle('❌ No hay música').setDescription('No hay ninguna cola activa en este servidor.').setColor(0xff0000),
        ],
        ephemeral: true,
      })
    }

    // Debe estar en el mismo canal de voz que la cola
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

    // Si no está pausado, avisa
    if (!queue.paused) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle('ℹ️ Ya está reproduciendo').setDescription('La música no está pausada.').setColor(0x00ae86)],
        ephemeral: true,
      })
    }

    // Reanudar
    await dt.resume(interaction.guildId)

    const current = queue.songs?.[0]
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('▶️ Música reanudada')
          .setDescription('La música se ha reanudado.')
          .addFields(
            { name: '🎵 Canción actual', value: current?.name ?? '—', inline: true },
            { name: '👤 Solicitado por', value: interaction.user.tag, inline: true }
          )
          .setColor(0x00ae86),
      ],
    })
  } catch (error) {
    console.error('Error en comando resume:', error)
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({
        embeds: [new EmbedBuilder().setTitle('❌ Error').setDescription('Ocurrió un error al reanudar la música.').setColor(0xff0000)],
        ephemeral: true,
      })
    }
    return interaction.reply({
      embeds: [new EmbedBuilder().setTitle('❌ Error').setDescription('Ocurrió un error al reanudar la música.').setColor(0xff0000)],
      ephemeral: true,
    })
  }
}
