// src/commands/music/play.js
import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from 'discord.js'
import { DisTube } from 'distube'
import { YouTubePlugin } from '@distube/youtube'
import { YtDlpPlugin } from '@distube/yt-dlp'
import ytdl from '@distube/ytdl-core' // ← para createAgent(cookies)
import ffmpeg from '@ffmpeg-installer/ffmpeg'
import fs from 'node:fs'
import path from 'node:path'

// ── Config ────────────────────────────────────────────────────────────────────
const SHOW_TEMP_MESSAGES = true
const TEMP_MESSAGE_MS = 5_000
const QUEUE_LINES = 8

// ── Carga de cookies (ENV o archivo cookies.json) ─────────────────────────────
function loadYoutubeCookies() {
  // 1) ENV: pega el JSON exportado (minificado) en YOUTUBE_COOKIES_JSON
  const raw = process.env.YOUTUBE_COOKIES_JSON
  if (raw) {
    try {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return arr
      console.warn('[YouTubeCookies] YOUTUBE_COOKIES_JSON no es un array JSON válido')
    } catch (e) {
      console.error('[YouTubeCookies] Error parseando YOUTUBE_COOKIES_JSON:', e)
    }
  }
  // 2) Archivo local opcional: ./cookies.json (mismo formato de Cookie-Editor)
  try {
    const p = path.join(process.cwd(), 'cookies.json')
    if (fs.existsSync(p)) {
      const arr = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (Array.isArray(arr)) return arr
    }
  } catch (e) {
    console.error('[YouTubeCookies] Error leyendo cookies.json:', e)
  }
  return undefined
}
const YT_COOKIES = loadYoutubeCookies()

// ── Utils ─────────────────────────────────────────────────────────────────────
function isValidUrl(str) {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}
function sanitizeYouTubeUrl(input) {
  let url
  try {
    url = new URL(input)
  } catch {
    return input
  }
  const host = url.hostname.toLowerCase()
  const isYouTube = host.includes('youtube.com') || host.includes('youtu.be') || host.includes('music.youtube.com')
  if (!isYouTube) return input
  if (host.includes('youtu.be')) {
    const id = url.pathname.replace('/', '').trim()
    return id ? `https://www.youtube.com/watch?v=${id}` : input
  }
  if (url.pathname.startsWith('/shorts/')) {
    const id = url.pathname.split('/')[2]
    return id ? `https://www.youtube.com/watch?v=${id}` : input
  }
  if (url.pathname === '/watch') {
    const id = url.searchParams.get('v')
    if (!id) return input
    return `https://www.youtube.com/watch?v=${id}`
  }
  const id = url.searchParams.get('v')
  return id ? `https://www.youtube.com/watch?v=${id}` : input
}
function toPlayQuery(input) {
  if (isValidUrl(input)) return sanitizeYouTubeUrl(input)
  // Con YouTubePlugin cargado, DisTube entiende "ytsearch:<texto>"
  return `ytsearch:${input}`
}
function formatSeconds(totalSeconds = 0) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
function safeChannelLabel(voiceChannel, member) {
  const canSee = voiceChannel?.permissionsFor(member)?.has(PermissionFlagsBits.ViewChannel)
  return canSee ? `**${voiceChannel.name}**` : '**otro canal de voz**'
}

// ── Instancia única de DisTube con cookies/agent ──────────────────────────────
let distube = null
export function getDistube(client) {
  if (!distube) {
    // ytdl-core → crea un "agent" con cookies (recomendado por la lib)
    // https://github.com/distubejs/ytdl-core#cookies-support
    const agent = YT_COOKIES ? ytdl.createAgent(YT_COOKIES) : undefined

    // @distube/youtube soporta cookies y ytdlOptions (agent)
    // https://www.npmjs.com/package/@distube/youtube#readme
    const youtubePlugin = new YouTubePlugin({
      cookies: YT_COOKIES, // opcional pero MUY recomendado en Render/VPS
      ytdlOptions: agent ? { agent } : undefined,
      // hl: 'es', gl: 'MX', // si quieres fijar idioma/región
    })

    // Mantén yt-dlp al final del array de plugins
    const ytdlpPlugin = new YtDlpPlugin({ update: false })

    distube = new DisTube(client, {
      emitNewSongOnly: true,
      savePreviousSongs: true,
      ffmpeg: { path: ffmpeg.path },
      plugins: [youtubePlugin, ytdlpPlugin],
    })
    distube.setMaxListeners(20)

    // Eventos: refrescan panel/cola sin spamear
    distube.on('playSong', queue => refreshPanel(queue))
    distube.on('addSong', async (queue, song) => {
      if (SHOW_TEMP_MESSAGES) {
        try {
          const emb = new EmbedBuilder()
            .setTitle('📝 Agregado a la cola')
            .setDescription(`**${song?.name ?? 'Desconocido'}**`)
            .addFields(
              { name: '📍 Posición', value: String(queue.songs.length), inline: true },
              { name: '⏱️ Duración', value: song?.formattedDuration || '—', inline: true }
            )
            .setColor(0x00ae86)
          const m = await queue.textChannel?.send({ embeds: [emb] })
          if (m) setTimeout(() => m.delete().catch(() => {}), TEMP_MESSAGE_MS)
        } catch {}
      }
      refreshPanel(queue)
    })
    for (const ev of ['finish', 'empty', 'stop']) {
      distube.on(ev, q => {
        try {
          q?.voice?.leave()
        } catch {}
      })
    }
    distube.on('error', (err, q) => {
      console.error('[DisTube ERROR]:', err)
      q?.textChannel?.send('❌ Ocurrió un error reproduciendo música.').catch(() => {})
    })
  }
  return distube
}

