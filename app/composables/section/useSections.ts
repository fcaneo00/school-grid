export interface Section {
  id: number
  name: string
}

export function useSections() {
  const { t } = useI18n()
  const notify = useNotification()
  const { schoolClasses, fetchSchoolClasses } = useSchoolClasses()
  const sections = useState<Section[]>('sections', () => [])
  const loading = useState('sections-loading', () => false)

  async function fetchSections() {
    loading.value = true
    try {
      const db = await getDb()
      sections.value = await db.select<Section[]>('SELECT * FROM section ORDER BY name')
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function addSection(section: Omit<Section, 'id'>) {
    const db = await getDb()
    await db.execute('INSERT INTO section (name) VALUES ($1)', [section.name])
    await fetchSections()
    notify.success(t('general.added'), section.name)
  }

  async function updateSection(id: number, section: Omit<Section, 'id'>) {
    const db = await getDb()
    await db.execute('UPDATE section SET name = $1 WHERE id = $2', [section.name, id])
    await fetchSections()
    notify.success(t('general.updated'), section.name)
  }

  async function deleteSection(id: number) {
    const section = sections.value.find((section) => section.id === id)
    const name = section?.name ?? ''
    try {
      const db = await getDb()
      await db.execute('DELETE FROM section WHERE id = $1', [id])
      await fetchSections()
      notify.success(t('general.deleted'), name)
    } catch (e) {
      if (!isForeignKeyError(e)) {
        notify.error(t('general.errorTitle'), String(e))
        return
      }
      await fetchSchoolClasses()
      const usagesText = schoolClasses.value
        .filter((schoolClass) => schoolClass.section_id === id)
        .map((schoolClass) => `${schoolClass.year}${schoolClass.section_name}`)
        .join(', ')
      notify.error(
        t('general.deleteBlockedTitle', { name }),
        t('general.deleteBlockedDescription', { usages: usagesText })
      )
    }
  }

  return {
    sections,
    loading,
    fetchSections,
    addSection,
    updateSection,
    deleteSection
  }
}
