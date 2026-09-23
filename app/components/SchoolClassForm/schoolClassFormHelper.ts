import * as z from 'zod'

export function createSchoolClassFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('form.required')),
    section: z.string().min(1, t('form.required'))
  })
}

export type SchoolClassFormSchema = z.output<ReturnType<typeof createSchoolClassFormSchema>>
