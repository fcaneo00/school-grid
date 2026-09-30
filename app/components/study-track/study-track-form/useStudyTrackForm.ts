import type { FormSubmitEvent } from '@nuxt/ui'
import { createStudyTrackFormSchema, type StudyTrackFormSchema } from './studyTrackFormHelper'

export function useStudyTrackForm(id: Ref<number | undefined>) {
  const { t } = useI18n()
  const { studyTracks, fetchStudyTracks, addStudyTrack, updateStudyTrack } = useStudyTracks()

  const schema = createStudyTrackFormSchema(t)

  const state = reactive<Partial<StudyTrackFormSchema>>({
    name: ''
  })

  const nameModel = computed({
    get: () => state.name ?? '',
    set: (value: string) => {
      state.name = capitalizeFirstLetter(value)
    }
  })

  watch(id, async (currentId) => {
    if (currentId === undefined) return
    await fetchStudyTracks()
    const studyTrack = studyTracks.value.find((studyTrack) => studyTrack.id === currentId)
    if (!studyTrack) return
    state.name = studyTrack.name
  }, { immediate: true })

  async function onSubmit(event: FormSubmitEvent<StudyTrackFormSchema>) {
    const success = id.value === undefined
      ? await addStudyTrack(event.data)
      : await updateStudyTrack(id.value, event.data)
    if (success) {
      await navigateTo('/study-tracks')
    }
  }

  return {
    schema,
    state,
    nameModel,
    onSubmit
  }
}
