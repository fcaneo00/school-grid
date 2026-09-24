export interface SchoolClass {
  id: number
  year: number
  section: string
  study_track_id: number | null
}

export interface SchoolClassWithDetails extends SchoolClass {
  study_track_name: string | null
}

export function useSchoolClasses() {
  const { t } = useI18n()
  const notify = useNotification()
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
          school_class.section,
          school_class.study_track_id,
          study_track.name AS study_track_name
        FROM school_class
        LEFT JOIN study_track ON study_track.id = school_class.study_track_id
        ORDER BY school_class.year, school_class.section
      `)
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function addSchoolClass(schoolClass: Omit<SchoolClass, 'id'>) {
    const db = await getDb()
    const result = await db.execute(
      'INSERT INTO school_class (year, section, study_track_id) VALUES ($1, $2, $3)',
      [schoolClass.year, schoolClass.section, schoolClass.study_track_id]
    )
    await fetchSchoolClasses()
    const created = schoolClasses.value.find((c) => c.id === result.lastInsertId)
    notify.success(t('general.added'), created ? formatSchoolClassName(created) : '')
  }

  async function updateSchoolClass(id: number, schoolClass: Omit<SchoolClass, 'id'>) {
    const db = await getDb()
    await db.execute(
      'UPDATE school_class SET year = $1, section = $2, study_track_id = $3 WHERE id = $4',
      [schoolClass.year, schoolClass.section, schoolClass.study_track_id, id]
    )
    await fetchSchoolClasses()
    const updated = schoolClasses.value.find((c) => c.id === id)
    notify.success(t('general.updated'), updated ? formatSchoolClassName(updated) : '')
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
      notify.error(t('general.deleteBlockedTitle', { name }), t('general.deleteBlockedGeneric'))
    }
  }

  return {
    schoolClasses,
    loading,
    fetchSchoolClasses,
    addSchoolClass,
    updateSchoolClass,
    deleteSchoolClass
  }
}
