import * as z from 'zod'

export function createTeacherFormSchema(t: (key: string) => string) {
  return z.object({
    first_name: z.string().min(1, t('form.required')),
    last_name: z.string().min(1, t('form.required'))
  })
}

export type TeacherFormSchema = z.output<ReturnType<typeof createTeacherFormSchema>>
