export interface Subject {
  id: number
  name: string
}

export function useSubjects() {
  const { t } = useI18n()
  const notify = useNotification()
  const subjects = useState<Subject[]>('subjects', () => [])
  const loading = useState('subjects-loading', () => false)

  async function fetchSubjects() {
    loading.value = true
    try {
      const db = await getDb()
      subjects.value = await db.select<Subject[]>('SELECT * FROM subject ORDER BY name')
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function addSubject(subject: Omit<Subject, 'id'>) {
    const db = await getDb()
    await db.execute('INSERT INTO subject (name) VALUES ($1)', [subject.name])
    await fetchSubjects()
    notify.success(t('general.added'), subject.name)
  }

  async function updateSubject(id: number, subject: Omit<Subject, 'id'>) {
    const db = await getDb()
    await db.execute('UPDATE subject SET name = $1 WHERE id = $2', [subject.name, id])
    await fetchSubjects()
    notify.success(t('general.updated'), subject.name)
  }

  async function deleteSubject(id: number) {
    const subject = subjects.value.find((subject) => subject.id === id)
    const name = subject?.name ?? ''
    try {
      const db = await getDb()
      await db.execute('DELETE FROM subject WHERE id = $1', [id])
      await fetchSubjects()
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
    subjects,
    loading,
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject
  }
}
