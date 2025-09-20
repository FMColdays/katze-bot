// src/events/welcome.js
import { Events, EmbedBuilder, PermissionFlagsBits } from 'discord.js'

export const name = Events.GuildMemberAdd
export const once = false

export async function execute(member, client) {
  try {
    const channelId = process.env.WELCOME_CHANNEL_ID
    if (!channelId) return

    const channel = member.guild.channels.cache.get(channelId) || (await member.guild.channels.fetch(channelId).catch(() => null))
    if (!channel) return

    const me = member.guild.members.me || (await member.guild.members.fetch(client.user.id).catch(() => null))
    if (!me) return

    const canSend = channel?.permissionsFor(me)?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
    if (!canSend) return

    const embed = new EmbedBuilder()
      .setTitle('👋 ¡Bienvenid@!')
      .setDescription(`Hola ${member}, ¡nos alegra tenerte en **${member.guild.name}**!\n` + `Revisa las reglas y pasa a presentarte. 🎉`)
      .setColor(0x00ae86)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `Miembro #${member.guild.memberCount}` })

    await channel.send({ embeds: [embed] })
  } catch (err) {
    console.error('Error enviando bienvenida:', err)
  }
}
