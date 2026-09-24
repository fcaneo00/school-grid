import type { TableColumn } from '@nuxt/ui'
import type { StudyTrack } from '~/composables/study-track/useStudyTracks'

export function useStudyTrackTable() {
  const { t } = useI18n()
  const { studyTracks, loading, fetchStudyTracks, deleteStudyTrack } = useStudyTracks()
  const { filters } = useStudyTrackFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchStudyTracks)

  async function handleDelete(studyTrack: StudyTrack) {
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name: studyTrack.name })
    })
    if (confirmed) {
      await deleteStudyTrack(studyTrack.id)
    }
  }

  const filteredStudyTracks = computed(() =>
    studyTracks.value.filter((studyTrack) =>
      studyTrack.name.toLowerCase().includes(filters.value.name.toLowerCase())
    )
  )

  const columns: TableColumn<StudyTrack>[] = [
    { accessorKey: 'name', header: t('studyTracks.form.name') },
    { id: 'actions', header: t('table.actions') }
  ]

  return {
    studyTracks: filteredStudyTracks,
    loading,
    columns,
    handleDelete
  }
}
