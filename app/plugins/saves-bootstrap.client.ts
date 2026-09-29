import Database from '@tauri-apps/plugin-sql'
import { BaseDirectory, copyFile, exists, mkdir, readDir, readTextFile, rename, writeTextFile } from '@tauri-apps/plugin-fs'
import { ACTIVE_SAVE_FILE, DEFAULT_SAVE_NAME, LEGACY_DB, SAVES_DIR, TEMPLATE_DB, isSaveFile, saveFileName, saveFilePath } from '~/utils/saves'

export default defineNuxtPlugin(async () => {
  await Database.load(`sqlite:${TEMPLATE_DB}`)

  const savesDirExists = await exists(SAVES_DIR, { baseDir: BaseDirectory.AppConfig })
  if (!savesDirExists) {
    await mkdir(SAVES_DIR, { baseDir: BaseDirectory.AppConfig, recursive: true })
  }

  const saveFiles = (await readDir(SAVES_DIR, { baseDir: BaseDirectory.AppConfig }))
    .filter((entry) => entry.isFile && isSaveFile(entry.name))

  if (saveFiles.length === 0) {
    const destination = saveFilePath(saveFileName(DEFAULT_SAVE_NAME))
    const legacyDbExists = await exists(LEGACY_DB, { baseDir: BaseDirectory.AppConfig })
    if (legacyDbExists) {
      await rename(LEGACY_DB, destination, { oldPathBaseDir: BaseDirectory.AppConfig, newPathBaseDir: BaseDirectory.AppConfig })
    } else {
      await copyFile(TEMPLATE_DB, destination, { fromPathBaseDir: BaseDirectory.AppConfig, toPathBaseDir: BaseDirectory.AppConfig })
    }
  }

  const activeSavePointerExists = await exists(ACTIVE_SAVE_FILE, { baseDir: BaseDirectory.AppConfig })
  const activeSave = activeSavePointerExists ? (await readTextFile(ACTIVE_SAVE_FILE, { baseDir: BaseDirectory.AppConfig })).trim() : ''
  const activeSaveIsValid = activeSave.length > 0 && await exists(saveFilePath(activeSave), { baseDir: BaseDirectory.AppConfig })

  if (!activeSaveIsValid) {
    const currentSaveFiles = (await readDir(SAVES_DIR, { baseDir: BaseDirectory.AppConfig }))
      .filter((entry) => entry.isFile && isSaveFile(entry.name))
      .map((entry) => entry.name)
      .sort()

    const firstSave = currentSaveFiles[0]
    if (firstSave) {
      await writeTextFile(ACTIVE_SAVE_FILE, firstSave, { baseDir: BaseDirectory.AppConfig })
    }
  }
})
