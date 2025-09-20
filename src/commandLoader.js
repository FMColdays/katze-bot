import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { readdirSync, statSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function loadCommandsFromDirectory(dirPath, commands) {
  try {
    const items = readdirSync(dirPath)

    for (const item of items) {
      const itemPath = join(dirPath, item)
      const stat = statSync(itemPath)

      if (stat.isDirectory()) {
        // Recursivamente cargar comandos de subcarpetas
        await loadCommandsFromDirectory(itemPath, commands)
      } else if (item.endsWith('.js')) {
        const fileURL = pathToFileURL(itemPath).href

        try {
          const command = await import(fileURL)

          if ('data' in command && 'execute' in command) {
            commands.set(command.data.name, command)
            console.log(`✅ Comando cargado: ${command.data.name}`)
          } else {
            console.log(`⚠️  El comando ${item} no tiene 'data' o 'execute' exportados.`)
          }
        } catch (error) {
          console.error(`❌ Error cargando comando ${item}:`, error)
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error leyendo la carpeta ${dirPath}:`, error)
  }
}

export async function loadCommands() {
  const commands = new Map()
  const commandsPath = join(__dirname, 'commands')

  await loadCommandsFromDirectory(commandsPath, commands)

  return commands
}

export function getCommandsArray(commands) {
  return Array.from(commands.values()).map(command => command.data.toJSON())
}
