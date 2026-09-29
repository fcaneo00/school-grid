import { BaseDirectory, copyFile, exists, readDir, remove, rename, writeTextFile } from '@tauri-apps/plugin-fs'

export interface Save {
  fileName: string
  displayName: string
}

export function useSaves() {
  const { t } = useI18n()
  const notify = useNotification()
  const { refreshAllData } = useDataRefresh()

  const saves = useState<Save[]>('saves', () => [])
  const activeSaveFile = useState('active-save-file', () => '')
  const loading = useState('saves-loading', () => false)

  async function fetchSaves() {
    loading.value = true
    try {
      const entries = await readDir(SAVES_DIR, { baseDir: BaseDirectory.AppConfig })
      saves.value = entries
        .filter((entry) => entry.isFile && isSaveFile(entry.name))
        .map((entry) => ({ fileName: entry.name, displayName: saveDisplayName(entry.name) }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
      activeSaveFile.value = await getActiveSave()
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function nameAvailable(name: string) {
    return !(await exists(saveFilePath(saveFileName(name)), { baseDir: BaseDirectory.AppConfig }))
  }

  async function createSave(name: string) {
    if (!(await nameAvailable(name))) {
      notify.error(t('saves.duplicateNameTitle'), t('saves.duplicateNameDescription'))
      return
    }
    await copyFile(TEMPLATE_DB, saveFilePath(saveFileName(name)), {
      fromPathBaseDir: BaseDirectory.AppConfig,
      toPathBaseDir: BaseDirectory.AppConfig
    })
    await fetchSaves()
    notify.success(t('general.added'), name)
  }

  async function duplicateSave(save: Save, name: string) {
    if (!(await nameAvailable(name))) {
      notify.error(t('saves.duplicateNameTitle'), t('saves.duplicateNameDescription'))
      return
    }
    await copyFile(saveFilePath(save.fileName), saveFilePath(saveFileName(name)), {
      fromPathBaseDir: BaseDirectory.AppConfig,
      toPathBaseDir: BaseDirectory.AppConfig
    })
    await fetchSaves()
    notify.success(t('general.added'), name)
  }

  async function renameSave(save: Save, name: string) {
    const isSameName = save.displayName.toLowerCase() === name.toLowerCase()
    if (!isSameName && !(await nameAvailable(name))) {
      notify.error(t('saves.duplicateNameTitle'), t('saves.duplicateNameDescription'))
      return
    }
    const newFileName = saveFileName(name)
    const wasActive = save.fileName === activeSaveFile.value
    await rename(saveFilePath(save.fileName), saveFilePath(newFileName), {
      oldPathBaseDir: BaseDirectory.AppConfig,
      newPathBaseDir: BaseDirectory.AppConfig
    })
    if (await exists(historyDirPath(save.fileName), { baseDir: BaseDirectory.AppConfig })) {
      await rename(historyDirPath(save.fileName), historyDirPath(newFileName), {
        oldPathBaseDir: BaseDirectory.AppConfig,
        newPathBaseDir: BaseDirectory.AppConfig
      })
    }
    if (wasActive) {
      await writeTextFile(ACTIVE_SAVE_FILE, newFileName, { baseDir: BaseDirectory.AppConfig })
      activeSaveFile.value = newFileName
    }
    await fetchSaves()
    notify.success(t('general.updated'), name)
  }

  async function deleteSave(save: Save) {
    if (saves.value.length <= 1) {
      notify.error(t('saves.deleteBlockedTitle'), t('saves.deleteBlockedLastDescription'))
      return
    }
    const wasActive = save.fileName === activeSaveFile.value
    await remove(saveFilePath(save.fileName), { baseDir: BaseDirectory.AppConfig })

    if (await exists(historyDirPath(save.fileName), { baseDir: BaseDirectory.AppConfig })) {
      await remove(historyDirPath(save.fileName), { baseDir: BaseDirectory.AppConfig, recursive: true })
    }

    if (wasActive) {
      const fallback = saves.value.find((other) => other.fileName !== save.fileName)
      if (fallback) {
        await writeTextFile(ACTIVE_SAVE_FILE, fallback.fileName, { baseDir: BaseDirectory.AppConfig })
        activeSaveFile.value = fallback.fileName
      }
    }

    await fetchSaves()
    if (wasActive) {
      await refreshAllData()
    }
    notify.success(t('general.deleted'), save.displayName)
  }

  async function switchSave(save: Save) {
    if (save.fileName === activeSaveFile.value) return
    await writeTextFile(ACTIVE_SAVE_FILE, save.fileName, { baseDir: BaseDirectory.AppConfig })
    activeSaveFile.value = save.fileName
    await refreshAllData()
  }

  return {
    saves,
    activeSaveFile,
    loading,
    fetchSaves,
    createSave,
    duplicateSave,
    renameSave,
    deleteSave,
    switchSave
  }
}
