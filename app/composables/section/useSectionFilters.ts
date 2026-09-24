export function useSectionFilters() {
  const filters = useState('section-filters', () => ({
    name: ''
  }))

  return { filters }
}
