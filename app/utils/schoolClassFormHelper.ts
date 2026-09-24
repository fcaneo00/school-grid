import * as z from 'zod'

export function createSchoolClassFormSchema(t: (key: string) => string) {
  return z.object({
    year: z.number(t('form.required')).int().min(1, t('schoolClasses.form.yearInvalid')).max(5, t('schoolClasses.form.yearInvalid')),
    section_id: z.number(t('form.required')),
    study_track_id: z.number(t('form.required'))
  })
}

export type SchoolClassFormSchema = z.output<ReturnType<typeof createSchoolClassFormSchema>>
