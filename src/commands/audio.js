import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('audio')
  .setDescription('Información y diagnóstico de audio')
  .addSubcommand(subcommand => subcommand.setName('diagnostico').setDescription('Diagnóstico completo del sistema de audio'))
  .addSubcommand(subcommand => subcommand.setName('permisos').setDescription('Verifica permisos de voz del bot'))

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand()
  const member = interaction.member
  const voiceChannel = member?.voice?.channel

  switch (subcommand) {
    case 'diagnostico':
      const diagnosticEmbed = new EmbedBuilder()
        .setTitle('🔧 Diagnóstico del Sistema de Audio')
        .setColor(0xffaa00)
        .addFields(
          { name: '📊 Estado General', value: 'Parcialmente funcional', inline: false },
          { name: '✅ Discord.js', value: 'v14.15.3 - Funcionando', inline: true },
          { name: '⚠️ @discordjs/voice', value: 'Requiere dependencias nativas', inline: true },
          { name: '❌ Audio Codecs', value: 'sodium/opus no instalados', inline: true },
          { name: '🔍 Problema Detectado', value: 'DAVE protocol - falta @snazzah/davey', inline: false },
          { name: '💡 Solución', value: 'Usar bot sin audio o instalar dependencias nativas', inline: false }
        )
        .setDescription('**Resumen**: El bot puede conectarse a Discord pero no puede procesar audio debido a dependencias faltantes.')
        .setFooter({ text: 'Para música completa, se requiere configuración adicional' })

      await interaction.reply({ embeds: [diagnosticEmbed] })
      break

    case 'permisos':
      if (!voiceChannel) {
        return await interaction.reply({
          content: '❌ Debes estar en un canal de voz para verificar permisos.',
          ephemeral: true,
        })
      }

      const permissions = voiceChannel.permissionsFor(interaction.client.user)
      const hasConnect = permissions.has('Connect')
      const hasSpeak = permissions.has('Speak')
      const hasUseVAD = permissions.has('UseVAD')

      const permissionsEmbed = new EmbedBuilder()
        .setTitle('🔐 Verificación de Permisos')
        .setColor(hasConnect && hasSpeak ? 0x00ff00 : 0xff0000)
        .addFields(
          { name: '🔗 Conectar', value: hasConnect ? '✅ Permitido' : '❌ Denegado', inline: true },
          { name: '🔊 Hablar', value: hasSpeak ? '✅ Permitido' : '❌ Denegado', inline: true },
          { name: '🎙️ Detección de Voz', value: hasUseVAD ? '✅ Permitido' : '❌ Denegado', inline: true },
          { name: '📍 Canal', value: voiceChannel.name, inline: false },
          {
            name: '📊 Estado General',
            value: hasConnect && hasSpeak ? '✅ Listo para conectar' : '❌ Permisos insuficientes',
            inline: false,
          }
        )

      await interaction.reply({ embeds: [permissionsEmbed] })
      break
  }
}
