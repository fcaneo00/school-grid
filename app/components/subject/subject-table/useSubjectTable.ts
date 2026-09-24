import type { TableColumn } from '@nuxt/ui'
import type { Subject } from '~/composables/subject/useSubjects'

export function useSubjectTable() {
  const { t } = useI18n()
  const { subjects, loading, fetchSubjects, deleteSubject } = useSubjects()
  const { filters } = useSubjectFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchSubjects)

  async function handleDelete(subject: Subject) {
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name: subject.name })
    })
    if (confirmed) {
      await deleteSubject(subject.id)
    }
  }

  const filteredSubjects = computed(() =>
    subjects.value.filter((subject) =>
      subject.name.toLowerCase().includes(filters.value.name.toLowerCase())
    )
  )

  const columns: TableColumn<Subject>[] = [
    { accessorKey: 'name', header: t('subjects.form.name') },
    { id: 'actions', header: t('table.actions') }
  ]

  return {
    subjects: filteredSubjects,
    loading,
    columns,
    handleDelete
  }
}
