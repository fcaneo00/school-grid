export function useSchoolClassFilters() {
  const filters = useState('school-class-filters', () => ({
    year: '',
    section: '',
    study_track_name: ''
  }))

  return { filters }
}
