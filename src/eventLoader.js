// src/eventLoader.js
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join, basename } from 'path'
import { readdirSync, statSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function loadEventsFromDirectory(dirPath, client, registered) {
  let items = []
  try {
    items = readdirSync(dirPath)
  } catch {
    console.warn('[eventLoader] No existe la carpeta:', dirPath)
    return
  }

  for (const item of items) {
    const itemPath = join(dirPath, item)
    const stat = statSync(itemPath)

    if (stat.isDirectory()) {
      await loadEventsFromDirectory(itemPath, client, registered)
      continue
    }
    if (!item.endsWith('.js')) continue

    const fileURL = pathToFileURL(itemPath).href
    try {
      const mod = await import(fileURL)

      const name = mod.name ?? mod.default?.name
      const once = mod.once ?? mod.default?.once ?? false
      const execute = mod.execute ?? mod.default?.execute
      const fileBase = basename(item, '.js')
      const label = mod.label ?? mod.default?.label ?? fileBase

      if (!name || typeof execute !== 'function') {
        console.log(`⚠️  El evento ${item} no exporta "name" o "execute". Omitido.`)
        continue
      }

      const handler = (...args) => execute(...args, client)
      client[once ? 'once' : 'on'](name, handler)

      registered.set(label, { file: item, once })
      console.log(`✅ Evento registrado: ${label}`)
    } catch (error) {
      console.error(`❌ Error cargando evento ${item}:`, error)
    }
  }
}

/** Export nombrado usado por index.js */
export async function loadEvents(client) {
  const events = new Map()
  const eventsPath = join(__dirname, 'events')
  await loadEventsFromDirectory(eventsPath, client, events)
  console.log(`Eventos cargados: ${events.size}`)
  return events
}
