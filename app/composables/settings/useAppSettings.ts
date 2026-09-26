export interface AppSettings {
  maxDailyHours: number
  activeWeekdays: Weekday[]
}

interface AppSettingsRow {
  max_daily_hours: number
  active_weekdays: string
}

interface OutOfRangeUsage {
  school_class_year: number
  school_class_section_name: string | null
  school_class_study_track_name: string | null
  teacher_first_name: string
  teacher_last_name: string
}

function parseActiveWeekdays(value: string): Weekday[] {
  const values = new Set(value.split(','))
  return WEEKDAY_VALUES.filter((day) => values.has(day))
}

function defaultSettings(): AppSettings {
  return {
    maxDailyHours: HOUR_SLOT_VALUES.length,
    activeWeekdays: [...WEEKDAY_VALUES]
  }
}

export function useAppSettings() {
  const { t } = useI18n()
  const notify = useNotification()
  const settings = useState<AppSettings>('app-settings', defaultSettings)
  const loading = useState('app-settings-loading', () => false)

  const activeHourSlots = computed(() => HOUR_SLOT_VALUES.slice(0, settings.value.maxDailyHours))

  async function fetchSettings() {
    loading.value = true
    try {
      const db = await getDb()
      const [row] = await db.select<AppSettingsRow[]>(
        'SELECT max_daily_hours, active_weekdays FROM app_settings WHERE id = 1'
      )
      if (row) {
        settings.value = {
          maxDailyHours: row.max_daily_hours,
          activeWeekdays: parseActiveWeekdays(row.active_weekdays)
        }
      }
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  async function findOutOfRangeUsages(maxDailyHours: number, activeWeekdays: Weekday[]) {
    const db = await getDb()
    const inactiveDays = WEEKDAY_VALUES.filter((day) => !activeWeekdays.includes(day))
    const dayPlaceholders = inactiveDays.map((_, index) => `$${index + 2}`).join(', ')
    const dayCondition = inactiveDays.length > 0 ? `OR schedule_entry.day IN (${dayPlaceholders})` : ''

    return db.select<OutOfRangeUsage[]>(`
      SELECT DISTINCT
        CAST(school_class.year AS INTEGER) AS school_class_year,
        section.name AS school_class_section_name,
        study_track.name AS school_class_study_track_name,
        teacher.first_name AS teacher_first_name,
        teacher.last_name AS teacher_last_name
      FROM schedule_entry
      JOIN school_class ON school_class.id = schedule_entry.school_class_id
      LEFT JOIN section ON section.id = school_class.section_id
      LEFT JOIN study_track ON study_track.id = school_class.study_track_id
      JOIN teacher ON teacher.id = schedule_entry.teacher_id
      WHERE CAST(schedule_entry.hour_slot AS INTEGER) > $1 ${dayCondition}
    `, [maxDailyHours, ...inactiveDays])
  }

  async function updateSettings(next: AppSettings) {
    const usages = await findOutOfRangeUsages(next.maxDailyHours, next.activeWeekdays)
    if (usages.length > 0) {
      const usagesText = usages
        .map((usage) => {
          const className = formatSchoolClassName({
            year: usage.school_class_year,
            section_name: usage.school_class_section_name,
            study_track_name: usage.school_class_study_track_name
          })
          return `${className} (${usage.teacher_last_name} ${usage.teacher_first_name})`
        })
        .join(', ')
      notify.error(t('settings.saveBlockedTitle'), t('settings.saveBlockedDescription', { usages: usagesText }))
      return false
    }

    const orderedActiveWeekdays = WEEKDAY_VALUES.filter((day) => next.activeWeekdays.includes(day))
    const db = await getDb()
    await db.execute(
      'UPDATE app_settings SET max_daily_hours = $1, active_weekdays = $2 WHERE id = 1',
      [next.maxDailyHours, orderedActiveWeekdays.join(',')]
    )
    settings.value = { maxDailyHours: next.maxDailyHours, activeWeekdays: orderedActiveWeekdays }
    notify.success(t('general.updated'), t('settings.title'))
    return true
  }

  return {
    settings,
    loading,
    activeHourSlots,
    fetchSettings,
    updateSettings
  }
}
