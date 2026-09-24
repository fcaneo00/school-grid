export function useAssignmentFilters() {
  const filters = useState('assignment-filters', () => ({
    teacher: '',
    schoolClass: '',
    subject: '',
    weeklyHours: ''
  }))

  return { filters }
}
