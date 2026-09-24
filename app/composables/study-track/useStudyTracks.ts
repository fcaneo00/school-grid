export interface StudyTrack {
  id: number
  name: string
}

export function useStudyTracks() {
  const { t } = useI18n()
  const notify = useNotification()
  const { schoolClasses, fetchSchoolClasses } = useSchoolClasses()
  const studyTracks = useState<StudyTrack[]>('study-tracks', () => [])
  const loading = useState('study-tracks-loading', () => false)

  async function fetchStudyTracks() {
    loading.value = true
    try {
      const db = await getDb()
      studyTracks.value = await db.select<StudyTrack[]>('SELECT * FROM study_track ORDER BY name')
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function addStudyTrack(studyTrack: Omit<StudyTrack, 'id'>) {
    const db = await getDb()
    await db.execute('INSERT INTO study_track (name) VALUES ($1)', [studyTrack.name])
    await fetchStudyTracks()
    notify.success(t('general.added'), studyTrack.name)
  }

  async function updateStudyTrack(id: number, studyTrack: Omit<StudyTrack, 'id'>) {
    const db = await getDb()
    await db.execute('UPDATE study_track SET name = $1 WHERE id = $2', [studyTrack.name, id])
    await fetchStudyTracks()
    notify.success(t('general.updated'), studyTrack.name)
  }

  async function deleteStudyTrack(id: number) {
    const studyTrack = studyTracks.value.find((studyTrack) => studyTrack.id === id)
    const name = studyTrack?.name ?? ''
    try {
      const db = await getDb()
      await db.execute('DELETE FROM study_track WHERE id = $1', [id])
      await fetchStudyTracks()
      notify.success(t('general.deleted'), name)
    } catch (e) {
      if (!isForeignKeyError(e)) {
        notify.error(t('general.errorTitle'), String(e))
        return
      }
      await fetchSchoolClasses()
      const usagesText = schoolClasses.value
        .filter((schoolClass) => schoolClass.study_track_id === id)
        .map((schoolClass) => `${schoolClass.year}${schoolClass.section}`)
        .join(', ')
      notify.error(
        t('general.deleteBlockedTitle', { name }),
        t('general.deleteBlockedDescription', { usages: usagesText })
      )
    }
  }

  return {
    studyTracks,
    loading,
    fetchStudyTracks,
    addStudyTrack,
    updateStudyTrack,
    deleteStudyTrack
  }
}
