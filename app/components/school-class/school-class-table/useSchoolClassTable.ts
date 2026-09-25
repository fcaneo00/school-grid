import type { TableColumn } from '@nuxt/ui'
import type { SchoolClassWithDetails } from '~/composables/school-class/useSchoolClasses'

interface SectionGroup {
  sectionId: number | null
  sectionName: string
  studyTrackLabel: string
  studyTrackUniform: boolean
  classCount: number
  classes: SchoolClassWithDetails[]
}

export function useSchoolClassTable() {
  const { t } = useI18n()
  const { schoolClasses, loading, fetchSchoolClasses, deleteSchoolClass } = useSchoolClasses()
  const { filters } = useSchoolClassFilters()
  const confirmDialog = useConfirmDialog()

  onMounted(fetchSchoolClasses)

  const expanded = ref<Record<string, boolean>>({})
  const sorting = ref([{ id: 'sectionName', desc: false }])

  async function handleDelete(schoolClass: SchoolClassWithDetails) {
    const confirmed = await confirmDialog({
      title: t('general.confirmDeleteTitle'),
      description: t('general.confirmDeleteDescription', { name: formatSchoolClassName(schoolClass) })
    })
    if (confirmed) {
      await deleteSchoolClass(schoolClass.id)
    }
  }

  const filteredSchoolClasses = computed(() =>
    schoolClasses.value.filter((schoolClass) =>
      (filters.value.year === undefined || schoolClass.year === filters.value.year) &&
      (schoolClass.section_name ?? '').toLowerCase().includes(filters.value.section_name.toLowerCase()) &&
      (schoolClass.study_track_name ?? '').toLowerCase().includes(filters.value.study_track_name.toLowerCase())
    )
  )

  const sectionGroups = computed<SectionGroup[]>(() => {
    const groups = new Map<number | null, SchoolClassWithDetails[]>()
    for (const schoolClass of filteredSchoolClasses.value) {
      const list = groups.get(schoolClass.section_id) ?? []
      list.push(schoolClass)
      groups.set(schoolClass.section_id, list)
    }

    return [...groups.entries()]
      .map(([sectionId, classes]) => {
        const sorted = [...classes].sort((a, b) => a.year - b.year)
        const distinctTrackIds = new Set(sorted.map((schoolClass) => schoolClass.study_track_id))
        const studyTrackUniform = distinctTrackIds.size === 1
        return {
          sectionId,
          sectionName: sorted[0]!.section_name ?? t('schoolClasses.noSection'),
          studyTrackLabel: studyTrackUniform ? (sorted[0]!.study_track_name ?? '-') : t('schoolClasses.mixedStudyTrack'),
          studyTrackUniform,
          classCount: sorted.length,
          classes: sorted
        }
      })
      .sort((a, b) => a.sectionName.localeCompare(b.sectionName))
  })

  const columns: TableColumn<SectionGroup>[] = [
    { id: 'expand' },
    { accessorKey: 'sectionName', header: t('schoolClasses.form.section'), enableSorting: true },
    { accessorKey: 'studyTrackLabel', header: t('schoolClasses.form.studyTrack'), enableSorting: true },
    { accessorKey: 'classCount', header: t('schoolClasses.classCount'), enableSorting: true }
  ]

  return {
    sectionGroups,
    loading,
    columns,
    expanded,
    sorting,
    handleDelete
  }
}
