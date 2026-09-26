import * as z from 'zod'

export function createSettingsFormSchema(t: (key: string) => string) {
  return z.object({
    max_daily_hours: z.number(t('form.required')).int()
      .min(1, t('settings.maxDailyHoursInvalid'))
      .max(HOUR_SLOT_VALUES.length, t('settings.maxDailyHoursInvalid')),
    active_weekdays: z.array(z.enum(WEEKDAY_VALUES)).min(1, t('settings.activeWeekdaysInvalid'))
  })
}

export type SettingsFormSchema = z.output<ReturnType<typeof createSettingsFormSchema>>
