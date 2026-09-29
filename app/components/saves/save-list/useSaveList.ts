import { SaveNameDialog } from '#components'
import type { Save } from '~/composables/saves/useSaves'

export function useSaveList() {
  const { t } = useI18n()
  const overlay = useOverlay()
  const confirmDialog = useConfirmDialog()
  const { hasEnteredSave } = useAppEntry()
  const { saves, activeSaveFile, loading, fetchSaves, createSave, duplicateSave, renameSave, deleteSave, switchSave } = useSaves()

  onMounted(fetchSaves)

  async function handleCreate() {
    const modal = overlay.create(SaveNameDialog, { destroyOnClose: true })
    const name = await modal.open({ mode: 'create' })
    if (name) {
      await createSave(name)
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
    handleDuplicate,
    handleRename,
    handleDelete,
    handleEnter
  }
}
