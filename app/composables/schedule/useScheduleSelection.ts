export function useScheduleSelection() {
  const mode = useState<'class' | 'teacher'>('schedule-selection-mode', () => 'class')
  const entityId = useState<number | undefined>('schedule-selection-entity-id', () => undefined)

  function reset() {
    mode.value = 'class'
    entityId.value = undefined
  }

  return {
    mode,
    entityId,
    reset
  }
}
