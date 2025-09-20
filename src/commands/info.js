import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Información sobre el servidor o usuario')
  .addSubcommand(subcommand => subcommand.setName('servidor').setDescription('Información del servidor'))
  .addSubcommand(subcommand =>
    subcommand
      .setName('usuario')
      .setDescription('Información de un usuario')
      .addUserOption(option => option.setName('target').setDescription('Usuario a consultar').setRequired(false))
  )

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand()

  if (subcommand === 'servidor') {
    const guild = interaction.guild

    // Obtener información adicional del servidor
    const owner = await guild.fetchOwner()
    const createdDate = guild.createdAt
    const boostLevel = guild.premiumTier
    const boostCount = guild.premiumSubscriptionCount

    const embed = new EmbedBuilder()
      .setTitle(`📊 Información del Servidor`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .setColor(0x00ae86)
      .addFields(
        { name: '🏷️ Nombre', value: guild.name, inline: true },
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Propietario', value: owner.user.tag, inline: true },
        { name: '👥 Miembros', value: guild.memberCount.toString(), inline: true },
        { name: '📅 Creado', value: `<t:${Math.floor(createdDate.getTime() / 1000)}:F>`, inline: true },
        { name: '🚀 Nivel Boost', value: boostLevel > 0 ? `Nivel ${boostLevel} (${boostCount} boosts)` : 'Sin boosts', inline: true }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  } else if (subcommand === 'usuario') {
    const user = interaction.options.getUser('target') || interaction.user
    const member = interaction.guild.members.cache.get(user.id)

    // Determinar status y color
    const presence = member?.presence
    const statusColors = {
      online: 0x43b581,
      idle: 0xfaa61a,
      dnd: 0xf04747,
      offline: 0x747f8d,
    }
    const statusEmojis = {
      online: '🟢',
      idle: '🟡',
      dnd: '🔴',
      offline: '⚫',
    }

    const status = presence?.status || 'offline'
    const activity = presence?.activities?.find(act => act.type !== 4) // Excluir custom status

    const embed = new EmbedBuilder()
      .setTitle(`👤 Información del Usuario`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setColor(statusColors[status] || 0x99aab5)
      .addFields(
        { name: '🏷️ Usuario', value: user.tag, inline: true },
        { name: '🆔 ID', value: user.id, inline: true },
        { name: `${statusEmojis[status]} Estado`, value: status.charAt(0).toUpperCase() + status.slice(1), inline: true }
      )

    // Agregar información del miembro si está en el servidor
    if (member) {
      embed.addFields(
        { name: '📝 Apodo', value: member.displayName !== user.username ? member.displayName : 'Sin apodo', inline: true },
        { name: '📅 Se unió', value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`, inline: true },
        { name: '🎭 Roles', value: member.roles.cache.size > 1 ? `${member.roles.cache.size - 1} roles` : 'Sin roles', inline: true }
      )

      // Mostrar rol más alto (con color)
      const highestRole = member.roles.highest
      if (highestRole.name !== '@everyone') {
        embed.addFields({ name: '⭐ Rol más alto', value: highestRole.name, inline: true })
        if (highestRole.color !== 0) {
          embed.setColor(highestRole.color)
        }
      }
    }

    // Agregar actividad si existe
    if (activity) {
      let activityText = activity.name
      if (activity.details) activityText += `\n${activity.details}`
      if (activity.state) activityText += `\n${activity.state}`
      embed.addFields({ name: '🎮 Actividad', value: activityText, inline: false })
    }

    embed.addFields({ name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`, inline: false })
    embed.setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    embed.setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }
}
