import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('voice')
  .setDescription('Información sobre canales de voz')
  .addSubcommand(subcommand => subcommand.setName('info').setDescription('Información sobre tu canal de voz actual'))
  .addSubcommand(subcommand => subcommand.setName('usuarios').setDescription('Lista usuarios en tu canal de voz'))

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand()
  const member = interaction.member
  const voiceChannel = member?.voice?.channel

  if (!voiceChannel) {
    return await interaction.reply({
      content: '❌ No estás en un canal de voz.',
      ephemeral: true,
    })
  }

  switch (subcommand) {
    case 'info':
      const infoEmbed = new EmbedBuilder()
        .setTitle('🎵 Información del Canal de Voz')
        .setColor(0x00ff00)
        .setThumbnail(interaction.guild.iconURL())
        .addFields(
          { name: '🏷️ Nombre', value: voiceChannel.name, inline: true },
          { name: '👥 Usuarios', value: `${voiceChannel.members.size}`, inline: true },
          { name: '🔊 Tipo', value: 'Canal de Voz', inline: true },
          { name: '🆔 ID', value: voiceChannel.id, inline: false },
          { name: '🎚️ Límite de usuarios', value: voiceChannel.userLimit || 'Sin límite', inline: true },
          { name: '🔒 Región', value: voiceChannel.rtcRegion || 'Automática', inline: true }
        )

      await interaction.reply({ embeds: [infoEmbed] })
      break

    case 'usuarios':
      const users = voiceChannel.members.map(
        member => `${member.user.username}${member.voice.mute ? ' 🔇' : ''}${member.voice.deaf ? ' 🔈' : ''}`
      )

      const usersEmbed = new EmbedBuilder()
        .setTitle(`👥 Usuarios en ${voiceChannel.name}`)
        .setColor(0x00ae86)
        .addFields(
          { name: '📊 Total', value: `${voiceChannel.members.size} usuarios`, inline: true },
          { name: '👤 Lista', value: users.length > 0 ? users.join('\n') : 'Sin usuarios', inline: false }
        )
        .setFooter({ text: '🔇 = Silenciado | 🔈 = Ensordecido' })

      await interaction.reply({ embeds: [usersEmbed] })
      break
  }
}
