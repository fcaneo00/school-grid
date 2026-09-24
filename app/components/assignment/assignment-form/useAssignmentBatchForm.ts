import type { FormSubmitEvent } from '@nuxt/ui'

export function useAssignmentBatchForm() {
  const { t } = useI18n()
  const { addAssignments } = useAssignments()
  const { fetchOptions, teacherOptions, schoolClassOptions } = useAssignmentOptions()

  const schema = createAssignmentTeacherFormSchema(t)
  const itemSchema = createAssignmentItemFormSchema(t)

  function emptyRow(): Partial<AssignmentItemFormSchema> {
    return { school_class_id: undefined, weekly_hours: undefined }
  }

  const state = reactive<Partial<AssignmentTeacherFormSchema> & { items: Partial<AssignmentItemFormSchema>[] }>({
    teacher_id: undefined,
    items: [emptyRow()]
  })

  onMounted(fetchOptions)

  function addRow() {
    state.items.push(emptyRow())
  }

  function removeRow(index: number) {
    state.items.splice(index, 1)
  }

  async function onSubmit(event: FormSubmitEvent<AssignmentTeacherFormSchema>) {
    await addAssignments(event.data.teacher_id, state.items as AssignmentItemFormSchema[])
    await navigateTo('/assignments')
  }

  return {
    schema,
    itemSchema,
    state,
    teacherOptions,
    schoolClassOptions,
    addRow,
    removeRow,
    onSubmit
  }
}
