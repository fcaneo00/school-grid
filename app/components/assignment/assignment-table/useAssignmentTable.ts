import type { TableColumn } from '@nuxt/ui'
import type { AssignmentWithDetails } from '~/composables/assignment/useAssignments'

interface TeacherGroup {
  teacherId: number
  teacherName: string
  classCount: number
  totalHours: number
  assignments: AssignmentWithDetails[]
}

export function useAssignmentTable() {
  const { t } = useI18n()
  const { assignments, loading, fetchAssignments, deleteAssignment } = useAssignments()
  const { filters } = useAssignmentFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchAssignments)

  const expanded = ref<Record<string, boolean>>({})
  const sorting = ref([{ id: 'teacherName', desc: false }])

  function schoolClassNameOf(assignment: AssignmentWithDetails) {
    return formatSchoolClassName({
      year: assignment.school_class_year,
      section_name: assignment.school_class_section_name,
      study_track_name: assignment.school_class_study_track_name
    })
  }

  async function handleDelete(assignment: AssignmentWithDetails) {
    const name = `${assignment.teacher_last_name} ${assignment.teacher_first_name} (${schoolClassNameOf(assignment)})`
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
      (filters.value.weeklyHours === undefined || assignment.weekly_hours === filters.value.weeklyHours)
    )
  )

  const teacherGroups = computed<TeacherGroup[]>(() => {
    const groups = new Map<number, TeacherGroup>()
    for (const assignment of filteredAssignments.value) {
      let group = groups.get(assignment.teacher_id)
      if (!group) {
        group = {
          teacherId: assignment.teacher_id,
          teacherName: `${assignment.teacher_last_name} ${assignment.teacher_first_name}`,
          classCount: 0,
          totalHours: 0,
          assignments: []
        }
        groups.set(assignment.teacher_id, group)
      }
      group.assignments.push(assignment)
      group.classCount += 1
      group.totalHours += assignment.weekly_hours
    }
    return [...groups.values()].sort((a, b) => a.teacherName.localeCompare(b.teacherName))
  })

  const columns: TableColumn<TeacherGroup>[] = [
    { id: 'expand' },
    { accessorKey: 'teacherName', header: t('assignments.form.teacher'), enableSorting: true },
    { accessorKey: 'classCount', header: t('assignments.classCount'), enableSorting: true },
    { accessorKey: 'totalHours', header: t('assignments.totalHours'), enableSorting: true }
  ]

  return {
    teacherGroups,
    loading,
    columns,
    expanded,
    sorting,
    schoolClassNameOf,
    handleDelete
  }
}
