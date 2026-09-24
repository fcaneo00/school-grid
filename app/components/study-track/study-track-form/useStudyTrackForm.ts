import type { FormSubmitEvent } from '@nuxt/ui'

export function useStudyTrackForm(id?: number) {
  const { t } = useI18n()
  const { studyTracks, fetchStudyTracks, addStudyTrack, updateStudyTrack } = useStudyTracks()

  const schema = createStudyTrackFormSchema(t)

  const state = reactive<Partial<StudyTrackFormSchema>>({
    name: ''
  })

  onMounted(async () => {
    if (id === undefined) return
    await fetchStudyTracks()
    const studyTrack = studyTracks.value.find((studyTrack) => studyTrack.id === id)
    if (!studyTrack) return
    state.name = studyTrack.name
  })

  async function onSubmit(event: FormSubmitEvent<StudyTrackFormSchema>) {
    if (id === undefined) {
      await addStudyTrack(event.data)
    } else {
      await updateStudyTrack(id, event.data)
    }
    await navigateTo('/study-tracks')
  }

  return {
    schema,
    state,
    onSubmit
  }
}
