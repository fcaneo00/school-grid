import type { FormSubmitEvent } from '@nuxt/ui'
import { createTeacherFormSchema, type TeacherFormSchema } from './teacherFormHelper'

export function useTeacherForm() {
  const { t } = useI18n()
  const { addTeacher } = useTeachers()

  const schema = createTeacherFormSchema(t)

  const state = reactive<Partial<TeacherFormSchema>>({
    first_name: '',
    last_name: ''
  })

  async function onSubmit(event: FormSubmitEvent<TeacherFormSchema>) {
    await addTeacher(event.data)
    state.first_name = ''
    state.last_name = ''
  }

  return {
    schema,
    state,
    onSubmit
  }
}
