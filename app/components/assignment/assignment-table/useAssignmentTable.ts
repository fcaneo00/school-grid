import type { TableColumn } from '@nuxt/ui'
import type { AssignmentWithDetails } from '~/composables/assignment/useAssignments'

export function useAssignmentTable() {
  const { t } = useI18n()
  const { assignments, loading, fetchAssignments, deleteAssignment } = useAssignments()
  const { filters } = useAssignmentFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchAssignments)

  function schoolClassNameOf(assignment: AssignmentWithDetails) {
    return formatSchoolClassName({
      year: assignment.school_class_year,
      section: assignment.school_class_section,
      study_track_name: assignment.school_class_study_track_name
    })
  }

  async function handleDelete(assignment: AssignmentWithDetails) {
    const name = `${assignment.teacher_last_name} ${assignment.teacher_first_name} - ${assignment.subject_name} (${schoolClassNameOf(assignment)})`
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name })
    })
    if (confirmed) {
      await deleteAssignment(assignment.id)
    }
  }

  const filteredAssignments = computed(() =>
    assignments.value.filter((assignment) =>
      `${assignment.teacher_last_name} ${assignment.teacher_first_name}`.toLowerCase().includes(filters.value.teacher.toLowerCase()) &&
      schoolClassNameOf(assignment).toLowerCase().includes(filters.value.schoolClass.toLowerCase()) &&
      assignment.subject_name.toLowerCase().includes(filters.value.subject.toLowerCase()) &&
      String(assignment.weekly_hours).includes(filters.value.weeklyHours)
    )
  )

  const columns: TableColumn<AssignmentWithDetails>[] = [
    {
      id: 'teacher',
      header: t('assignments.form.teacher'),
      cell: ({ row }) => `${row.original.teacher_last_name} ${row.original.teacher_first_name}`
    },
    {
      id: 'schoolClass',
      header: t('assignments.form.schoolClass'),
      cell: ({ row }) => schoolClassNameOf(row.original)
    },
    { accessorKey: 'subject_name', header: t('assignments.form.subject') },
    { accessorKey: 'weekly_hours', header: t('assignments.form.weeklyHours') },
    { id: 'actions', header: t('table.actions') }
  ]

  return {
    assignments: filteredAssignments,
    loading,
    columns,
    handleDelete
  }
}
