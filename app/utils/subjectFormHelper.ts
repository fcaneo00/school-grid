import * as z from 'zod'

export function createSubjectFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('form.required'))
  })
}

export type SubjectFormSchema = z.output<ReturnType<typeof createSubjectFormSchema>>
