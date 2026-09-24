import type { FormSubmitEvent } from '@nuxt/ui'

export function useSchoolClassForm(id?: number) {
  const { t } = useI18n()
  const { schoolClasses, fetchSchoolClasses, addSchoolClass, updateSchoolClass } = useSchoolClasses()
  const { studyTracks, fetchStudyTracks } = useStudyTracks()

  const isEditing = computed(() => id !== undefined)
  const submitLabel = computed(() => isEditing.value ? t('table.save') : t('form.submit'))

  const schema = createSchoolClassFormSchema(t)

  const studyTrackOptions = computed(() =>
    studyTracks.value.map((studyTrack) => ({
      label: studyTrack.name,
      value: studyTrack.id
    }))
  )

  const state = reactive<Partial<SchoolClassFormSchema>>({
    year: 1,
    section: '',
    study_track_id: undefined
  })

  onMounted(async () => {
    fetchStudyTracks()
    if (id === undefined) return
    await fetchSchoolClasses()
    const schoolClass = schoolClasses.value.find((schoolClass) => schoolClass.id === id)
    if (!schoolClass) return
    state.year = schoolClass.year
    state.section = schoolClass.section
    state.study_track_id = schoolClass.study_track_id ?? undefined
  })

  async function onSubmit(event: FormSubmitEvent<SchoolClassFormSchema>) {
    if (id === undefined) {
      await addSchoolClass(event.data)
    } else {
      await updateSchoolClass(id, event.data)
    }
    await navigateTo('/classes')
  }

  return {
    schema,
    state,
    isEditing,
    submitLabel,
    studyTrackOptions,
    onSubmit
  }
}
