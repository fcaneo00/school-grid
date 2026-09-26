interface DraftEntryInput {
  assignmentId: number
  teacherId: number
  teacherFirstName: string
  teacherLastName: string
  schoolClassId: number
}

export function useScheduleDraft() {
  const { t } = useI18n()
  const notify = useNotification()
  const { entries, replaceAllEntries } = useSchedule()

  const draft = useState<ScheduleEntryWithDetails[] | null>('schedule-draft', () => null)

  let nextTempId = -1

  const isDirty = computed(() => draft.value !== null)

  function currentDraft() {
    if (draft.value === null) {
      draft.value = entries.value.map((entry) => ({ ...entry }))
    }
    return draft.value
  }

  function effectiveEntries() {
    return draft.value ?? entries.value
  }

  function placeDraftEntry(input: DraftEntryInput, day: Weekday, hourSlot: HourSlot) {
    currentDraft().push({
      id: nextTempId--,
      assignment_id: input.assignmentId,
      day,
      hour_slot: hourSlot,
      teacher_id: input.teacherId,
      school_class_id: input.schoolClassId,
      teacher_first_name: input.teacherFirstName,
      teacher_last_name: input.teacherLastName
    })
  }

  function placeDraftEntries(input: DraftEntryInput, day: Weekday, hourSlots: HourSlot[]) {
    for (const hourSlot of hourSlots) {
      placeDraftEntry(input, day, hourSlot)
    }
  }

  function removeDraftEntries(entryIds: number[]) {
    draft.value = currentDraft().filter((entry) => !entryIds.includes(entry.id))
  }

  function removeDraftBlock(day: Weekday, assignmentId: number) {
    draft.value = currentDraft().filter((entry) => !(entry.day === day && entry.assignment_id === assignmentId))
  }

  async function saveDraft() {
    const pending = effectiveEntries().map((entry) => ({
      assignmentId: entry.assignment_id,
      teacherId: entry.teacher_id,
      schoolClassId: entry.school_class_id,
      day: entry.day,
      hourSlot: entry.hour_slot
    }))
    const success = await replaceAllEntries(pending)
    if (!success) return false
    draft.value = null
    notify.success(t('schedule.savedTitle'), '')
    return true
  }

  function revertDraft() {
    draft.value = null
    notify.success(t('schedule.revertedTitle'), '')
  }

  function discardAllDrafts() {
    draft.value = null
  }

  return {
    effectiveEntries,
    isDirty,
    placeDraftEntry,
    placeDraftEntries,
    removeDraftEntries,
    removeDraftBlock,
    saveDraft,
    revertDraft,
    discardAllDrafts
  }
}
