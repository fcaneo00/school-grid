import type { FormSubmitEvent } from '@nuxt/ui'
import { createSectionFormSchema, normalizeSectionName, type SectionFormSchema } from './sectionFormHelper'

export function useSectionForm(id: Ref<number | undefined>) {
  const { t } = useI18n()
  const { sections, fetchSections, addSection, updateSection } = useSections()

  const schema = createSectionFormSchema(t)

  const state = reactive<Partial<SectionFormSchema>>({
    name: ''
  })

  const nameModel = computed({
    get: () => state.name ?? '',
    set: (value: string) => {
      state.name = normalizeSectionName(value)
    }
  })

  watch(id, async (currentId) => {
    if (currentId === undefined) return
    await fetchSections()
    const section = sections.value.find((section) => section.id === currentId)
    if (!section) return
    state.name = section.name
  }, { immediate: true })

  async function onSubmit(event: FormSubmitEvent<SectionFormSchema>) {
    const success = id.value === undefined
      ? await addSection(event.data)
      : await updateSection(id.value, event.data)
    if (success) {
      await navigateTo('/sections')
    }
  }

  return {
    schema,
    state,
    nameModel,
    onSubmit
  }
}
