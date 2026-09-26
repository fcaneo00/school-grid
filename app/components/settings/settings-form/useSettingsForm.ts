import type { FormSubmitEvent } from '@nuxt/ui'

export function useSettingsForm() {
  const { t } = useI18n()
  const { settings, loading, fetchSettings, updateSettings } = useAppSettings()

  const schema = createSettingsFormSchema(t)

  const activeWeekdayOptions = computed(() =>
    WEEKDAY_VALUES.map((day) => ({ label: t(`weekdays.${day}`), value: day }))
  )

  const state = reactive<Partial<SettingsFormSchema>>({
    max_daily_hours: settings.value.maxDailyHours,
    active_weekdays: settings.value.activeWeekdays
  })

  watch(settings, (value) => {
    state.max_daily_hours = value.maxDailyHours
    state.active_weekdays = value.activeWeekdays
  }, { immediate: true })

  onMounted(fetchSettings)

  async function onSubmit(event: FormSubmitEvent<SettingsFormSchema>) {
    await updateSettings({
      maxDailyHours: event.data.max_daily_hours,
      activeWeekdays: event.data.active_weekdays
    })
  }

  return {
    schema,
    state,
    loading,
    activeWeekdayOptions,
    onSubmit
  }
}
