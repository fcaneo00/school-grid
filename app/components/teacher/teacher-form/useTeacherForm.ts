import type { FormSubmitEvent } from '@nuxt/ui'
import {
  createTeacherFormSchema,
  createUnavailableHoursSchema,
  isEmptyUnavailableHours,
  type TeacherFormSchema
} from './teacherFormHelper'

export function useTeacherForm(id: Ref<number | undefined>) {
  const { t } = useI18n()
  const { teachers, fetchTeachers, addTeacher, updateTeacher } = useTeachers()
  const { saveDayOffs } = useTeacherPreference()
  const { saveUnavailableHours } = useTeacherUnavailableHours()
  const { settings, activeHourSlots, fetchSettings } = useAppSettings()
  const route = useRoute()

  const returnTo = computed(() => resolveReturnTo(route.query.returnTo, '/teachers'))

  const schema = createTeacherFormSchema(t)
  const unavailableHoursSchema = createUnavailableHoursSchema()

  fetchSettings()

  const dayOffOptions = computed(() =>
    settings.value.activeWeekdays.map((day) => ({ label: t(`weekdays.${day}`), value: day }))
  )

  const hourOptions = computed(() =>
    activeHourSlots.value.map((hour) => ({ label: t('teachers.form.hourLabel', { 'hour': hour }), value: hour as number }))
  )

  const state = reactive<Partial<TeacherFormSchema>>({
    first_name: '',
    last_name: '',
    day_off: [],
    max_consecutive_hours: undefined,
    unavailable_hours: []
  })

  const firstNameModel = computed({
    get: () => state.first_name ?? '',
    set: (value: string) => {
      state.first_name = capitalizeFirstLetter(value)
    }
  })

  const lastNameModel = computed({
    get: () => state.last_name ?? '',
    set: (value: string) => {
      state.last_name = capitalizeFirstLetter(value)
    }
  })

  watch(id, async (currentId) => {
    if (currentId === undefined) return
    await fetchTeachers()
    const teacher = teachers.value.find((teacher) => teacher.id === currentId)
    if (!teacher) return
    state.first_name = teacher.first_name
    state.last_name = teacher.last_name
    state.day_off = teacher.day_off
    state.max_consecutive_hours = teacher.max_consecutive_hours
    state.unavailable_hours = teacher.unavailable_hours
  }, { immediate: true })

  function addUnavailableHoursRow() {
    state.unavailable_hours = [...(state.unavailable_hours ?? []), { day: 'monday', hours: [] }]
  }

  function removeUnavailableHoursRow(index: number) {
    state.unavailable_hours = (state.unavailable_hours ?? []).filter((_, rowIndex) => rowIndex !== index)
  }

  async function onSubmit(event: FormSubmitEvent<TeacherFormSchema>) {
    const { day_off, unavailable_hours, ...teacher } = event.data
    let teacherId = id.value
    if (teacherId === undefined) {
      teacherId = await addTeacher(teacher)
    } else {
      await updateTeacher(teacherId, teacher)
    }
    if (teacherId !== undefined) {
      await saveDayOffs(teacherId, day_off)
      await saveUnavailableHours(teacherId, unavailable_hours.filter((entry) => !isEmptyUnavailableHours(entry)))
    }
    await navigateTo(returnTo.value)
  }

  return {
    schema,
    unavailableHoursSchema,
    state,
    firstNameModel,
    lastNameModel,
    dayOffOptions,
    hourOptions,
    activeHourSlots,
    returnTo,
    addUnavailableHoursRow,
    removeUnavailableHoursRow,
    onSubmit
  }
}
