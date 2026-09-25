import type { FormSubmitEvent } from '@nuxt/ui'

export function useAssignmentForm(id: Ref<number>) {
  const { t } = useI18n()
  const { assignments, fetchAssignments, updateAssignment } = useAssignments()
  const { fetchOptions, teacherOptions, schoolClassOptions } = useAssignmentOptions()
  const route = useRoute()

  const returnTo = computed(() => resolveReturnTo(route.query.returnTo, '/assignments'))

  const schema = createAssignmentFormSchema(t)

  const state = reactive<Partial<AssignmentFormSchema>>({
    teacher_id: undefined,
    school_class_id: undefined,
    weekly_hours: undefined
  })

  watch(id, async (currentId) => {
    fetchOptions()
    await fetchAssignments()
    const assignment = assignments.value.find((assignment) => assignment.id === currentId)
    if (!assignment) return
    state.teacher_id = assignment.teacher_id
    state.school_class_id = assignment.school_class_id
    state.weekly_hours = assignment.weekly_hours
  }, { immediate: true })

  async function onSubmit(event: FormSubmitEvent<AssignmentFormSchema>) {
    const success = await updateAssignment(id.value, event.data)
    if (success) {
      await navigateTo(returnTo.value)
    }
  }

  return {
    schema,
    state,
    teacherOptions,
    schoolClassOptions,
    returnTo,
    onSubmit
  }
}
