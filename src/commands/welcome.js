// src/commands/welcome-simple.js
import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, PermissionFlagsBits } from 'discord.js'
import { createCanvas, loadImage } from 'canvas'
import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuración por defecto
const defaultConfig = {
  backgroundImage: null,
  welcomeMessage: '¡BIENVENID@ A {server}!',
  embedDescription:
    'Bienvenido/a {user} al servidor oficial de {server}. Recuerda leer las reglas antes de empezar, es muy importante. ¡Pásalo muy bien! 🎊',
}

// Guardar configuración
async function saveConfig(guildId, config) {
  try {
    const configPath = join(dirname(__dirname), 'data', 'welcome')
    await fs.mkdir(configPath, { recursive: true })
    await fs.writeFile(join(configPath, `${guildId}.json`), JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('Error guardando configuración simple:', error)
    return false
  }
}

// Cargar configuración
async function loadConfig(guildId) {
  try {
    const configPath = join(dirname(__dirname), 'data', 'welcome', `${guildId}.json`)
    const data = await fs.readFile(configPath, 'utf8')
    return { ...defaultConfig, ...JSON.parse(data) }
  } catch (error) {
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

export const data = new SlashCommandBuilder()
  .setName('welcome')
  .setDescription('Configuración del mensaje de bienvenida')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand =>
    subcommand
      .setName('imagen')
      .setDescription('Configura la imagen de fondo')
      .addAttachmentOption(option => option.setName('fondo').setDescription('Sube tu imagen de fondo personalizada').setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('mensaje')
      .setDescription('Configura el mensaje de bienvenida')
      .addStringOption(option =>
        option.setName('texto').setDescription('Tu mensaje personalizado. Usa {user}, {server}, {count}').setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('descripcion')
      .setDescription('Configura el mensaje de texto que aparece arriba')
      .addStringOption(option =>
        option.setName('texto').setDescription('Mensaje que aparece arriba de la imagen (usa {user}, {server}, {count})').setRequired(true)
      )
  )
  .addSubcommand(subcommand => subcommand.setName('preview').setDescription('Ve una vista previa de tu configuración'))
  .addSubcommand(subcommand => subcommand.setName('reset').setDescription('Restaura la configuración por defecto'))

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand()
  const guildId = interaction.guild.id

  try {
    await interaction.deferReply()

    let config = await loadConfig(guildId)

    switch (subcommand) {
      case 'imagen': {
        const imagen = interaction.options.getAttachment('fondo')

        if (imagen.contentType?.startsWith('image/')) {
          config.backgroundImage = imagen.url
          await saveConfig(guildId, config)

          const embed = new EmbedBuilder()
            .setTitle('✅ Imagen de fondo configurada')
            .setDescription('Tu imagen personalizada ha sido guardada.')
            .setImage(imagen.url)
            .setColor(0x00ff00)
            .setFooter({ text: 'Usa /welcome-simple preview para ver el resultado' })

          await interaction.editReply({ embeds: [embed] })
        } else {
          await interaction.editReply({ content: '❌ Por favor sube una imagen válida (PNG, JPG, GIF, etc.)' })
        }
        break
      }

      case 'mensaje': {
        const texto = interaction.options.getString('texto')
        config.welcomeMessage = texto
        await saveConfig(guildId, config)

        await interaction.editReply({
          content: `✅ **Mensaje configurado:**\n\`${texto}\`\n\n*Variables disponibles: {user}, {server}, {count}*`,
        })
        break
      }

      case 'descripcion': {
        const texto = interaction.options.getString('texto')
        config.embedDescription = texto
        await saveConfig(guildId, config)

        await interaction.editReply({
          content: `✅ **Mensaje de texto configurado:**\n\`${texto}\`\n\n*Este mensaje aparecerá arriba de la imagen (sin embed)*`,
        })
        break
      }

      case 'preview': {
        const previewBuffer = await createWelcomeImage(interaction.member, config)

        if (previewBuffer) {
          const attachment = new AttachmentBuilder(previewBuffer, { name: 'preview-simple.png' })

          // Crear el mensaje tal y como se enviará (sin embed)
          const previewText = config.embedDescription
            .replace('{user}', `@${interaction.member.user.username}`)
            .replace('{server}', interaction.guild.name)
            .replace('{count}', interaction.guild.memberCount.toString())

          await interaction.editReply({
            content: `🎨 **Vista previa - Así se verá exactamente:**\n\n${previewText}`,
            files: [attachment],
          })
        } else {
          await interaction.editReply({ content: '❌ Error generando vista previa.' })
        }
        break
      }

      case 'reset': {
        await saveConfig(guildId, defaultConfig)
        await interaction.editReply({ content: '✅ Configuración restaurada a los valores por defecto.' })
        break
      }
    }
  } catch (error) {
    console.error('Error en welcome-simple:', error)
    await interaction.editReply({ content: '❌ Ocurrió un error al procesar el comando.' })
  }
}

// Exportar funciones para usar en welcome.js
export { loadConfig, createWelcomeImage }
