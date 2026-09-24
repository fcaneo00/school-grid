export interface Teacher {
  id: number
  first_name: string
  last_name: string
}

export function useTeachers() {
  const { t } = useI18n()
  const notify = useNotification()
  const { byTeacher } = useAssignmentUsages()
  const teachers = useState<Teacher[]>('teachers', () => [])
  const loading = useState('teachers-loading', () => false)

  function displayName(teacher: Pick<Teacher, 'first_name' | 'last_name'>) {
    return `${teacher.last_name} ${teacher.first_name}`
  }

  async function fetchTeachers() {
    loading.value = true
    try {
      const db = await getDb()
      teachers.value = await db.select<Teacher[]>(
        'SELECT * FROM teacher ORDER BY last_name, first_name'
      )
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function addTeacher(teacher: Omit<Teacher, 'id'>) {
    const db = await getDb()
    await db.execute(
      'INSERT INTO teacher (first_name, last_name) VALUES ($1, $2)',
      [teacher.first_name, teacher.last_name]
    )
    await fetchTeachers()
    notify.success(t('general.added'), displayName(teacher))
  }

  async function updateTeacher(id: number, teacher: Omit<Teacher, 'id'>) {
    const db = await getDb()
    await db.execute(
      'UPDATE teacher SET first_name = $1, last_name = $2 WHERE id = $3',
      [teacher.first_name, teacher.last_name, id]
    )
    await fetchTeachers()
    notify.success(t('general.updated'), displayName(teacher))
  }

  async function deleteTeacher(id: number) {
    const teacher = teachers.value.find((teacher) => teacher.id === id)
    const name = teacher ? displayName(teacher) : ''
    try {
      const db = await getDb()
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
        .map((assignment) => `${assignment.subject_name} (${formatSchoolClassName({
          year: assignment.school_class_year,
          section_name: assignment.school_class_section_name,
          study_track_name: assignment.school_class_study_track_name
        })})`)
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
