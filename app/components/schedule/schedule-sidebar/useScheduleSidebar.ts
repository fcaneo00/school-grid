export function useScheduleSidebar(schoolClassId: Ref<number>) {
  const { assignments, fetchAssignments } = useAssignments()
  const { effectiveEntries } = useScheduleDraft()
  const { draggedAssignment } = useScheduleDrag()

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

  return {
    classAssignments,
    onDragStart,
    onDragEnd
  }
}
