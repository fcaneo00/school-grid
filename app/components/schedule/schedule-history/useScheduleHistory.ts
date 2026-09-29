import type { HistoryDiff, HistoryVersion } from '~/composables/saves/useSaveHistory'

export interface VersionRow {
  version: HistoryVersion
  diff: HistoryDiff | null
}

export function useScheduleHistory() {
  const { t } = useI18n()
  const confirmDialog = useConfirmDialog()
  const { loading, versions, fetchVersions, versionDiff, restoreVersion } = useSaveHistory()

  const rows = useState<VersionRow[]>('schedule-history-rows', () => [])

  async function load() {
    await fetchVersions()
    const computed: VersionRow[] = []
    for (let i = 0; i < versions.value.length; i++) {
      const current = versions.value[i]
      const older = versions.value[i + 1]
      if (!current) continue
      const diff = older ? await versionDiff(older, current) : null
      computed.push({ version: current, diff })
    }
    rows.value = computed
  }

  async function handleRestore(version: HistoryVersion) {
    const confirmed = await confirmDialog({
      title: t('schedule.history.restoreConfirmTitle'),
      description: t('schedule.history.restoreConfirmDescription')
    })
    if (!confirmed) return
    const success = await restoreVersion(version)
    if (success) {
      await load()
    }
  }

  return {
    rows,
    loading,
    load,
    handleRestore
  }
}
