// src/index.js
import 'dotenv/config'
import { Client, GatewayIntentBits, Partials, Events, REST, Routes, MessageFlags, ActivityType } from 'discord.js'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
import { loadCommands, getCommandsArray } from './commandLoader.js'
import { loadEvents } from './eventLoader.js'

// Exponer FFmpeg a quien lo lea desde env (p. ej., DisTube en tus comandos)
process.env.FFMPEG_PATH = ffmpeg.path

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID

if (!token) {
  console.error('Falta DISCORD_TOKEN en .env')
  process.exit(1)
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // música
    GatewayIntentBits.GuildMembers, // eventos de bienvenida, etc.
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.User],
})

// Carga comandos
const commands = await loadCommands()
const commandsArray = getCommandsArray(commands)

// Carga eventos (todos los .js dentro de ./events)
await loadEvents(client)

async function registerCommands(guildId) {
  const rest = new REST({ version: '10' }).setToken(token)
  try {
    if (guildId && clientId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsArray })
      console.log(`Comandos registrados en el servidor ${guildId}`)
    } else if (clientId) {
      await rest.put(Routes.applicationCommands(clientId), { body: commandsArray })
      console.log('Comandos globales registrados (pueden tardar hasta 1h en propagar).')
    } else {
      console.log('Saltando registro global: falta DISCORD_CLIENT_ID.')
    }
  } catch (err) {
    console.error('Error registrando comandos:', err)
  }
}

client.once(Events.ClientReady, async c => {
  console.log(`Listo como ${c.user.tag}`)
  console.log(`Comandos cargados: ${commands.size}`)

  c.user.setActivity('Roblox', {
    type: ActivityType.Playing,
  })

  if (clientId) await registerCommands().catch(() => {})
})

// Slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return
  const command = commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(`Error ejecutando ${interaction.commandName}:`, error)
    const payload = { content: '¡Hubo un error al ejecutar este comando!', flags: MessageFlags.Ephemeral }
    if (interaction.replied || interaction.deferred) await interaction.followUp(payload)
    else await interaction.reply(payload)
  }
})

// (Opcional) Logs de errores globales — útil en dev
process.on('unhandledRejection', reason => {
  console.error('[unhandledRejection]', reason)
})
process.on('uncaughtException', err => {
  console.error('[uncaughtException]', err)
})

client.login(token)