// ── Panel único por guild (botones) ───────────────────────────────────────────
const panels = new Map()
function controlsRow(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_pause').setStyle(ButtonStyle.Secondary).setEmoji('⏸️').setLabel('Pause').setDisabled(disabled),
    new ButtonBuilder().setCustomId('music_resume').setStyle(ButtonStyle.Secondary).setEmoji('▶️').setLabel('Resume').setDisabled(disabled),
    new ButtonBuilder().setCustomId('music_skip').setStyle(ButtonStyle.Primary).setEmoji('⏭️').setLabel('Skip').setDisabled(disabled),
    new ButtonBuilder().setCustomId('music_stop').setStyle(ButtonStyle.Danger).setEmoji('⏹️').setLabel('Stop').setDisabled(disabled)
  )
}
async function ensurePanel(queue) {
  const guildId = queue.voiceChannel.guild.id
  const existing = panels.get(guildId)
  if (existing?.message?.channel?.id === queue.textChannel?.id) return existing
  if (existing) {
    try {
      existing.collector?.stop('replaced')
    } catch {}
    try {
      await existing.message?.delete()
    } catch {}
    panels.delete(guildId)
  }
  const msg = await queue.textChannel.send({
    embeds: [new EmbedBuilder().setDescription('Preparando panel…')],
    components: [controlsRow()],
  })
  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 10 * 60 * 1000,
  })
  collector.on('collect', i => handleButton(i))
  collector.on('end', async () => {
    try {
      await msg.edit({ components: [controlsRow(true)] })
    } catch {}
  })
  const entry = { message: msg, collector }
  panels.set(guildId, entry)
  return entry
}
function buildPanelEmbed(queue) {
  const now = queue.songs?.[0]
  const next = queue.songs?.slice(1, 1 + QUEUE_LINES) ?? []
  const nowFields = [
    { name: '👤 Canal', value: now?.uploader?.name || 'Desconocido', inline: true },
    { name: '⏱️ Duración', value: now?.formattedDuration || (now?.duration ? formatSeconds(now.duration) : '—'), inline: true },
    { name: '🧑 Solicitado por', value: now?.user?.tag || '—', inline: true },
  ]
  const nextLines = next.map((s, i) => {
    const n = i + 1
    const title = s?.name ?? 'Desconocido'
    const url = s?.url
    const dur = s?.formattedDuration || (s?.duration ? formatSeconds(s.duration) : '—')
    const by = s?.user?.tag ?? '—'
    return `**${n}.** ${url ? `[${title}](${url})` : title} — ${dur} • ${by}`
  })
  const totalSeconds = queue.songs.reduce((acc, s) => acc + (Number.isFinite(s?.duration) ? s.duration : 0), 0)
  const totalStr = totalSeconds ? formatSeconds(totalSeconds) : '—'
  let repeat = 'off'
  if (queue.repeatMode === 1) repeat = 'canción'
  else if (queue.repeatMode === 2) repeat = 'cola'
  const emb = new EmbedBuilder()
    .setTitle(queue.paused ? '⏸️ Pausado' : '🎵 Reproduciendo ahora')
    .setDescription(now?.name ? `**${now.name}**` : '—')
    .addFields(...nowFields)
    .setColor(queue.paused ? 0xffcc00 : 0x00ae86)
    .setFooter({ text: `Repetición: ${repeat} • Total: ${totalStr}` })
  if (now?.thumbnail) emb.setThumbnail(now.thumbnail)
  emb.addFields({
    name: `📜 Cola (${queue.songs.length - 1})`,
    value: nextLines.length ? nextLines.join('\n') : '—',
  })
  return emb
}
async function refreshPanel(queue) {
  try {
    const entry = await ensurePanel(queue)
    const embed = buildPanelEmbed(queue)
    await entry.message.edit({ embeds: [embed], components: [controlsRow()] })
  } catch (e) {
    console.error('refreshPanel error:', e)
  }
}
async function handleButton(i) {
  try {
    const dt = getDistube(i.client)
    const queue = dt.getQueue(i.guildId)
    if (!queue) return i.reply({ content: 'No hay cola activa.', flags: MessageFlags.Ephemeral })
    const inSameVc = queue.voiceChannel && i.member?.voice?.channel?.id === queue.voiceChannel.id
    if (!inSameVc) {
      return i.reply({
        content: `Debes estar en ${safeChannelLabel(queue.voiceChannel, i.member)} para usar estos controles.`,
        flags: MessageFlags.Ephemeral,
      })
    }
    switch (i.customId) {
      case 'music_pause':
        if (queue.paused) return i.reply({ content: 'La música ya está pausada.', flags: MessageFlags.Ephemeral })
        await dt.pause(i.guildId)
        await i.deferUpdate()
        if (dt.getQueue(i.guildId)) refreshPanel(dt.getQueue(i.guildId))
        return
      case 'music_resume':
        if (!queue.paused) return i.reply({ content: 'La música no está pausada.', flags: MessageFlags.Ephemeral })
        await dt.resume(i.guildId)
        await i.deferUpdate()
        if (dt.getQueue(i.guildId)) refreshPanel(dt.getQueue(i.guildId))
        return
      case 'music_skip':
        if (queue.songs.length <= 1) return i.reply({ content: 'No hay otra canción para saltar.', flags: MessageFlags.Ephemeral })
        await dt.skip(i.guildId)
        await i.deferUpdate()
        if (dt.getQueue(i.guildId)) refreshPanel(dt.getQueue(i.guildId))
        return
      case 'music_stop':
        await dt.stop(i.guildId)
        await i.deferUpdate()
        try {
          const p = panels.get(i.guildId)
          p?.collector?.stop('stopped')
          await p?.message?.delete()
        } catch {}
        panels.delete(i.guildId)
        return
    }
  } catch (err) {
    console.error('Error en botón de música:', err)
    if (!i.replied && !i.deferred) await i.reply({ content: '❌ Error al ejecutar la acción.', flags: MessageFlags.Ephemeral })
  }
}

