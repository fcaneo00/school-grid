import type { FormSubmitEvent } from '@nuxt/ui'

export function useAssignmentForm(id: number) {
  const { t } = useI18n()
  const { assignments, fetchAssignments, updateAssignment } = useAssignments()
  const { fetchOptions, teacherOptions, schoolClassOptions } = useAssignmentOptions()

  const schema = createAssignmentFormSchema(t)

  const state = reactive<Partial<AssignmentFormSchema>>({
    teacher_id: undefined,
    school_class_id: undefined,
    weekly_hours: undefined
  })

  onMounted(async () => {
    fetchOptions()
    await fetchAssignments()
    const assignment = assignments.value.find((assignment) => assignment.id === id)
    if (!assignment) return
    state.teacher_id = assignment.teacher_id
    state.school_class_id = assignment.school_class_id
    state.weekly_hours = assignment.weekly_hours
  })

  async function onSubmit(event: FormSubmitEvent<AssignmentFormSchema>) {
    await updateAssignment(id, event.data)
    await navigateTo('/assignments')
  }

  return {
    schema,
    state,
    teacherOptions,
    schoolClassOptions,
    onSubmit
  }
}
