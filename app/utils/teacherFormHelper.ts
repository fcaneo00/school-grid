import * as z from 'zod'

export function createTimeConstraintSchema(t: (key: string) => string) {
  return z.object({
    day: z.enum(WEEKDAY_VALUES),
    not_before: z.number().int().min(1).max(HOUR_SLOT_VALUES.length).optional(),
    not_after: z.number().int().min(1).max(HOUR_SLOT_VALUES.length).optional()
  }).superRefine((value, ctx) => {
    if (!isTimeConstraintOrderInvalid(value)) return
    ctx.addIssue({ code: 'custom', message: t('teachers.form.timeConstraintOrderInvalid'), path: ['timeConstraintOrder'] })
  })
}

export type TimeConstraintSchema = z.output<ReturnType<typeof createTimeConstraintSchema>>

export function isEmptyTimeConstraint(constraint: Pick<TimeConstraintSchema, 'not_before' | 'not_after'>) {
  return constraint.not_before === undefined && constraint.not_after === undefined
}

export function isTimeConstraintOrderInvalid(constraint: Pick<TimeConstraintSchema, 'not_before' | 'not_after'>) {
  return constraint.not_before !== undefined && constraint.not_after !== undefined && constraint.not_after <= constraint.not_before
}

export function createTeacherFormSchema(t: (key: string) => string) {
  return z.object({
    first_name: z.string().min(1, t('form.required')),
    last_name: z.string().min(1, t('form.required')),
    day_off: z.array(z.enum(WEEKDAY_VALUES)),
    max_consecutive_hours: z.number().int().min(1).max(HOUR_SLOT_VALUES.length).optional(),
    time_constraints: z.array(createTimeConstraintSchema(t))
  })
}

export type TeacherFormSchema = z.output<ReturnType<typeof createTeacherFormSchema>>
