const CONCATENATION_BONUS = 10
const DAY_OFF_PENALTY = 5
const ISOLATION_PENALTY = 2

export interface HeuristicAssignment {
  id: number
  teacherId: number
  schoolClassId: number
}

export interface SuggestedCell {
  day: Weekday
  hourSlot: HourSlot
  assignmentId: number
}

export function useScheduleHeuristic() {
  const { t } = useI18n()
  const notify = useNotification()
  const { effectiveEntries } = useScheduleDraft()
  const { settings, activeHourSlots } = useAppSettings()

  const conflictEntries = computed(() => effectiveEntries())
  const { hasTeacherConflict, hasClassConflict, isDayOff, violatesTimeConstraint } = useScheduleConflicts(conflictEntries)

  const suggestedCell = useState<SuggestedCell | null>('schedule-heuristic-suggestion', () => null)

  watch(conflictEntries, () => {
    suggestedCell.value = null
  })

  function isSameAssignmentAt(assignmentId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.assignment_id === assignmentId && entry.day === day && entry.hour_slot === hourSlot)
  }

  function isTeacherBusyAt(teacherId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.teacher_id === teacherId && entry.day === day && entry.hour_slot === hourSlot)
  }

  function neighborHours(hourSlot: HourSlot): HourSlot[] {
    return activeHourSlots.value.filter((candidate) => Math.abs(candidate - hourSlot) === 1)
  }

  function scoreCell(assignment: HeuristicAssignment, day: Weekday, hourSlot: HourSlot) {
    const neighbors = neighborHours(hourSlot)
    let score = 0

    if (neighbors.some((neighbor) => isSameAssignmentAt(assignment.id, day, neighbor))) {
      score += CONCATENATION_BONUS
    }
    if (isDayOff(assignment.teacherId, day)) {
      score -= DAY_OFF_PENALTY
    }
    if (!neighbors.some((neighbor) => isTeacherBusyAt(assignment.teacherId, day, neighbor))) {
      score -= ISOLATION_PENALTY
    }

    return score
  }

  function isCellAvailable(assignment: HeuristicAssignment, day: Weekday, hourSlot: HourSlot) {
    if (hasTeacherConflict(assignment.teacherId, day, hourSlot)) return false
    if (hasClassConflict(assignment.schoolClassId, day, hourSlot)) return false
    if (violatesTimeConstraint(assignment.teacherId, day, hourSlot)) return false
    return true
  }

  function suggestNextCell(assignment: HeuristicAssignment) {
    let best: SuggestedCell | null = null
    let bestScore = Number.NEGATIVE_INFINITY

    for (const day of settings.value.activeWeekdays) {
      for (const hourSlot of activeHourSlots.value) {
        if (!isCellAvailable(assignment, day, hourSlot)) continue

        const score = scoreCell(assignment, day, hourSlot)
        if (score > bestScore) {
          bestScore = score
          best = { day, hourSlot, assignmentId: assignment.id }
        }
      }
    }

    suggestedCell.value = best
    if (!best) {
      notify.warning(t('schedule.heuristic.noCellTitle'), t('schedule.heuristic.noCellDescription'))
    }
    return best
  }

  function isSuggested(day: Weekday, hourSlot: HourSlot) {
    return suggestedCell.value?.day === day && suggestedCell.value?.hourSlot === hourSlot
  }

  return {
    suggestedCell,
    suggestNextCell,
    isSuggested
  }
}
