import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('El bot repite tu mensaje')
  .addStringOption(option => option.setName('texto').setDescription('Texto a repetir').setRequired(true))

export async function execute(interaction) {
  const texto = interaction.options.getString('texto', true)
  await interaction.reply(texto)
}
