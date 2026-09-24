import * as z from 'zod'

export function createAssignmentFormSchema(t: (key: string) => string) {
  return z.object({
    teacher_id: z.number(t('form.required')),
    school_class_id: z.number(t('form.required')),
    weekly_hours: z.number(t('form.required')).int().positive(t('assignments.form.weeklyHoursInvalid'))
  })
}

export type AssignmentFormSchema = z.output<ReturnType<typeof createAssignmentFormSchema>>

export function createAssignmentTeacherFormSchema(t: (key: string) => string) {
  return z.object({
    teacher_id: z.number(t('form.required'))
  })
}

export type AssignmentTeacherFormSchema = z.output<ReturnType<typeof createAssignmentTeacherFormSchema>>

export function createAssignmentItemFormSchema(t: (key: string) => string) {
  return z.object({
    school_class_id: z.number(t('form.required')),
    weekly_hours: z.number(t('form.required')).int().positive(t('assignments.form.weeklyHoursInvalid'))
  })
}

export type AssignmentItemFormSchema = z.output<ReturnType<typeof createAssignmentItemFormSchema>>
