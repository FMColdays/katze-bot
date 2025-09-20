// src/commands/pause.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getDistube } from './play.js' // reutiliza la MISMA instancia

export const data = new SlashCommandBuilder().setName('pause').setDescription('Pausa la música actual')

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

    // No hay cola o no hay reproducción activa
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setTitle('❌ No hay música').setDescription('No hay música reproduciéndose actualmente.').setColor(0xff0000),
        ],
        ephemeral: true,
      })
    }

    // Usuario debe estar en el mismo canal de voz que la cola
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

    // Si ya está pausada, avisa
    if (queue.paused) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle('ℹ️ Ya está pausada').setDescription('La música ya está en pausa.').setColor(0x00ae86)],
        ephemeral: true,
      })
    }

    // Pausar
    await dt.pause(interaction.guildId)

    const current = queue.songs?.[0]
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('⏸️ Música pausada')
          .setDescription('La música se ha pausado.')
          .addFields(
            { name: '🎵 Canción actual', value: current?.name ?? '—', inline: true },
            { name: '👤 Solicitado por', value: interaction.user.tag, inline: true }
          )
          .setColor(0x00ae86),
      ],
    })
  } catch (error) {
    console.error('Error en comando pause:', error)
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({
        embeds: [new EmbedBuilder().setTitle('❌ Error').setDescription('Ocurrió un error al pausar la música.').setColor(0xff0000)],
        ephemeral: true,
      })
    }
    return interaction.reply({
      embeds: [new EmbedBuilder().setTitle('❌ Error').setDescription('Ocurrió un error al pausar la música.').setColor(0xff0000)],
      ephemeral: true,
    })
  }
}
