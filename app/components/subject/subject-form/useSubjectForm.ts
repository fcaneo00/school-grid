import type { FormSubmitEvent } from '@nuxt/ui'

export function useSubjectForm(id?: number) {
  const { t } = useI18n()
  const { subjects, fetchSubjects, addSubject, updateSubject } = useSubjects()

  const isEditing = computed(() => id !== undefined)
  const submitLabel = computed(() => isEditing.value ? t('table.save') : t('form.submit'))

  const schema = createSubjectFormSchema(t)

  const state = reactive<Partial<SubjectFormSchema>>({
    name: ''
  })

  onMounted(async () => {
    if (id === undefined) return
    await fetchSubjects()
    const subject = subjects.value.find((subject) => subject.id === id)
    if (!subject) return
    state.name = subject.name
  })

  async function onSubmit(event: FormSubmitEvent<SubjectFormSchema>) {
    if (id === undefined) {
      await addSubject(event.data)
    } else {
      await updateSubject(id, event.data)
    }
    await navigateTo('/subjects')
  }

  return {
    schema,
    state,
    isEditing,
    submitLabel,
    onSubmit
  }
}
