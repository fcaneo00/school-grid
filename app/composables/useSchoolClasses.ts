export interface SchoolClass {
  id: number
  name: string
  section: string
}

export function useSchoolClasses() {
  const schoolClasses = ref<SchoolClass[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSchoolClasses() {
    loading.value = true
    error.value = null
    try {
      const db = await getDb()
      schoolClasses.value = await db.select<SchoolClass[]>(
        'SELECT * FROM school_class ORDER BY name, section'
      )
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  async function addSchoolClass(schoolClass: Omit<SchoolClass, 'id'>) {
    const db = await getDb()
    await db.execute(
      'INSERT INTO school_class (name, section) VALUES ($1, $2)',
      [schoolClass.name, schoolClass.section]
    )
    await fetchSchoolClasses()
  }

  async function updateSchoolClass(id: number, schoolClass: Omit<SchoolClass, 'id'>) {
    const db = await getDb()
    await db.execute(
      'UPDATE school_class SET name = $1, section = $2 WHERE id = $3',
      [schoolClass.name, schoolClass.section, id]
    )
    await fetchSchoolClasses()
  }

  async function deleteSchoolClass(id: number) {
    const db = await getDb()
    await db.execute('DELETE FROM school_class WHERE id = $1', [id])
    await fetchSchoolClasses()
  }

  return {
    schoolClasses,
    loading,
    error,
    fetchSchoolClasses,
    addSchoolClass,
    updateSchoolClass,
    deleteSchoolClass
  }
}
