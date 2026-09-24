export function useSchoolClassFilters() {
  const filters = useState('school-class-filters', () => ({
    year: undefined as number | undefined,
    section_name: '',
    study_track_name: ''
  }))

  return { filters }
}
