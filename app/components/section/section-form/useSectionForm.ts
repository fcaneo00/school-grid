import type { FormSubmitEvent } from '@nuxt/ui'

export function useSectionForm(id?: number) {
  const { t } = useI18n()
  const { sections, fetchSections, addSection, updateSection } = useSections()

  const isEditing = computed(() => id !== undefined)
  const submitLabel = computed(() => isEditing.value ? t('table.save') : t('form.submit'))

  const schema = createSectionFormSchema(t)

  const state = reactive<Partial<SectionFormSchema>>({
    name: ''
  })

  onMounted(async () => {
    if (id === undefined) return
    await fetchSections()
    const section = sections.value.find((section) => section.id === id)
    if (!section) return
    state.name = section.name
  })

  async function onSubmit(event: FormSubmitEvent<SectionFormSchema>) {
    if (id === undefined) {
      await addSection(event.data)
    } else {
      await updateSection(id, event.data)
    }
    await navigateTo('/sections')
  }

  return {
    schema,
    state,
    isEditing,
    submitLabel,
    onSubmit
  }
}
