export function useTeacherFilters() {
  const filters = useState('teacher-filters', () => ({
    first_name: '',
    last_name: '',
    day_off: null as Weekday | null
  }))

  return { filters }
}
