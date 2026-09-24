import * as z from 'zod'

export function createTeacherFormSchema(t: (key: string) => string) {
  return z.object({
    first_name: z.string().min(1, t('form.required')),
    last_name: z.string().min(1, t('form.required')),
    day_off: z.array(z.enum(WEEKDAY_VALUES))
  })
}

export type TeacherFormSchema = z.output<ReturnType<typeof createTeacherFormSchema>>
