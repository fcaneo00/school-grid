export function useStudyTrackFilters() {
  const filters = useState('study-track-filters', () => ({
    name: ''
  }))

  return { filters }
}
