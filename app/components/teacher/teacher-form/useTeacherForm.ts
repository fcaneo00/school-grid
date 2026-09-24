import type { FormSubmitEvent } from '@nuxt/ui'

export function useTeacherForm(id?: number) {
  const { t } = useI18n()
  const { teachers, fetchTeachers, addTeacher, updateTeacher } = useTeachers()

  const isEditing = computed(() => id !== undefined)
  const submitLabel = computed(() => isEditing.value ? t('table.save') : t('form.submit'))

  const schema = createTeacherFormSchema(t)

  const state = reactive<Partial<TeacherFormSchema>>({
    first_name: '',
    last_name: ''
  })

  onMounted(async () => {
    if (id === undefined) return
    await fetchTeachers()
    const teacher = teachers.value.find((teacher) => teacher.id === id)
    if (!teacher) return
    state.first_name = teacher.first_name
    state.last_name = teacher.last_name
  })

  async function onSubmit(event: FormSubmitEvent<TeacherFormSchema>) {
    if (id === undefined) {
      await addTeacher(event.data)
    } else {
      await updateTeacher(id, event.data)
    }
    await navigateTo('/teachers')
  }

  return {
    schema,
    state,
    isEditing,
    submitLabel,
    onSubmit
  }
}
