export interface SchoolClass {
  id: number
  year: number
  section_id: number | null
  study_track_id: number | null
}

export interface SchoolClassWithDetails extends SchoolClass {
  section_name: string | null
  study_track_name: string | null
}

export function useSchoolClasses() {
  const { t } = useI18n()
  const notify = useNotification()
  const { bySchoolClass } = useAssignmentUsages()
  const schoolClasses = useState<SchoolClassWithDetails[]>('school-classes', () => [])
  const loading = useState('school-classes-loading', () => false)

  async function fetchSchoolClasses() {
    loading.value = true
    try {
      const db = await getDb()
      schoolClasses.value = await db.select<SchoolClassWithDetails[]>(`
        SELECT
          school_class.id,
          CAST(school_class.year AS INTEGER) AS year,
          school_class.section_id,
          school_class.study_track_id,
          section.name AS section_name,
          study_track.name AS study_track_name
        FROM school_class
        LEFT JOIN section ON section.id = school_class.section_id
        LEFT JOIN study_track ON study_track.id = school_class.study_track_id
        ORDER BY school_class.year, section.name
      `)
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function insertSchoolClass(schoolClass: Omit<SchoolClass, 'id'>) {
    const db = await getDb()
    const result = await db.execute(
      'INSERT INTO school_class (year, section_id, study_track_id) VALUES ($1, $2, $3)',
      [schoolClass.year, schoolClass.section_id, schoolClass.study_track_id]
    )
    return result.lastInsertId
  }

  async function addSchoolClasses(items: Omit<SchoolClass, 'id'>[]) {
    const ids: (number | undefined)[] = []
    try {
      for (const item of items) {
        ids.push(await insertSchoolClass(item))
      }
    } catch (e) {
      await fetchSchoolClasses()
      if (isUniqueConstraintError(e)) {
        notify.error(t('schoolClasses.duplicateTitle'), t('schoolClasses.duplicateDescription'))
      } else {
        notify.error(t('general.errorTitle'), String(e))
      }
      return false
    }
    await fetchSchoolClasses()
    if (items.length === 1) {
      const created = schoolClasses.value.find((c) => c.id === ids[0])
      notify.success(t('general.added'), created ? formatSchoolClassName(created) : '')
      return true
    }
    const names = schoolClasses.value
      .filter((c) => ids.includes(c.id))
      .map((c) => formatSchoolClassName(c))
      .join(', ')
    notify.success(t('general.addedBatch', { count: items.length }), names)
    return true
  }

  async function updateSchoolClass(id: number, schoolClass: Omit<SchoolClass, 'id'>) {
    const db = await getDb()
    try {
      await db.execute(
        'UPDATE school_class SET year = $1, section_id = $2, study_track_id = $3 WHERE id = $4',
        [schoolClass.year, schoolClass.section_id, schoolClass.study_track_id, id]
      )
    } catch (e) {
      if (isUniqueConstraintError(e)) {
        notify.error(t('schoolClasses.duplicateTitle'), t('schoolClasses.duplicateDescription'))
      } else {
        notify.error(t('general.errorTitle'), String(e))
      }
      return false
    }
    await fetchSchoolClasses()
    const updated = schoolClasses.value.find((c) => c.id === id)
    notify.success(t('general.updated'), updated ? formatSchoolClassName(updated) : '')
    return true
  }

  async function deleteSchoolClass(id: number) {
    const schoolClass = schoolClasses.value.find((schoolClass) => schoolClass.id === id)
    const name = schoolClass ? formatSchoolClassName(schoolClass) : ''
    try {
      const db = await getDb()
      await db.execute('DELETE FROM school_class WHERE id = $1', [id])
      await fetchSchoolClasses()
      notify.success(t('general.deleted'), name)
    } catch (e) {
      if (!isForeignKeyError(e)) {
        notify.error(t('general.errorTitle'), String(e))
        return
      }
      const usages = await bySchoolClass(id)
      const usagesText = usages
        .map((assignment) => `${assignment.teacher_last_name} ${assignment.teacher_first_name}`)
        .join(', ')
      notify.error(
        t('general.deleteBlockedTitle', { name }),
        t('general.deleteBlockedDescription', { usages: usagesText })
      )
    }
  }

  return {
    schoolClasses,
    loading,
    fetchSchoolClasses,
    addSchoolClasses,
    updateSchoolClass,
    deleteSchoolClass
  }
}
