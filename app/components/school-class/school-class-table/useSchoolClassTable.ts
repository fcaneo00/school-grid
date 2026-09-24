import type { TableColumn } from '@nuxt/ui'
import type { SchoolClassWithDetails } from '~/composables/school-class/useSchoolClasses'

export function useSchoolClassTable() {
  const { t } = useI18n()
  const { schoolClasses, loading, fetchSchoolClasses, deleteSchoolClass } = useSchoolClasses()
  const { filters } = useSchoolClassFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchSchoolClasses)

  async function handleDelete(schoolClass: SchoolClassWithDetails) {
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name: formatSchoolClassName(schoolClass) })
    })
    if (confirmed) {
      await deleteSchoolClass(schoolClass.id)
    }
  }

  const filteredSchoolClasses = computed(() =>
    schoolClasses.value.filter((schoolClass) =>
      String(schoolClass.year).includes(filters.value.year) &&
      schoolClass.section.toLowerCase().includes(filters.value.section.toLowerCase()) &&
      (schoolClass.study_track_name ?? '').toLowerCase().includes(filters.value.study_track_name.toLowerCase())
    )
  )

  const columns: TableColumn<SchoolClassWithDetails>[] = [
    { accessorKey: 'year', header: t('schoolClasses.form.year') },
    { accessorKey: 'section', header: t('schoolClasses.form.section') },
    { accessorKey: 'study_track_name', header: t('schoolClasses.form.studyTrack') },
    { id: 'actions', header: t('table.actions') }
  ]

  return {
    schoolClasses: filteredSchoolClasses,
    loading,
    columns,
    handleDelete
  }
}