// ── /play ─────────────────────────────────────────────────────────────────────
export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Reproduce música de YouTube (con panel de control)')
  .addStringOption(opt => opt.setName('cancion').setDescription('URL de YouTube o término de búsqueda').setRequired(true))

export async function execute(interaction) {
  // En hosting (Render) defiere de INMEDIATO o da "Unknown interaction"
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const raw = interaction.options.getString('cancion')
  const voiceChannel = interaction.member?.voice?.channel

  if (!voiceChannel) {
    return interaction.editReply({ content: '❌ Debes estar en un canal de voz para usar este comando.' })
  }
  const mePerms = voiceChannel.permissionsFor(interaction.client.user)
  if (!mePerms?.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])) {
    return interaction.editReply({ content: '❌ No tengo permisos para conectarme o hablar en ese canal de voz.' })
  }

  try {
    const dt = getDistube(interaction.client)

    // Bloquea si ya suena en OTRO canal
    const activeQueue = dt.getQueue(interaction.guildId)
    if (activeQueue?.voiceChannel && activeQueue.voiceChannel.id !== voiceChannel.id) {
      const label = safeChannelLabel(activeQueue.voiceChannel, interaction.member)
      await interaction.editReply({ content: `❌ Ya estoy reproduciendo en ${label}. Únete a ese canal.` })
      return
    }

    const query = toPlayQuery(raw)

    // Watchdog solo si es primer start
    const wasPlaying = !!activeQueue?.playing
    let watchdog, onPlayForThisGuild
    if (!wasPlaying) {
      const guildId = interaction.guildId
      let resolved = false
      onPlayForThisGuild = q => {
        if (q?.voiceChannel?.guild?.id === guildId) {
          resolved = true
          clearTimeout(watchdog)
          distube.off('playSong', onPlayForThisGuild)
        }
      }
      distube.once('playSong', onPlayForThisGuild)
      watchdog = setTimeout(async () => {
        try {
          const q = dt.getQueue(guildId)
          if (!resolved && q) await q.stop()
        } catch {}
        distube.off('playSong', onPlayForThisGuild)
        try {
          await interaction.editReply({ content: '❌ No pude resolver el audio. Prueba otra búsqueda o pega una URL.' })
        } catch {}
      }, 12_000)
    }

    await dt.play(voiceChannel, query, { textChannel: interaction.channel, member: interaction.member })
    await interaction.editReply({ content: wasPlaying ? '📝 Añadido a la cola.' : '🎵 Reproducción iniciada.' })

    const q = dt.getQueue(interaction.guildId)
    if (q) refreshPanel(q)
  } catch (error) {
    console.error('Error en comando play:', error)
    await interaction.editReply({ content: '❌ No encontré resultados para esa búsqueda. Prueba otro texto o pega una URL.' })
  }
}
