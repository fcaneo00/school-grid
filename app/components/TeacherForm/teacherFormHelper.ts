import * as z from 'zod'

export const teacherFormSchema = z.object({
  first_name: z.string().min(1, 'Obbligatorio'),
  last_name: z.string().min(1, 'Obbligatorio')
})

export type TeacherFormSchema = z.output<typeof teacherFormSchema>
