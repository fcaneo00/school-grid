import type { FormSubmitEvent } from '@nuxt/ui'

export function useSectionForm(id: Ref<number | undefined>) {
  const { t } = useI18n()
  const { sections, fetchSections, addSection, updateSection } = useSections()

  const schema = createSectionFormSchema(t)

  const state = reactive<Partial<SectionFormSchema>>({
    name: ''
  })

  watch(id, async (currentId) => {
    if (currentId === undefined) return
    await fetchSections()
    const section = sections.value.find((section) => section.id === currentId)
    if (!section) return
    state.name = section.name
  }, { immediate: true })

  async function onSubmit(event: FormSubmitEvent<SectionFormSchema>) {
    if (id.value === undefined) {
      await addSection(event.data)
    } else {
      await updateSection(id.value, event.data)
    }
    await navigateTo('/sections')
  }

  return {
    schema,
    state,
    onSubmit
  }
}
