import type { ContextMenuItem } from '@nuxt/ui'
import type { AssignmentWithDetails } from '~/composables/assignment/useAssignments'

export function useScheduleSidebar(schoolClassId: Ref<number>) {
  const { t } = useI18n()
  const { assignments, fetchAssignments, deleteAssignment } = useAssignments()
  const { effectiveEntries } = useScheduleDraft()
  const { draggedAssignment } = useScheduleDrag()
  const confirmDialog = useConfirmDialog()
  const route = useRoute()

  onMounted(fetchAssignments)

  const classAssignments = computed(() => {
    const classSchedule = effectiveEntries(schoolClassId.value)
    return assignments.value
      .filter((assignment) => assignment.school_class_id === schoolClassId.value)
      .map((assignment) => ({
        ...assignment,
        assigned: classSchedule.filter((entry) => entry.assignment_id === assignment.id).length
      }))
  })

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
    const name = `${assignment.teacher_last_name} ${assignment.teacher_first_name}`
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
    classAssignments,
    onDragStart,
    onDragEnd,
    contextMenuItems
  }
}
