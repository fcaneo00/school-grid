<script setup lang="ts">
const { t } = useI18n()
const { schoolClasses, fetchSchoolClasses } = useSchoolClasses()
const { fetchTeachers } = useTeachers()
const { fetchEntries } = useSchedule()
const { isDirty, saveDraft, revertDraft, hasUnsavedDrafts, discardAllDrafts, effectiveEntries } = useScheduleDraft()
const confirmDialog = useConfirmDialog()
const route = useRoute()

const initialClassId = Number(route.query.classId)
const selectedClassId = ref<number | undefined>(Number.isFinite(initialClassId) && initialClassId > 0 ? initialClassId : undefined)

watch(selectedClassId, (value) => {
  navigateTo({ query: { ...route.query, classId: value } }, { replace: true })
})

onMounted(async () => {
  await Promise.all([fetchSchoolClasses(), fetchTeachers(), fetchEntries()])
})

const classOptions = computed(() =>
  schoolClasses.value.map((schoolClass) => ({
    label: formatSchoolClassName(schoolClass),
    value: schoolClass.id
  }))
)

const currentIsDirty = computed(() => selectedClassId.value !== undefined && isDirty(selectedClassId.value))

const selectedClass = computed(() => schoolClasses.value.find((schoolClass) => schoolClass.id === selectedClassId.value))
const occupiedHours = computed(() => selectedClassId.value === undefined ? 0 : effectiveEntries(selectedClassId.value).length)
const targetHours = computed(() => selectedClass.value?.weekly_hours ?? null)

async function handleSave() {
  if (selectedClassId.value === undefined) return
  await saveDraft(selectedClassId.value)
}

function handleRevert() {
  if (selectedClassId.value === undefined) return
  revertDraft(selectedClassId.value)
}

onBeforeRouteLeave(async () => {
  if (!hasUnsavedDrafts.value) return true
  const confirmed = await confirmDialog({
    title: t('schedule.leaveConfirmTitle'),
    description: t('schedule.leaveConfirmDescription')
  })
  if (!confirmed) return false
  discardAllDrafts()
  return true
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/" />
      <h1 class="text-xl font-semibold">{{ t('schedule.title') }}</h1>
    </div>
    <USelect v-model="selectedClassId" :items="classOptions" :placeholder="t('schedule.selectClass')" class="w-64" />
    <p v-if="selectedClassId === undefined" class="text-muted">{{ t('schedule.noClassSelected') }}</p>
    <div v-else class="space-y-4">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-muted">{{ t('schedule.classHoursLabel') }}</span>
        <span v-if="targetHours !== null">{{ t('schedule.hoursAssigned', { assigned: occupiedHours, total: targetHours }) }}</span>
        <span v-else class="text-muted">{{ t('schedule.classHoursNoTarget', { assigned: occupiedHours }) }}</span>
        <UBadge v-if="targetHours !== null && occupiedHours === targetHours" :label="t('schedule.complete')" color="success" variant="subtle" size="sm" />
        <UBadge v-else-if="targetHours !== null && occupiedHours > targetHours" :label="t('schedule.overassigned')" color="warning" variant="subtle" size="sm" />
      </div>
      <div v-if="currentIsDirty" class="flex items-center justify-between rounded border border-warning bg-warning/10 px-4 py-3">
        <span class="text-sm font-medium">{{ t('schedule.draftBanner') }}</span>
        <div class="flex gap-2">
          <UButton :label="t('schedule.revert')" color="neutral" variant="outline" @click="handleRevert" />
          <UButton :label="t('schedule.save')" @click="handleSave" />
        </div>
      </div>
      <ScheduleSidebar :school-class-id="selectedClassId" />
      <ScheduleGrid :school-class-id="selectedClassId" />
    </div>
  </div>
</template>
