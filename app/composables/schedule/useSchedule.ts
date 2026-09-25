export interface ScheduleEntry {
  id: number
  assignment_id: number
  day: Weekday
  hour_slot: HourSlot
  teacher_id: number
  school_class_id: number
}

export interface ScheduleEntryWithDetails extends ScheduleEntry {
  teacher_first_name: string
  teacher_last_name: string
}

export interface ScheduleEntryDraft {
  assignmentId: number
  teacherId: number
  day: Weekday
  hourSlot: HourSlot
}

export function useSchedule() {
  const { t } = useI18n()
  const notify = useNotification()
  const entries = useState<ScheduleEntryWithDetails[]>('schedule-entries', () => [])
  const loading = useState('schedule-entries-loading', () => false)

  async function fetchEntries() {
    loading.value = true
    try {
      const db = await getDb()
      entries.value = await db.select<ScheduleEntryWithDetails[]>(`
        SELECT
          schedule_entry.id,
          schedule_entry.assignment_id,
          schedule_entry.day,
          CAST(schedule_entry.hour_slot AS INTEGER) AS hour_slot,
          schedule_entry.teacher_id,
          schedule_entry.school_class_id,
          teacher.first_name AS teacher_first_name,
          teacher.last_name AS teacher_last_name
        FROM schedule_entry
        JOIN teacher ON teacher.id = schedule_entry.teacher_id
      `)
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function replaceClassEntries(schoolClassId: number, newEntries: ScheduleEntryDraft[]) {
    const db = await getDb()
    try {
      await db.execute('DELETE FROM schedule_entry WHERE school_class_id = $1', [schoolClassId])
      for (const entry of newEntries) {
        await db.execute(
          'INSERT INTO schedule_entry (assignment_id, day, hour_slot, teacher_id, school_class_id) VALUES ($1, $2, $3, $4, $5)',
          [entry.assignmentId, entry.day, entry.hourSlot, entry.teacherId, schoolClassId]
        )
      }
    } catch (e) {
      if (isUniqueConstraintError(e)) {
        notify.error(t('schedule.saveConflictTitle'), t('schedule.saveConflictDescription'))
      } else {
        notify.error(t('general.errorTitle'), String(e))
      }
      await fetchEntries()
      return false
    }
    await fetchEntries()
    return true
  }

  return {
    entries,
    loading,
    fetchEntries,
    replaceClassEntries
  }
}
