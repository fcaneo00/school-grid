import Database from '@tauri-apps/plugin-sql'
import { BaseDirectory, exists, readTextFile } from '@tauri-apps/plugin-fs'
import { ACTIVE_SAVE_FILE, saveFilePath } from '~/utils/saves'

export async function getActiveSave() {
  const pointerExists = await exists(ACTIVE_SAVE_FILE, { baseDir: BaseDirectory.AppConfig })
  const activeSave = pointerExists ? (await readTextFile(ACTIVE_SAVE_FILE, { baseDir: BaseDirectory.AppConfig })).trim() : ''
  if (!activeSave) {
    throw new Error('Nessun salvataggio attivo')
  }
  return activeSave
}

export async function getDb() {
  const activeSave = await getActiveSave()
  return Database.load(`sqlite:${saveFilePath(activeSave)}`)
}
