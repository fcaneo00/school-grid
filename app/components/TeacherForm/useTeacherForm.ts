import type { FormSubmitEvent } from '@nuxt/ui'
import { teacherFormSchema, type TeacherFormSchema } from './teacherFormHelper'

export function useTeacherForm() {
  const { addTeacher } = useTeachers()

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
    schema: teacherFormSchema,
    state,
    onSubmit
  }
}
