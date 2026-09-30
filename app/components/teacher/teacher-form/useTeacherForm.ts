import type { FormSubmitEvent } from '@nuxt/ui'

export function useTeacherForm(id: Ref<number | undefined>) {
  const { t } = useI18n()
  const { teachers, fetchTeachers, addTeacher, updateTeacher } = useTeachers()
  const { saveDayOffs } = useTeacherPreference()
  const { saveTimeConstraints } = useTeacherTimeConstraint()
  const { settings, fetchSettings } = useAppSettings()
  const route = useRoute()

  const returnTo = computed(() => resolveReturnTo(route.query.returnTo, '/teachers'))

  const schema = createTeacherFormSchema(t)
  const timeConstraintSchema = createTimeConstraintSchema(t)

  fetchSettings()

  const dayOffOptions = computed(() =>
    settings.value.activeWeekdays.map((day) => ({ label: t(`weekdays.${day}`), value: day }))
  )

  const hourOptions = computed(() => [
    { label: t('teachers.form.noLimit'), value: undefined },
    ...HOUR_SLOT_VALUES.map((hour) => ({ label: t('teachers.form.hourLabel', { 'hour': hour }), value: hour as number | undefined }))
  ])

  const state = reactive<Partial<TeacherFormSchema>>({
    first_name: '',
    last_name: '',
    day_off: [],
    time_constraints: []
  })

  watch(id, async (currentId) => {
    if (currentId === undefined) return
    await fetchTeachers()
    const teacher = teachers.value.find((teacher) => teacher.id === currentId)
    if (!teacher) return
    state.first_name = teacher.first_name
    state.last_name = teacher.last_name
    state.day_off = teacher.day_off
    state.time_constraints = teacher.time_constraints
  }, { immediate: true })

  function addTimeConstraintRow() {
    state.time_constraints = [...(state.time_constraints ?? []), { day: 'monday', not_before: undefined, not_after: undefined }]
  }

  function removeTimeConstraintRow(index: number) {
    state.time_constraints = (state.time_constraints ?? []).filter((_, rowIndex) => rowIndex !== index)
  }

  async function onSubmit(event: FormSubmitEvent<TeacherFormSchema>) {
    const { day_off, time_constraints, ...teacher } = event.data
    let teacherId = id.value
    if (teacherId === undefined) {
      teacherId = await addTeacher(teacher)
    } else {
      await updateTeacher(teacherId, teacher)
    }
    if (teacherId !== undefined) {
      await saveDayOffs(teacherId, day_off)
      await saveTimeConstraints(teacherId, time_constraints.filter((constraint) => !isEmptyTimeConstraint(constraint)))
    }
    await navigateTo(returnTo.value)
  }

  return {
    schema,
    timeConstraintSchema,
    state,
    dayOffOptions,
    hourOptions,
    returnTo,
    addTimeConstraintRow,
    removeTimeConstraintRow,
    onSubmit
  }
}
