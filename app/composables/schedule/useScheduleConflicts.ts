export function useScheduleConflicts(conflictEntries: Ref<ScheduleEntryWithDetails[]>) {
  const { teachers } = useTeachers()

  function isDayOff(teacherId: number, day: Weekday) {
    return teachers.value.find((teacher) => teacher.id === teacherId)?.day_off.includes(day) ?? false
  }

  function hasTeacherConflict(teacherId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.day === day && entry.hour_slot === hourSlot && entry.teacher_id === teacherId)
  }

  function hasClassConflict(schoolClassId: number, day: Weekday, hourSlot: HourSlot) {
    return conflictEntries.value.some((entry) => entry.day === day && entry.hour_slot === hourSlot && entry.school_class_id === schoolClassId)
  }

  return {
    isDayOff,
    hasTeacherConflict,
    hasClassConflict
  }
}
