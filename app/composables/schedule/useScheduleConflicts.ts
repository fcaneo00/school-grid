export function useScheduleConflicts(conflictEntries: Ref<ScheduleEntryWithDetails[]>) {
  const { teachers } = useTeachers()
  const { activeHourSlots } = useAppSettings()

  function isDayOff(teacherId: number, day: Weekday) {
    return teachers.value.find((teacher) => teacher.id === teacherId)?.day_off.includes(day) ?? false
  }

  function violatesTimeConstraint(teacherId: number, day: Weekday, hourSlot: HourSlot) {
    const timeConstraints = teachers.value.find((teacher) => teacher.id === teacherId)?.time_constraints ?? []
    return timeConstraints
      .filter((constraint) => constraint.day === day)
      .some((constraint) =>
        (constraint.not_before !== undefined && hourSlot < constraint.not_before)
        || (constraint.not_after !== undefined && hourSlot > constraint.not_after)
      )
  }

  function violatesMaxConsecutiveHours(teacherId: number, day: Weekday, hourSlot: HourSlot) {
    const maxConsecutiveHours = teachers.value.find((teacher) => teacher.id === teacherId)?.max_consecutive_hours
    if (maxConsecutiveHours === undefined) return false

    const occupiedHours = new Set(
      conflictEntries.value
        .filter((entry) => entry.teacher_id === teacherId && entry.day === day)
        .map((entry) => entry.hour_slot)
    )
    occupiedHours.add(hourSlot)

    let runLength = 0
    for (const slot of activeHourSlots.value) {
      runLength = occupiedHours.has(slot) ? runLength + 1 : 0
      if (runLength > maxConsecutiveHours) return true
    }
    return false
  }

  function hasTeacherConflict(teacherId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.day === day && entry.hour_slot === hourSlot && entry.teacher_id === teacherId)
  }

  function hasClassConflict(schoolClassId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.day === day && entry.hour_slot === hourSlot && entry.school_class_id === schoolClassId)
  }

  return {
    isDayOff,
    violatesTimeConstraint,
    violatesMaxConsecutiveHours,
    hasTeacherConflict,
    hasClassConflict
  }
}
