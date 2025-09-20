import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder().setName('musictest').setDescription('Prueba básica de conexión a canal de voz')

export async function execute(interaction) {
  const member = interaction.member
  const voiceChannel = member?.voice?.channel

  if (!voiceChannel) {
    return await interaction.reply({
      content: '❌ Debes estar en un canal de voz para usar este comando.',
      ephemeral: true,
    })
  }

  const permissions = voiceChannel.permissionsFor(interaction.client.user)
  if (!permissions.has(['Connect', 'Speak'])) {
    return await interaction.reply({
      content: '❌ No tengo permisos para conectarme o hablar en ese canal de voz.',
      ephemeral: true,
    })
  }

  try {
    const embed = new EmbedBuilder()
      .setTitle('✅ Conexión de voz disponible')
      .setDescription(`Puedo conectarme al canal: **${voiceChannel.name}**`)
      .setColor(0x00ff00)
      .addFields(
        { name: '🔊 Canal', value: voiceChannel.name, inline: true },
        { name: '👥 Usuarios', value: `${voiceChannel.members.size}`, inline: true },
        { name: '📊 Estado', value: 'Listo para música', inline: true }
      )
      .setFooter({ text: 'Sistema de música funcional' })

    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    console.error('Error en musictest:', error)
    await interaction.reply('❌ Error verificando conexión de voz.')
  }
}
