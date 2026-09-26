import type { ContextMenuItem } from '@nuxt/ui'
import type { AssignmentWithDetails } from '~/composables/assignment/useAssignments'

export function useScheduleSidebar(subject: Ref<ScheduleSubject>) {
  const { t } = useI18n()
  const { assignments, fetchAssignments, deleteAssignment } = useAssignments()
  const { effectiveEntries } = useScheduleDraft()
  const { draggedAssignment } = useScheduleDrag()
  const confirmDialog = useConfirmDialog()
  const route = useRoute()

  onMounted(fetchAssignments)

  const subjectAssignments = computed(() => {
    const schedule = effectiveEntries()
    return assignments.value
      .filter((assignment) => subject.value.type === 'class'
        ? assignment.school_class_id === subject.value.id
        : assignment.teacher_id === subject.value.id)
      .map((assignment) => ({
        ...assignment,
        assigned: schedule.filter((entry) => entry.assignment_id === assignment.id).length
      }))
  })

  function assignmentLabel(assignment: AssignmentWithDetails) {
    return subject.value.type === 'class'
      ? formatTeacherShortName(assignment.teacher_last_name, assignment.teacher_first_name)
      : formatSchoolClassName({
          year: assignment.school_class_year,
          section_name: assignment.school_class_section_name,
          study_track_name: assignment.school_class_study_track_name
        })
  }

  function onDragStart(event: DragEvent, assignment: AssignmentWithDetails) {
    draggedAssignment.value = assignment
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(assignment.id))
    }
  }

  function onDragEnd() {
    draggedAssignment.value = null
  }

  async function handleDeleteAssignment(assignment: AssignmentWithDetails) {
    const name = assignmentLabel(assignment)
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name })
    })
    if (confirmed) {
      await deleteAssignment(assignment.id)
    }
  }

  function contextMenuItems(assignment: AssignmentWithDetails): ContextMenuItem[] {
    return [
      {
        label: t('schedule.editTeacherRegistry'),
        icon: 'i-ph-identification-card',
        to: { path: `/teachers/${assignment.teacher_id}/edit`, query: { returnTo: route.fullPath } }
      },
      {
        label: t('schedule.editAssignment'),
        icon: 'i-ph-chalkboard-teacher',
        to: { path: `/assignments/${assignment.id}/edit`, query: { returnTo: route.fullPath } }
      },
      {
        label: t('schedule.deleteAssignment'),
        icon: 'i-ph-trash',
        color: 'error',
        onSelect: () => handleDeleteAssignment(assignment)
      }
    ]
  }

  return {
    subjectAssignments,
    assignmentLabel,
    onDragStart,
    onDragEnd,
    contextMenuItems
  }
}
