import type { FormSubmitEvent } from '@nuxt/ui'

export function useStudyTrackForm(id: Ref<number | undefined>) {
  const { t } = useI18n()
  const { studyTracks, fetchStudyTracks, addStudyTrack, updateStudyTrack } = useStudyTracks()

  const schema = createStudyTrackFormSchema(t)

  const state = reactive<Partial<StudyTrackFormSchema>>({
    name: ''
  })

  watch(id, async (currentId) => {
    if (currentId === undefined) return
    await fetchStudyTracks()
    const studyTrack = studyTracks.value.find((studyTrack) => studyTrack.id === currentId)
    if (!studyTrack) return
    state.name = studyTrack.name
  }, { immediate: true })

  async function onSubmit(event: FormSubmitEvent<StudyTrackFormSchema>) {
    if (id.value === undefined) {
      await addStudyTrack(event.data)
    } else {
      await updateStudyTrack(id.value, event.data)
    }
    await navigateTo('/study-tracks')
  }

  return {
    schema,
    state,
    onSubmit
  }
}
