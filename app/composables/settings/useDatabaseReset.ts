import { DatabaseWipeDialog } from '#components'

export function useDatabaseReset() {
  const { t } = useI18n()
  const notify = useNotification()
  const overlay = useOverlay()
  const { fetchTeachers } = useTeachers()
  const { fetchSchoolClasses } = useSchoolClasses()
  const { fetchSections } = useSections()
  const { fetchStudyTracks } = useStudyTracks()
  const { fetchAssignments } = useAssignments()
  const { fetchEntries } = useSchedule()
  const { discardAllDrafts } = useScheduleDraft()

  const loading = ref(false)

  async function refetchAll() {
    await Promise.all([
      fetchTeachers(),
      fetchSchoolClasses(),
      fetchSections(),
      fetchStudyTracks(),
      fetchAssignments(),
      fetchEntries()
    ])
  }

  async function wipeDatabase() {
    loading.value = true
    try {
      const db = await getDb()
      await db.execute('DELETE FROM schedule_entry')
      await db.execute('DELETE FROM assignment')
      await db.execute('DELETE FROM preference')
      await db.execute('DELETE FROM school_class')
      await db.execute('DELETE FROM section')
      await db.execute('DELETE FROM study_track')
      await db.execute('DELETE FROM teacher')

      discardAllDrafts()
      await refetchAll()

      notify.success(t('settings.dangerZone.wipeSuccessTitle'), '')
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function confirmAndWipe() {
    const modal = overlay.create(DatabaseWipeDialog, { destroyOnClose: true })
    const confirmed = await modal.open()
    if (confirmed) {
      await wipeDatabase()
    }
  }

  return {
    loading,
    confirmAndWipe
  }
}
