import type { TableColumn } from '@nuxt/ui'
import type { Teacher } from '~/composables/teacher/useTeachers'

export function useTeacherTable() {
  const { t } = useI18n()
  const { teachers, loading, fetchTeachers, deleteTeacher } = useTeachers()
  const { filters } = useTeacherFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchTeachers)

  async function handleDelete(teacher: Teacher) {
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name: `${teacher.last_name} ${teacher.first_name}` })
    })
    if (confirmed) {
      await deleteTeacher(teacher.id)
    }
  }

  const filteredTeachers = computed(() =>
    teachers.value.filter((teacher) =>
      teacher.first_name.toLowerCase().includes(filters.value.first_name.toLowerCase()) &&
      teacher.last_name.toLowerCase().includes(filters.value.last_name.toLowerCase())
    )
  )

  const columns: TableColumn<Teacher>[] = [
    { accessorKey: 'first_name', header: t('teachers.form.firstName') },
    { accessorKey: 'last_name', header: t('teachers.form.lastName') },
    { id: 'actions', header: t('table.actions') }
  ]

  return {
    teachers: filteredTeachers,
    loading,
    columns,
    handleDelete
  }
}
