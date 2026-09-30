import * as z from 'zod'

export function createUnavailableHoursSchema() {
  return z.object({
    day: z.enum(WEEKDAY_VALUES),
    hours: z.array(z.number().int().min(1).max(HOUR_SLOT_VALUES.length))
  })
}

export type UnavailableHoursSchema = z.output<ReturnType<typeof createUnavailableHoursSchema>>

export function isEmptyUnavailableHours(entry: Pick<UnavailableHoursSchema, 'hours'>) {
  return entry.hours.length === 0
}

export function createTeacherFormSchema(t: (key: string) => string) {
  return z.object({
    first_name: z.string().min(1, t('form.required')).transform(capitalizeFirstLetter),
    last_name: z.string().min(1, t('form.required')).transform(capitalizeFirstLetter),
    day_off: z.array(z.enum(WEEKDAY_VALUES)),
    max_consecutive_hours: z.number().int().min(1).max(HOUR_SLOT_VALUES.length).optional(),
    unavailable_hours: z.array(createUnavailableHoursSchema())
  })
}

export type TeacherFormSchema = z.output<ReturnType<typeof createTeacherFormSchema>>
