import { save } from '@tauri-apps/plugin-dialog'

export function useSaveExport() {
  const { saves, activeSaveFile, exportSave } = useSaves()

  const loading = ref(false)

  async function handleExportSave() {
    const activeSave = saves.value.find((candidate) => candidate.fileName === activeSaveFile.value)
    if (!activeSave) return

    loading.value = true
    try {
      const destinationPath = await save({
        defaultPath: `${activeSave.displayName}.school-grid`,
        filters: [{ name: 'School Grid', extensions: ['school-grid'] }]
      })
      if (!destinationPath) return
      await exportSave(activeSave, destinationPath)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    handleExportSave
  }
}
