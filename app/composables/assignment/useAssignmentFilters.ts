export function useAssignmentFilters() {
  const filters = useState('assignment-filters', () => ({
    teacher: '',
    schoolClass: '',
    weeklyHours: undefined as number | undefined
  }))

  return { filters }
}
