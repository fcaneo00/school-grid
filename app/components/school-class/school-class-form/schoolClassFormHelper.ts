import * as z from 'zod'

export function createSchoolClassFormSchema(t: (key: string) => string) {
  return z.object({
    year: z.number(t('form.required')).int().min(1, t('schoolClasses.form.yearInvalid')).max(5, t('schoolClasses.form.yearInvalid')),
    section_id: z.number(t('form.required')),
    study_track_id: z.number(t('form.required')),
    weekly_hours: z.number(t('form.required')).int().min(1, t('schoolClasses.form.weeklyHoursInvalid')).max(36, t('schoolClasses.form.weeklyHoursInvalid'))
  })
}

export type SchoolClassFormSchema = z.output<ReturnType<typeof createSchoolClassFormSchema>>
