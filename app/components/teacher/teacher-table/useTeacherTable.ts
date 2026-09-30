import type { TableColumn } from '@nuxt/ui'
import type { TeacherWithDetails } from '~/composables/teacher/useTeachers'

export function useTeacherTable() {
  const { t } = useI18n()
  const { teachers, loading, fetchTeachers, deleteTeacher } = useTeachers()
  const { filters } = useTeacherFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchTeachers)

  const sorting = ref([{ id: 'last_name', desc: false }])

  async function handleDelete(teacher: TeacherWithDetails) {
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

  const columns: TableColumn<TeacherWithDetails>[] = [
    { accessorKey: 'last_name', header: t('teachers.form.lastName'), enableSorting: true },
    { accessorKey: 'first_name', header: t('teachers.form.firstName'), enableSorting: true },
    { id: 'actions', header: t('table.actions') }
  ]

  return {
    teachers: filteredTeachers,
    loading,
    columns,
    sorting,
    handleDelete
  }
}
