export function useSubjectFilters() {
  const filters = useState('subject-filters', () => ({
    name: ''
  }))

  return { filters }
}
