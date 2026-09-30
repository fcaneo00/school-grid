export function useTeacherFilters() {
  const filters = useState('teacher-filters', () => ({
    first_name: '',
    last_name: ''
  }))

  return { filters }
}
