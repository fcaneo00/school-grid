import type { FormSubmitEvent } from '@nuxt/ui'

export function useTeacherForm(id?: number) {
  const { t } = useI18n()
  const { teachers, fetchTeachers, addTeacher, updateTeacher } = useTeachers()
  const { saveDayOffs } = useTeacherPreference()

  const schema = createTeacherFormSchema(t)

  const dayOffOptions = computed(() =>
    WEEKDAY_VALUES.map((day) => ({ label: t(`weekdays.${day}`), value: day }))
  )

  const state = reactive<Partial<TeacherFormSchema>>({
    first_name: '',
    last_name: '',
    day_off: []
  })

  onMounted(async () => {
    if (id === undefined) return
    await fetchTeachers()
    const teacher = teachers.value.find((teacher) => teacher.id === id)
    if (!teacher) return
    state.first_name = teacher.first_name
    state.last_name = teacher.last_name
    state.day_off = teacher.day_off
  })

  async function onSubmit(event: FormSubmitEvent<TeacherFormSchema>) {
    const { day_off, ...teacher } = event.data
    let teacherId = id
    if (teacherId === undefined) {
      teacherId = await addTeacher(teacher)
    } else {
      await updateTeacher(teacherId, teacher)
    }
    if (teacherId !== undefined) {
      await saveDayOffs(teacherId, day_off)
    }
    await navigateTo('/teachers')
  }

  return {
    schema,
    state,
    dayOffOptions,
    onSubmit
  }
}
