import type { FormSubmitEvent } from '@nuxt/ui'

export function useSchoolClassForm(id: number) {
  const { t } = useI18n()
  const { schoolClasses, fetchSchoolClasses, updateSchoolClass } = useSchoolClasses()
  const { sections, fetchSections } = useSections()
  const { studyTracks, fetchStudyTracks } = useStudyTracks()

  const schema = createSchoolClassFormSchema(t)

  const sectionOptions = computed(() =>
    sections.value.map((section) => ({
      label: section.name,
      value: section.id
    }))
  )

  const studyTrackOptions = computed(() =>
    studyTracks.value.map((studyTrack) => ({
      label: studyTrack.name,
      value: studyTrack.id
    }))
  )

  const state = reactive<Partial<SchoolClassFormSchema>>({
    year: 1,
    section_id: undefined,
    study_track_id: undefined
  })

  onMounted(async () => {
    fetchSections()
    fetchStudyTracks()
    await fetchSchoolClasses()
    const schoolClass = schoolClasses.value.find((schoolClass) => schoolClass.id === id)
    if (!schoolClass) return
    state.year = schoolClass.year
    state.section_id = schoolClass.section_id ?? undefined
    state.study_track_id = schoolClass.study_track_id ?? undefined
  })

  async function onSubmit(event: FormSubmitEvent<SchoolClassFormSchema>) {
    await updateSchoolClass(id, event.data)
    await navigateTo('/school-classes')
  }

  return {
    schema,
    state,
    sectionOptions,
    studyTrackOptions,
    onSubmit
  }
}
