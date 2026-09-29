import Database from '@tauri-apps/plugin-sql'
import { BaseDirectory, copyFile, exists, mkdir, readDir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { ACTIVE_SAVE_FILE, DEFAULT_SAVE_NAME, DEMO_RESOURCE_FILE, DEMO_SAVE_NAME, SAVES_DIR, TEMPLATE_DB, isSaveFile, saveFileName, saveFilePath } from '~/utils/saves'

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
    await copyFile(TEMPLATE_DB, destination, { fromPathBaseDir: BaseDirectory.AppConfig, toPathBaseDir: BaseDirectory.AppConfig })

    const demoResourceExists = await exists(DEMO_RESOURCE_FILE, { baseDir: BaseDirectory.Resource })
    if (demoResourceExists) {
      await copyFile(DEMO_RESOURCE_FILE, saveFilePath(saveFileName(DEMO_SAVE_NAME)), {
        fromPathBaseDir: BaseDirectory.Resource,
        toPathBaseDir: BaseDirectory.AppConfig
      })
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

    const defaultSaveFileName = saveFileName(DEFAULT_SAVE_NAME)
    const firstSave = currentSaveFiles.includes(defaultSaveFileName) ? defaultSaveFileName : currentSaveFiles[0]
    if (firstSave) {
      await writeTextFile(ACTIVE_SAVE_FILE, firstSave, { baseDir: BaseDirectory.AppConfig })
    }
  }
})
