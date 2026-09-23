export interface Teacher {
  id: number
  first_name: string
  last_name: string
}

export function useTeachers() {
  const teachers = ref<Teacher[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTeachers() {
    loading.value = true
    error.value = null
    try {
      const db = await getDb()
      teachers.value = await db.select<Teacher[]>(
        'SELECT * FROM teacher ORDER BY last_name, first_name'
      )
    } catch (e) {
      error.value = String(e)
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
  }

  async function updateTeacher(id: number, teacher: Omit<Teacher, 'id'>) {
    const db = await getDb()
    await db.execute(
      'UPDATE teacher SET first_name = $1, last_name = $2 WHERE id = $3',
      [teacher.first_name, teacher.last_name, id]
    )
    await fetchTeachers()
  }

  async function deleteTeacher(id: number) {
    const db = await getDb()
    await db.execute('DELETE FROM teacher WHERE id = $1', [id])
    await fetchTeachers()
  }

  return {
    teachers,
    loading,
    error,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher
  }
}
