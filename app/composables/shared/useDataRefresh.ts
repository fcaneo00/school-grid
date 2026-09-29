export function useDataRefresh() {
  const { fetchTeachers } = useTeachers()
  const { fetchSchoolClasses } = useSchoolClasses()
  const { fetchSections } = useSections()
  const { fetchStudyTracks } = useStudyTracks()
  const { fetchAssignments } = useAssignments()
  const { fetchEntries } = useSchedule()
  const { fetchSettings } = useAppSettings()
  const { discardAllDrafts } = useScheduleDraft()
  const { reset: resetScheduleSelection } = useScheduleSelection()

  async function refreshAllData() {
    discardAllDrafts()
    resetScheduleSelection()
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
