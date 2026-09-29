export function useDataRefresh() {
  const { fetchTeachers } = useTeachers()
  const { fetchSchoolClasses } = useSchoolClasses()
  const { fetchSections } = useSections()
  const { fetchStudyTracks } = useStudyTracks()
  const { fetchAssignments } = useAssignments()
  const { fetchEntries } = useSchedule()
  const { fetchSettings } = useAppSettings()
  const { discardAllDrafts } = useScheduleDraft()

  async function refreshAllData() {
    discardAllDrafts()
    await Promise.all([
      fetchTeachers(),
      fetchSchoolClasses(),
      fetchSections(),
      fetchStudyTracks(),
      fetchAssignments(),
      fetchEntries(),
      fetchSettings()
    ])
  }

  return {
    refreshAllData
  }
}
