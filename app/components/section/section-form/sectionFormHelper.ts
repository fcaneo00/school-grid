import * as z from 'zod'

export function normalizeSectionName(name: string) {
  return name.toUpperCase()
}

export function createSectionFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('form.required')).transform(normalizeSectionName)
  })
}

export type SectionFormSchema = z.output<ReturnType<typeof createSectionFormSchema>>
