export interface Teacher {
  id: number
  first_name: string
  last_name: string
  max_consecutive_hours?: number
}

export interface TeacherWithDetails extends Teacher {
  day_off: Weekday[]
  unavailable_hours: TeacherUnavailableHours[]
}

export function useTeachers() {
  const { t } = useI18n()
  const notify = useNotification()
  const { byTeacher } = useAssignmentUsages()
  const { deleteDayOff } = useTeacherPreference()
  const { deleteUnavailableHours } = useTeacherUnavailableHours()
  const teachers = useState<TeacherWithDetails[]>('teachers', () => [])
  const loading = useState('teachers-loading', () => false)

  function displayName(teacher: Pick<Teacher, 'first_name' | 'last_name'>) {
    return `${teacher.last_name} ${teacher.first_name}`
  }

  function groupUnavailableHours(rows: { teacher_id: number, day: Weekday, hour_slot: HourSlot }[], teacherId: number): TeacherUnavailableHours[] {
    const hoursByDay = new Map<Weekday, HourSlot[]>()
    for (const row of rows) {
      if (row.teacher_id !== teacherId) continue
      const hours = hoursByDay.get(row.day) ?? []
      hours.push(row.hour_slot)
      hoursByDay.set(row.day, hours)
    }
    return Array.from(hoursByDay, ([day, hours]) => ({ day, hours }))
  }

  async function fetchTeachers() {
    loading.value = true
    try {
      const db = await getDb()
      const [rawTeachers, preferences, unavailableHours] = await Promise.all([
        db.select<(Omit<Teacher, 'max_consecutive_hours'> & { max_consecutive_hours: number | null })[]>(
          'SELECT * FROM teacher ORDER BY last_name, first_name'
        ),
        db.select<{ teacher_id: number, day_off: Weekday }[]>('SELECT teacher_id, day_off FROM preference'),
        db.select<{ teacher_id: number, day: Weekday, hour_slot: HourSlot }[]>('SELECT teacher_id, day, hour_slot FROM teacher_unavailable_hour')
      ])
      teachers.value = rawTeachers.map((teacher) => ({
        ...teacher,
        max_consecutive_hours: teacher.max_consecutive_hours ?? undefined,
        day_off: preferences.filter((p) => p.teacher_id === teacher.id).map((p) => p.day_off),
        unavailable_hours: groupUnavailableHours(unavailableHours, teacher.id)
      }))
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function addTeacher(teacher: Omit<Teacher, 'id'>) {
    const db = await getDb()
    const result = await db.execute(
      'INSERT INTO teacher (first_name, last_name, max_consecutive_hours) VALUES ($1, $2, $3)',
      [teacher.first_name, teacher.last_name, teacher.max_consecutive_hours ?? null]
    )
    await fetchTeachers()
    notify.success(t('general.added'), displayName(teacher))
    return result.lastInsertId
  }

  async function updateTeacher(id: number, teacher: Omit<Teacher, 'id'>) {
    const db = await getDb()
    await db.execute(
      'UPDATE teacher SET first_name = $1, last_name = $2, max_consecutive_hours = $3 WHERE id = $4',
      [teacher.first_name, teacher.last_name, teacher.max_consecutive_hours ?? null, id]
    )
    await fetchTeachers()
    notify.success(t('general.updated'), displayName(teacher))
  }

  async function deleteTeacher(id: number) {
    const teacher = teachers.value.find((teacher) => teacher.id === id)
    const name = teacher ? displayName(teacher) : ''
    try {
      const db = await getDb()
      await deleteDayOff(id)
      await deleteUnavailableHours(id)
      await db.execute('DELETE FROM teacher WHERE id = $1', [id])
      await fetchTeachers()
      notify.success(t('general.deleted'), name)
    } catch (e) {
      if (!isForeignKeyError(e)) {
        notify.error(t('general.errorTitle'), String(e))
        return
      }
      const usages = await byTeacher(id)
      const usagesText = usages
        .map((assignment) => formatSchoolClassName({
          year: assignment.school_class_year,
          section_name: assignment.school_class_section_name,
          study_track_name: assignment.school_class_study_track_name
        }))
        .join(', ')
      notify.error(
        t('general.deleteBlockedTitle', { name }),
        t('general.deleteBlockedDescription', { usages: usagesText })
      )
    }
  }

  return {
    teachers,
    loading,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher
  }
}
