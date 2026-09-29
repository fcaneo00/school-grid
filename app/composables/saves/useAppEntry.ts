export function useAppEntry() {
  const hasEnteredSave = useState('has-entered-save', () => false)

  return {
    hasEnteredSave
  }
}
