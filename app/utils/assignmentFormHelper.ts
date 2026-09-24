import * as z from 'zod'

export function createAssignmentFormSchema(t: (key: string) => string) {
  return z.object({
    teacher_id: z.number(t('form.required')),
    school_class_id: z.number(t('form.required')),
    weekly_hours: z.number(t('form.required')).int().positive(t('assignments.form.weeklyHoursInvalid'))
  })
}

export type AssignmentFormSchema = z.output<ReturnType<typeof createAssignmentFormSchema>>
