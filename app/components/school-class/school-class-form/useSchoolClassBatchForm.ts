export function useSchoolClassBatchForm() {
  const { t } = useI18n()
  const { addSchoolClasses } = useSchoolClasses()
  const { sections, fetchSections } = useSections()
  const { studyTracks, fetchStudyTracks } = useStudyTracks()

  const itemSchema = createSchoolClassFormSchema(t)

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

  function emptyRow(): Partial<SchoolClassFormSchema> {
    return { year: 1, section_id: undefined, study_track_id: undefined, weekly_hours: undefined }
  }

  const state = reactive<{ items: Partial<SchoolClassFormSchema>[] }>({
    items: [emptyRow()]
  })

  onMounted(() => {
    fetchSections()
    fetchStudyTracks()
  })

  function addRow() {
    const last = state.items[state.items.length - 1]
    state.items.push({
      year: last?.year !== undefined && last.year < 5 ? last.year + 1 : last?.year,
      section_id: last?.section_id,
      study_track_id: last?.study_track_id,
      weekly_hours: last?.weekly_hours
    })
  }

  function removeRow(index: number) {
    state.items.splice(index, 1)
  }

  async function onSubmit() {
    const success = await addSchoolClasses(state.items as SchoolClassFormSchema[])
    if (success) {
      await navigateTo('/school-classes')
    }
  }

  return {
    itemSchema,
    state,
    sectionOptions,
    studyTrackOptions,
    addRow,
    removeRow,
    onSubmit
  }
}
