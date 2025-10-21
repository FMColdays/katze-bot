// src/events/welcome.js
import { Events, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } from 'discord.js'
import { createCanvas, loadImage } from 'canvas'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const name = Events.GuildMemberAdd
export const once = false

// Configuración por defecto
const defaultConfig = {
  backgroundImage: null,
  welcomeMessage: '¡BIENVENID@ A {server}!',
  embedDescription:
    'Bienvenido/a {user} al servidor oficial de {server}. Recuerda leer las reglas antes de empezar, es muy importante. ¡Pásalo muy bien! 🎊',
}

// Cargar configuración
async function loadConfig(guildId) {
  try {
    const configPath = join(dirname(__dirname), 'data', 'welcome', `${guildId}.json`)
    const data = await fs.readFile(configPath, 'utf8')
    const config = { ...defaultConfig, ...JSON.parse(data) }
    console.log(`📁 Configuración cargada para servidor ${guildId}`)
    return config
  } catch (error) {
    console.log(`📁 Usando configuración por defecto para servidor ${guildId} (${error.code})`)
    return defaultConfig
  }
}

// Función para crear imagen de bienvenida
async function createWelcomeImage(member, config) {
  try {
    const canvas = createCanvas(800, 400)
    const ctx = canvas.getContext('2d')

    // Fondo - imagen personalizada o color por defecto
    if (config.backgroundImage) {
      try {
        const bgImg = await loadImage(config.backgroundImage)
        ctx.drawImage(bgImg, 0, 0, 800, 400)

        // Agregar overlay oscuro para mejor legibilidad del texto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fillRect(0, 0, 800, 400)
      } catch {
        // Si falla la imagen, usar fondo por defecto
        const gradient = ctx.createLinearGradient(0, 0, 800, 400)
        gradient.addColorStop(0, '#1a1a2e')
        gradient.addColorStop(1, '#3282b8')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 800, 400)
      }
    } else {
      // Fondo degradado por defecto
      const gradient = ctx.createLinearGradient(0, 0, 800, 400)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#3282b8')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 800, 400)
    }

    // Cargar avatar del usuario
    let avatarImg
    try {
      avatarImg = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
    } catch {
      avatarImg = await loadImage('https://cdn.discordapp.com/embed/avatars/0.png')
    }

    // Avatar en el centro
    const avatarX = 400
    const avatarY = 150
    const avatarRadius = 100

    // Borde blanco del avatar
    ctx.save()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(avatarX, avatarY, avatarRadius + 4, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // Dibujar avatar circular
    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2)
    ctx.restore()

    // Nombre del usuario debajo del avatar
    ctx.fillStyle = '#ffffff'
    //uan fuente bonita
    ctx.font = '36px "Comic Sans MS", cursive, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(member.user.username, avatarX, avatarY + avatarRadius + 50)

    // Mensaje de bienvenida personalizado
    ctx.fillStyle = '#ffffff'
    ctx.font = '28px "Comic Sans MS", cursive, sans-serif'
    ctx.textAlign = 'center'
    const message = config.welcomeMessage
      .replace('{user}', member.user.username)
      .replace('{server}', member.guild.name)
      .replace('{count}', member.guild.memberCount.toString())

    ctx.fillText(message, avatarX, avatarY + avatarRadius + 90)

    return canvas.toBuffer()
  } catch (error) {
    console.error('Error creando imagen simple:', error)
    return null
  }
}

export async function execute(member, client) {
  try {
    const channelId = process.env.WELCOME_CHANNEL_ID
    if (!channelId) {
      console.log('⚠️ WELCOME_CHANNEL_ID no configurado - evento de bienvenida deshabilitado')
      return
    }

    const channel = member.guild.channels.cache.get(channelId) || (await member.guild.channels.fetch(channelId).catch(() => null))
    if (!channel) {
      console.log(`⚠️ Canal de bienvenida no encontrado: ${channelId}`)
      return
    }

    const me = member.guild.members.me || (await member.guild.members.fetch(client.user.id).catch(() => null))
    if (!me) return

    const canSend = channel
      ?.permissionsFor(me)
      ?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles])
    if (!canSend) return

    // Cargar configuración del servidor
    const config = await loadConfig(member.guild.id)
    console.log(`✅ Nuevo miembro: ${member.user.tag} en ${member.guild.name}`)

    // Generar imagen de bienvenida
    const welcomeImageBuffer = await createWelcomeImage(member, config)

    if (welcomeImageBuffer) {
      // Crear attachment de la imagen
      const attachment = new AttachmentBuilder(welcomeImageBuffer, { name: 'welcome.png' })

      // Crear el mensaje personalizado (reemplaza variables)
      const welcomeText = config.embedDescription
        .replace('{user}', `${member}`)
        .replace('{server}', member.guild.name)
        .replace('{count}', member.guild.memberCount.toString())

      // Enviar solo el mensaje de texto y la imagen (sin embed)
      await channel.send({
        content: welcomeText,
        files: [attachment],
      })
      console.log(`✅ Mensaje de bienvenida enviado a ${member.user.tag}`)
    } else {
      // Fallback si falla la generación de imagen
      const welcomeText = config.embedDescription
        .replace('{user}', `${member}`)
        .replace('{server}', member.guild.name)
        .replace('{count}', member.guild.memberCount.toString())

      await channel.send({ content: welcomeText })
    }
  } catch (err) {
    console.error('Error enviando bienvenida:', err)
  }
}
