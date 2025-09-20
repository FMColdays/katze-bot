// src/commands/skip.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getDistube } from './play.js'

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Salta a la siguiente canción')
  .addIntegerOption(opt =>
    opt.setName('cantidad').setDescription('Cuántas canciones saltar (por defecto 1)').setMinValue(1).setMaxValue(10)
  )

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

    if (!queue || !queue.songs?.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setTitle('❌ No hay música').setDescription('No hay música reproduciéndose actualmente.').setColor(0xff0000),
        ],
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

    const count = interaction.options.getInteger('cantidad') ?? 1
    if (queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle('ℹ️ No hay siguiente').setDescription('No hay más canciones para saltar.').setColor(0xffa500)],
        ephemeral: true,
      })
    }

    let skipped = 0
    for (let i = 0; i < count; i++) {
      try {
        await dt.skip(interaction.guildId) // salta a la siguiente
        skipped++
        if (!dt.getQueue(interaction.guildId)?.songs?.[1]) break // no hay más para seguir saltando
      } catch {
        break
      }
    }

    const qNow = dt.getQueue(interaction.guildId)
    const current = qNow?.songs?.[0]

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('⏭️ Canción saltada')
          .setDescription(`Se saltó ${skipped} canción${skipped === 1 ? '' : 'es'}.`)
          .addFields(
            { name: '🎵 Ahora suena', value: current?.name ? `[${current.name}](${current.url ?? ''})` : '—' },
            { name: '👤 Solicitado por', value: interaction.user.tag, inline: true }
          )
          .setColor(0x00ae86),
      ],
    })
  } catch (err) {
    console.error('Error en comando skip:', err)
    const embed = new EmbedBuilder().setTitle('❌ Error').setDescription('Ocurrió un error al saltar la canción.').setColor(0xff0000)
    if (interaction.deferred || interaction.replied) return interaction.followUp({ embeds: [embed], ephemeral: true })
    return interaction.reply({ embeds: [embed], ephemeral: true })
  }
}
