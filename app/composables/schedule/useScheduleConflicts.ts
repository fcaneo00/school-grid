export function useScheduleConflicts(conflictEntries: Ref<ScheduleEntryWithDetails[]>) {
  const { teachers } = useTeachers()

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

  function hasTeacherConflict(teacherId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.day === day && entry.hour_slot === hourSlot && entry.teacher_id === teacherId)
  }

  function hasClassConflict(schoolClassId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.day === day && entry.hour_slot === hourSlot && entry.school_class_id === schoolClassId)
  }

  return {
    isDayOff,
    violatesTimeConstraint,
    hasTeacherConflict,
    hasClassConflict
  }
}
