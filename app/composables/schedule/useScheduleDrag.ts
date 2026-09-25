interface DraggedBlockSource {
  day: Weekday
  assignmentId: number
  teacherId: number
  startHour: HourSlot
  span: number
  entryIds: number[]
  teacherFirstName: string
  teacherLastName: string
}

export function useScheduleDrag() {
  const draggedAssignment = useState<AssignmentWithDetails | null>('schedule-dragged-assignment', () => null)
  const draggedBlockSource = useState<DraggedBlockSource | null>('schedule-dragged-block-source', () => null)
  return { draggedAssignment, draggedBlockSource }
}
