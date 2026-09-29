import Database from '@tauri-apps/plugin-sql'
import { BaseDirectory, copyFile, exists, mkdir, readDir, remove } from '@tauri-apps/plugin-fs'

export interface HistoryVersion {
  fileName: string
  timestamp: Date
}

interface RawScheduleSnapshotRow {
  assignment_id: number
  day: Weekday
  hour_slot: HourSlot
  teacher_id: number
  school_class_id: number
  teacher_name: string
  year: number
  section_name: string | null
  study_track_name: string | null
}

export interface ScheduleSnapshotRow {
  assignmentId: number
  day: Weekday
  hourSlot: HourSlot
  teacherId: number
  schoolClassId: number
  teacherName: string
  schoolClassName: string
}

export interface MovedGroup {
  teacherName: string
  schoolClassName: string
  count: number
}

export interface HistoryDiff {
  added: ScheduleSnapshotRow[]
  removed: ScheduleSnapshotRow[]
  moved: MovedGroup[]
}

function groupBy<T>(items: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const groupKey = key(item)
    const group = groups.get(groupKey)
    if (group) {
      group.push(item)
    } else {
      groups.set(groupKey, [item])
    }
  }
  return groups
}

export function useSaveHistory() {
  const { t } = useI18n()
  const notify = useNotification()
  const { replaceAllEntries } = useSchedule()

  const versions = useState<HistoryVersion[]>('history-versions', () => [])
  const loading = useState('history-loading', () => false)

  async function ensureHistoryDir(saveFileName: string) {
    const dirExists = await exists(historyDirPath(saveFileName), { baseDir: BaseDirectory.AppConfig })
    if (!dirExists) {
      await mkdir(historyDirPath(saveFileName), { baseDir: BaseDirectory.AppConfig, recursive: true })
    }
  }

  async function pruneOldVersions(saveFileName: string) {
    const entries = await readDir(historyDirPath(saveFileName), { baseDir: BaseDirectory.AppConfig })
    const fileNames = entries.filter((entry) => entry.isFile && isSaveFile(entry.name)).map((entry) => entry.name).sort()
    const toRemove = fileNames.slice(0, Math.max(0, fileNames.length - MAX_HISTORY_VERSIONS))
    for (const fileName of toRemove) {
      await remove(historyFilePath(saveFileName, fileName), { baseDir: BaseDirectory.AppConfig })
    }
  }

  async function createVersionSnapshot() {
    const saveFileName = await getActiveSave()
    await ensureHistoryDir(saveFileName)
    const versionFileName = createVersionFileName()
    await copyFile(saveFilePath(saveFileName), historyFilePath(saveFileName, versionFileName), {
      fromPathBaseDir: BaseDirectory.AppConfig,
      toPathBaseDir: BaseDirectory.AppConfig
    })
    await pruneOldVersions(saveFileName)
  }

  async function fetchVersions() {
    loading.value = true
    try {
      const saveFileName = await getActiveSave()
      const dirExists = await exists(historyDirPath(saveFileName), { baseDir: BaseDirectory.AppConfig })
      if (!dirExists) {
        versions.value = []
        return
      }
      const entries = await readDir(historyDirPath(saveFileName), { baseDir: BaseDirectory.AppConfig })
      versions.value = entries
        .filter((entry) => entry.isFile && isSaveFile(entry.name))
        .map((entry) => ({ fileName: entry.name, timestamp: versionTimestamp(entry.name) }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } finally {
      loading.value = false
    }
  }

  async function fetchScheduleSnapshot(dbPath: string): Promise<ScheduleSnapshotRow[]> {
    const db = await Database.load(`sqlite:${dbPath}`)
    const rows = await db.select<RawScheduleSnapshotRow[]>(`
      SELECT
        se.assignment_id,
        se.day,
        CAST(se.hour_slot AS INTEGER) AS hour_slot,
        se.teacher_id,
        se.school_class_id,
        t.last_name || ' ' || t.first_name AS teacher_name,
        CAST(sc.year AS INTEGER) AS year,
        sec.name AS section_name,
        st.name AS study_track_name
      FROM schedule_entry se
      JOIN teacher t ON t.id = se.teacher_id
      JOIN school_class sc ON sc.id = se.school_class_id
      LEFT JOIN section sec ON sec.id = sc.section_id
      LEFT JOIN study_track st ON st.id = sc.study_track_id
    `)
    return rows.map((row) => ({
      assignmentId: row.assignment_id,
      day: row.day,
      hourSlot: row.hour_slot,
      teacherId: row.teacher_id,
      schoolClassId: row.school_class_id,
      teacherName: row.teacher_name,
      schoolClassName: formatSchoolClassName({ year: row.year, section_name: row.section_name, study_track_name: row.study_track_name })
    }))
  }

  function diffSnapshots(olderRows: ScheduleSnapshotRow[], newerRows: ScheduleSnapshotRow[]): HistoryDiff {
    const cellKey = (row: ScheduleSnapshotRow) => `${row.day}|${row.hourSlot}|${row.teacherId}|${row.schoolClassId}`
    const olderKeys = new Set(olderRows.map(cellKey))
    const newerKeys = new Set(newerRows.map(cellKey))

    const removedRows = olderRows.filter((row) => !newerKeys.has(cellKey(row)))
    const addedRows = newerRows.filter((row) => !olderKeys.has(cellKey(row)))

    const groupKey = (row: ScheduleSnapshotRow) => `${row.teacherId}|${row.schoolClassId}`
    const removedByGroup = groupBy(removedRows, groupKey)
    const addedByGroup = groupBy(addedRows, groupKey)

    const moved: MovedGroup[] = []
    const remainingRemoved: ScheduleSnapshotRow[] = []
    const remainingAdded: ScheduleSnapshotRow[] = []

    const allGroupKeys = new Set([...removedByGroup.keys(), ...addedByGroup.keys()])
    for (const key of allGroupKeys) {
      const removedGroup = removedByGroup.get(key) ?? []
      const addedGroup = addedByGroup.get(key) ?? []
      const movedCount = Math.min(removedGroup.length, addedGroup.length)
      const sample = addedGroup[0] ?? removedGroup[0]
      if (movedCount > 0 && sample) {
        moved.push({ teacherName: sample.teacherName, schoolClassName: sample.schoolClassName, count: movedCount })
      }
      remainingRemoved.push(...removedGroup.slice(movedCount))
      remainingAdded.push(...addedGroup.slice(movedCount))
    }

    return { added: remainingAdded, removed: remainingRemoved, moved }
  }

  async function versionDiff(olderVersion: HistoryVersion, newerVersion: HistoryVersion): Promise<HistoryDiff> {
    const saveFileName = await getActiveSave()
    const [olderRows, newerRows] = await Promise.all([
      fetchScheduleSnapshot(historyFilePath(saveFileName, olderVersion.fileName)),
      fetchScheduleSnapshot(historyFilePath(saveFileName, newerVersion.fileName))
    ])
    return diffSnapshots(olderRows, newerRows)
  }

  async function restoreVersion(version: HistoryVersion) {
    const saveFileName = await getActiveSave()
    const rows = await fetchScheduleSnapshot(historyFilePath(saveFileName, version.fileName))
    await createVersionSnapshot()
    const success = await replaceAllEntries(rows.map((row) => ({
      assignmentId: row.assignmentId,
      teacherId: row.teacherId,
      schoolClassId: row.schoolClassId,
      day: row.day,
      hourSlot: row.hourSlot
    })))
    if (success) {
      await fetchVersions()
      notify.success(t('schedule.history.restoreSuccessTitle'), '')
    }
    return success
  }

  return {
    versions,
    loading,
    createVersionSnapshot,
    fetchVersions,
    versionDiff,
    restoreVersion
  }
}
