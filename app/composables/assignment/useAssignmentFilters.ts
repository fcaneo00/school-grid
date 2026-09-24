export function useAssignmentFilters() {
  const filters = useState('assignment-filters', () => ({
    teacher: '',
    schoolClass: '',
    subject: '',
    weeklyHours: undefined as number | undefined
  }))

  return { filters }
}
