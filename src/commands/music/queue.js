// src/commands/queue.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getDistube } from './play.js' // reutiliza la MISMA instancia de DisTube

// Helper para formatear segundos a mm:ss / hh:mm:ss
function formatSeconds(totalSeconds = 0) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Muestra la cola de música actual')
  .addIntegerOption(opt => opt.setName('pagina').setDescription('Número de página (10 canciones por página)').setMinValue(1))

export async function execute(interaction) {
  const dt = getDistube(interaction.client)
  const queue = dt.getQueue(interaction.guildId)

  if (!queue || !queue.songs?.length) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setTitle('📝 Cola vacía').setDescription('No hay canciones en la cola.').setColor(0xffa500)],
      ephemeral: true,
    })
  }

  // Paginación
  const PER_PAGE = 10
  const total = queue.songs.length
  const totalPages = Math.max(1, Math.ceil((total - 1) / PER_PAGE)) // -1 porque la primera es "Now Playing"
  const pageArg = interaction.options.getInteger('pagina') ?? 1
  const page = Math.min(Math.max(1, pageArg), totalPages)

  // Canción actual
  const now = queue.songs[0]
  const nowLine =
    `**${now?.name ?? 'Desconocido'}**\n` +
    `${now?.formattedDuration ?? (now?.duration ? formatSeconds(now.duration) : '—')} • ` +
    `Solicitado por: ${now?.user?.tag ?? '—'}\n` +
    (now?.url ? `[Enlace](${now.url})` : '')

  // Próximas canciones (paginadas)
  const start = 1 + (page - 1) * PER_PAGE
  const end = Math.min(total - 1, start + PER_PAGE - 1)
  const upcoming = queue.songs.slice(start, end + 1)

  const lines = upcoming.map((s, i) => {
    const idx = start + i
    const dur = s?.formattedDuration ?? (s?.duration ? formatSeconds(s.duration) : '—')
    const by = s?.user?.tag ?? '—'
    const title = s?.name ?? 'Desconocido'
    const url = s?.url
    return `**${idx}.** ${url ? `[${title}](${url})` : `**${title}**`} — ${dur} • ${by}`
  })

  // Duración total de la cola (siempre que haya duration en los objetos)
  const totalSeconds = queue.songs.reduce((acc, s) => acc + (Number.isFinite(s?.duration) ? s.duration : 0), 0)
  const totalDurStr = totalSeconds > 0 ? formatSeconds(totalSeconds) : '—'

  // Estado de repetición
  // 0: off, 1: repeat song, 2: repeat queue (según DisTube)
  let repeat = 'off'
  if (queue.repeatMode === 1) repeat = 'canción'
  else if (queue.repeatMode === 2) repeat = 'cola'

  const embed = new EmbedBuilder()
    .setTitle('📝 Cola de reproducción')
    .setColor(0x00ae86)
    .addFields(
      { name: '🎵 Sonando ahora', value: nowLine || '—' },
      { name: `📜 Próximas (${start}-${end} de ${total - 1})`, value: lines.length ? lines.join('\n') : '—' }
    )
    .setFooter({ text: `Página ${page}/${totalPages} • Repetición: ${repeat} • Total: ${totalDurStr}` })

  // Info de estado (pausado / reproduciendo)
  if (queue.paused) {
    embed.setDescription('⏸️ **Pausado**')
  } else {
    embed.setDescription('▶️ **Reproduciendo**')
  }

  return interaction.reply({ embeds: [embed] })
}
