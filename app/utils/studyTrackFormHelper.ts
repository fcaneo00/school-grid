import * as z from 'zod'

export function createStudyTrackFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('form.required'))
  })
}

export type StudyTrackFormSchema = z.output<ReturnType<typeof createStudyTrackFormSchema>>
