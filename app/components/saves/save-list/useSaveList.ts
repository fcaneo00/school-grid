import { open } from '@tauri-apps/plugin-dialog'
import { SaveNameDialog } from '#components'
import type { Save } from '~/composables/saves/useSaves'

const EXPORT_EXTENSION = '.school-grid'

function suggestedImportName(pickedPath: string) {
  const baseName = pickedPath.split(/[/\\]/).pop() ?? pickedPath
  const withoutExportExtension = baseName.endsWith(EXPORT_EXTENSION) ? baseName.slice(0, -EXPORT_EXTENSION.length) : baseName
  return saveDisplayName(withoutExportExtension)
}

export function useSaveList() {
  const { t } = useI18n()
  const overlay = useOverlay()
  const confirmDialog = useConfirmDialog()
  const { hasEnteredSave } = useAppEntry()
  const { saves, activeSaveFile, loading, fetchSaves, createSave, importSave, duplicateSave, renameSave, deleteSave, switchSave } = useSaves()

  onMounted(fetchSaves)

  async function handleCreate() {
    const modal = overlay.create(SaveNameDialog, { destroyOnClose: true })
    const name = await modal.open({ mode: 'create' })
    if (name) {
      await createSave(name)
    }
  }

  async function handleImport() {
    const pickedPath = await open({
      title: t('saves.importButton'),
      filters: [{ name: 'School Grid', extensions: ['school-grid', 'db'] }]
    })
    if (!pickedPath) return

    const suggestedName = suggestedImportName(pickedPath)
    const modal = overlay.create(SaveNameDialog, { destroyOnClose: true })
    const name = await modal.open({ mode: 'import', sourceName: suggestedName, initialName: suggestedName })
    if (name) {
      await importSave(pickedPath, name)
    }
  }

  async function handleDuplicate(save: Save) {
    const modal = overlay.create(SaveNameDialog, { destroyOnClose: true })
    const name = await modal.open({
      mode: 'duplicate',
      sourceName: save.displayName,
      initialName: t('saves.duplicateSuggestedName', { name: save.displayName })
    })
    if (name) {
      await duplicateSave(save, name)
    }
  }

  async function handleRename(save: Save) {
    const modal = overlay.create(SaveNameDialog, { destroyOnClose: true })
    const name = await modal.open({ mode: 'rename', sourceName: save.displayName, initialName: save.displayName })
    if (name) {
      await renameSave(save, name)
    }
  }

  async function handleDelete(save: Save) {
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name: save.displayName })
    })
    if (confirmed) {
      await deleteSave(save)
    }
  }

  async function handleEnter(save: Save) {
    if (save.fileName !== activeSaveFile.value) {
      await switchSave(save)
    }
    hasEnteredSave.value = true
    await navigateTo('/')
  }

  return {
    saves,
    activeSaveFile,
    loading,
    handleCreate,
    handleImport,
    handleDuplicate,
    handleRename,
    handleDelete,
    handleEnter
  }
}
