import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder().setName('ping').setDescription('Responde con Pong!')

export async function execute(interaction) {
  const start = Date.now()

  // Respuesta inicial
  await interaction.reply('🏓 Calculando latencia...')

  const latency = Date.now() - start
  const apiLatency = Math.round(interaction.client.ws.ping)

  // Determinar color basado en latencia
  let color = 0x00ff00 // Verde
  if (latency > 200 || apiLatency > 200) color = 0xffff00 // Amarillo
  if (latency > 500 || apiLatency > 500) color = 0xff0000 // Rojo   

  const embed = new EmbedBuilder()
    .setTitle('🏓 Pong!')
    .setColor(color)
    .addFields(
      { name: '⚡ Latencia del Bot', value: `${latency}ms`, inline: true },
      { name: '🌐 Latencia de API', value: `${apiLatency}ms`, inline: true },
      { name: '📊 Estado', value: latency < 200 ? '🟢 Excelente' : latency < 500 ? '🟡 Bueno' : '🔴 Lento', inline: true }
    )
    .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    .setTimestamp()

  await interaction.editReply({ content: null, embeds: [embed] })
}
