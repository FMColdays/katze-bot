import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('reload')
  .setDescription('Recarga todos los comandos del bot (solo admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const commandCount = interaction.client.application.commands.cache.size

    await interaction.editReply(
      `🔄 Comandos verificados: ${commandCount}\n` + `Para una recarga completa, reinicia el bot con \`npm run dev\``
    )
  } catch (error) {
    console.error('Error en reload:', error)
    await interaction.editReply('❌ Error al recargar comandos.')
  }
}
