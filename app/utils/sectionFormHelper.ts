import * as z from 'zod'

export function createSectionFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('form.required'))
  })
}

export type SectionFormSchema = z.output<ReturnType<typeof createSectionFormSchema>>
