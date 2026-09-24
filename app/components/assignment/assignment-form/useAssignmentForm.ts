import type { FormSubmitEvent } from '@nuxt/ui'

export function useAssignmentForm(id?: number) {
  const { t } = useI18n()
  const { assignments, fetchAssignments, addAssignment, updateAssignment } = useAssignments()
  const { fetchOptions, teacherOptions, schoolClassOptions } = useAssignmentOptions()

  const isEditing = computed(() => id !== undefined)
  const submitLabel = computed(() => isEditing.value ? t('table.save') : t('form.submit'))

  const schema = createAssignmentFormSchema(t)

  const state = reactive<Partial<AssignmentFormSchema>>({
    teacher_id: undefined,
    school_class_id: undefined,
    weekly_hours: undefined
  })

  onMounted(async () => {
    fetchOptions()
    if (id === undefined) return
    await fetchAssignments()
    const assignment = assignments.value.find((assignment) => assignment.id === id)
    if (!assignment) return
    state.teacher_id = assignment.teacher_id
    state.school_class_id = assignment.school_class_id
    state.weekly_hours = assignment.weekly_hours
  })

  async function onSubmit(event: FormSubmitEvent<AssignmentFormSchema>) {
    if (id === undefined) {
      await addAssignment(event.data)
    } else {
      await updateAssignment(id, event.data)
    }
    await navigateTo('/assignments')
  }

  return {
    schema,
    state,
    isEditing,
    submitLabel,
    teacherOptions,
    schoolClassOptions,
    onSubmit
  }
}
