import * as z from 'zod'

const ILLEGAL_FILENAME_CHARS = /[<>:"\\|?*]/

export function createSaveFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string()
      .min(1, t('form.required'))
      .max(60, t('saves.form.nameTooLong'))
      .refine((name) => !ILLEGAL_FILENAME_CHARS.test(name), t('saves.form.nameInvalidChars'))
  })
}

export type SaveFormSchema = z.output<ReturnType<typeof createSaveFormSchema>>
