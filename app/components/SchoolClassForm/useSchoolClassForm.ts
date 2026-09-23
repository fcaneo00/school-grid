import type { FormSubmitEvent } from '@nuxt/ui'
import { createSchoolClassFormSchema, type SchoolClassFormSchema } from './schoolClassFormHelper'

export function useSchoolClassForm() {
  const { t } = useI18n()
  const { addSchoolClass } = useSchoolClasses()

  const schema = createSchoolClassFormSchema(t)

  const state = reactive<Partial<SchoolClassFormSchema>>({
    name: '',
    section: ''
  })

  async function onSubmit(event: FormSubmitEvent<SchoolClassFormSchema>) {
    await addSchoolClass(event.data)
    state.name = ''
    state.section = ''
  }

  return {
    schema,
    state,
    onSubmit
  }
}
