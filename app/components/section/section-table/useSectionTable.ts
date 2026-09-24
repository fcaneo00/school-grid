import type { TableColumn } from '@nuxt/ui'
import type { Section } from '~/composables/section/useSections'

export function useSectionTable() {
  const { t } = useI18n()
  const { sections, loading, fetchSections, deleteSection } = useSections()
  const { filters } = useSectionFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchSections)

  async function handleDelete(section: Section) {
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name: section.name })
    })
    if (confirmed) {
      await deleteSection(section.id)
    }
  }

  const filteredSections = computed(() =>
    sections.value.filter((section) =>
      section.name.toLowerCase().includes(filters.value.name.toLowerCase())
    )
  )

  const columns: TableColumn<Section>[] = [
    { accessorKey: 'name', header: t('sections.form.name') },
    { id: 'actions', header: t('table.actions') }
  ]

  return {
    sections: filteredSections,
    loading,
    columns,
    handleDelete
  }
}
