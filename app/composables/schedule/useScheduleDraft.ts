interface DraftEntryInput {
  assignmentId: number
  teacherId: number
  teacherFirstName: string
  teacherLastName: string
}

export function useScheduleDraft() {
  const { t } = useI18n()
  const notify = useNotification()
  const { entries, replaceClassEntries } = useSchedule()

  const draftsByClass = useState<Map<number, ScheduleEntryWithDetails[]>>('schedule-drafts-by-class', () => new Map())
  const dirtyClassIds = useState<number[]>('schedule-dirty-class-ids', () => [])

  let nextTempId = -1

  const hasUnsavedDrafts = computed(() => dirtyClassIds.value.length > 0)

  function savedEntriesForClass(schoolClassId: number) {
    return entries.value.filter((entry) => entry.school_class_id === schoolClassId)
  }

  function draftFor(schoolClassId: number) {
    if (!draftsByClass.value.has(schoolClassId)) {
      draftsByClass.value.set(schoolClassId, savedEntriesForClass(schoolClassId).map((entry) => ({ ...entry })))
    }
    return draftsByClass.value.get(schoolClassId)!
  }

  function effectiveEntries(schoolClassId: number) {
    return draftsByClass.value.get(schoolClassId) ?? savedEntriesForClass(schoolClassId)
  }

  function conflictCheckEntries(schoolClassId: number) {
    const otherClasses = entries.value.filter((entry) => entry.school_class_id !== schoolClassId)
    return [...otherClasses, ...effectiveEntries(schoolClassId)]
  }

  function isDirty(schoolClassId: number) {
    return dirtyClassIds.value.includes(schoolClassId)
  }

  function markDirty(schoolClassId: number) {
    if (!dirtyClassIds.value.includes(schoolClassId)) {
      dirtyClassIds.value = [...dirtyClassIds.value, schoolClassId]
    }
  }

  function clearDirty(schoolClassId: number) {
    dirtyClassIds.value = dirtyClassIds.value.filter((id) => id !== schoolClassId)
  }

  function placeDraftEntry(schoolClassId: number, input: DraftEntryInput, day: Weekday, hourSlot: HourSlot) {
    draftFor(schoolClassId).push({
      id: nextTempId--,
      assignment_id: input.assignmentId,
      day,
      hour_slot: hourSlot,
      teacher_id: input.teacherId,
      school_class_id: schoolClassId,
      teacher_first_name: input.teacherFirstName,
      teacher_last_name: input.teacherLastName
    })
    markDirty(schoolClassId)
  }

  function placeDraftEntries(schoolClassId: number, input: DraftEntryInput, day: Weekday, hourSlots: HourSlot[]) {
    for (const hourSlot of hourSlots) {
      placeDraftEntry(schoolClassId, input, day, hourSlot)
    }
  }

  function removeDraftEntries(schoolClassId: number, entryIds: number[]) {
    const draft = draftFor(schoolClassId)
    draftsByClass.value.set(schoolClassId, draft.filter((entry) => !entryIds.includes(entry.id)))
    markDirty(schoolClassId)
  }

  function removeDraftBlock(schoolClassId: number, day: Weekday, assignmentId: number) {
    const draft = draftFor(schoolClassId)
    draftsByClass.value.set(schoolClassId, draft.filter((entry) => !(entry.day === day && entry.assignment_id === assignmentId)))
    markDirty(schoolClassId)
  }

  async function saveDraft(schoolClassId: number) {
    const draft = effectiveEntries(schoolClassId).map((entry) => ({
      assignmentId: entry.assignment_id,
      teacherId: entry.teacher_id,
      day: entry.day,
      hourSlot: entry.hour_slot
    }))
    const success = await replaceClassEntries(schoolClassId, draft)
    if (!success) return false
    draftsByClass.value.delete(schoolClassId)
    clearDirty(schoolClassId)
    notify.success(t('schedule.savedTitle'), '')
    return true
  }

  function revertDraft(schoolClassId: number) {
    draftsByClass.value.delete(schoolClassId)
    clearDirty(schoolClassId)
    notify.success(t('schedule.revertedTitle'), '')
  }

  function discardAllDrafts() {
    draftsByClass.value = new Map()
    dirtyClassIds.value = []
  }

  return {
    effectiveEntries,
    conflictCheckEntries,
    isDirty,
    hasUnsavedDrafts,
    placeDraftEntry,
    placeDraftEntries,
    removeDraftEntries,
    removeDraftBlock,
    saveDraft,
    revertDraft,
    discardAllDrafts
  }
}
