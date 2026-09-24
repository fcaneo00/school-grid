export interface Assignment {
  id: number
  teacher_id: number
  school_class_id: number
  subject_id: number
  weekly_hours: number
}

export interface AssignmentWithDetails extends Assignment {
  teacher_first_name: string
  teacher_last_name: string
  school_class_year: number
  school_class_section_name: string | null
  school_class_study_track_name: string | null
  subject_name: string
}

export function useAssignments() {
  const { t } = useI18n()
  const notify = useNotification()
  const assignments = useState<AssignmentWithDetails[]>('assignments', () => [])
  const loading = useState('assignments-loading', () => false)

  function displayName(assignment: AssignmentWithDetails) {
    const schoolClassName = formatSchoolClassName({
      year: assignment.school_class_year,
      section_name: assignment.school_class_section_name,
      study_track_name: assignment.school_class_study_track_name
    })
    return `${assignment.teacher_last_name} ${assignment.teacher_first_name} - ${assignment.subject_name} (${schoolClassName})`
  }

  async function fetchAssignments() {
    loading.value = true
    try {
      const db = await getDb()
      assignments.value = await db.select<AssignmentWithDetails[]>(`
        SELECT
          assignment.id,
          assignment.teacher_id,
          assignment.school_class_id,
          assignment.subject_id,
          assignment.weekly_hours,
          teacher.first_name AS teacher_first_name,
          teacher.last_name AS teacher_last_name,
          CAST(school_class.year AS INTEGER) AS school_class_year,
          section.name AS school_class_section_name,
          study_track.name AS school_class_study_track_name,
          subject.name AS subject_name
        FROM assignment
        JOIN teacher ON teacher.id = assignment.teacher_id
        JOIN school_class ON school_class.id = assignment.school_class_id
        LEFT JOIN section ON section.id = school_class.section_id
        LEFT JOIN study_track ON study_track.id = school_class.study_track_id
        JOIN subject ON subject.id = assignment.subject_id
        ORDER BY teacher.last_name, teacher.first_name
      `)
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function addAssignment(assignment: Omit<Assignment, 'id'>) {
    const db = await getDb()
    const result = await db.execute(
      'INSERT INTO assignment (teacher_id, school_class_id, subject_id, weekly_hours) VALUES ($1, $2, $3, $4)',
      [assignment.teacher_id, assignment.school_class_id, assignment.subject_id, assignment.weekly_hours]
    )
    await fetchAssignments()
    const created = assignments.value.find((a) => a.id === result.lastInsertId)
    notify.success(t('general.added'), created ? displayName(created) : '')
  }

  async function updateAssignment(id: number, assignment: Omit<Assignment, 'id'>) {
    const db = await getDb()
    await db.execute(
      'UPDATE assignment SET teacher_id = $1, school_class_id = $2, subject_id = $3, weekly_hours = $4 WHERE id = $5',
      [assignment.teacher_id, assignment.school_class_id, assignment.subject_id, assignment.weekly_hours, id]
    )
    await fetchAssignments()
    const updated = assignments.value.find((a) => a.id === id)
    notify.success(t('general.updated'), updated ? displayName(updated) : '')
  }

  async function deleteAssignment(id: number) {
    const assignment = assignments.value.find((assignment) => assignment.id === id)
    const name = assignment ? displayName(assignment) : ''
    try {
      const db = await getDb()
      await db.execute('DELETE FROM assignment WHERE id = $1', [id])
      await fetchAssignments()
      notify.success(t('general.deleted'), name)
    } catch (e) {
      if (!isForeignKeyError(e)) {
        notify.error(t('general.errorTitle'), String(e))
        return
      }
      notify.error(t('general.deleteBlockedTitle', { name }), t('general.deleteBlockedGeneric'))
    }
  }

  return {
    assignments,
    loading,
    fetchAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment
  }
}
