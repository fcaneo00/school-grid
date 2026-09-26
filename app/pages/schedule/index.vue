<script setup lang="ts">
const { t } = useI18n()
const { schoolClasses, fetchSchoolClasses } = useSchoolClasses()
const { teachers, fetchTeachers } = useTeachers()
const { fetchEntries } = useSchedule()
const { fetchSettings } = useAppSettings()
const { isDirty, saveDraft, revertDraft, discardAllDrafts, effectiveEntries } = useScheduleDraft()
const confirmDialog = useConfirmDialog()
const route = useRoute()

const modeItems = computed(() => [
  { label: t('schedule.modeClass'), value: 'class' as const, icon: 'i-ph-door-open' },
  { label: t('schedule.modeTeacher'), value: 'teacher' as const, icon: 'i-ph-user' }
])

const mode = ref<'class' | 'teacher'>(route.query.mode === 'teacher' ? 'teacher' : 'class')

const initialEntityId = Number(route.query.entityId)
const selectedEntityId = ref<number | undefined>(Number.isFinite(initialEntityId) && initialEntityId > 0 ? initialEntityId : undefined)

watch(mode, () => {
  selectedEntityId.value = undefined
})

watch([mode, selectedEntityId], ([modeValue, entityId]) => {
  navigateTo({ query: { ...route.query, mode: modeValue, entityId } }, { replace: true })
})

onMounted(async () => {
  await Promise.all([fetchSchoolClasses(), fetchTeachers(), fetchEntries(), fetchSettings()])
})

const entityOptions = computed(() => mode.value === 'class'
  ? schoolClasses.value.map((schoolClass) => ({ label: formatSchoolClassName(schoolClass), value: schoolClass.id }))
  : teachers.value.map((teacher) => ({ label: `${teacher.last_name} ${teacher.first_name}`, value: teacher.id })))

const subject = computed<ScheduleSubject | undefined>(() =>
  selectedEntityId.value === undefined ? undefined : { type: mode.value, id: selectedEntityId.value }
)

const selectedClass = computed(() => mode.value === 'class'
  ? schoolClasses.value.find((schoolClass) => schoolClass.id === selectedEntityId.value)
  : undefined)
const occupiedHours = computed(() => subject.value === undefined ? 0 : effectiveEntries().filter((entry) =>
  subject.value!.type === 'class' ? entry.school_class_id === subject.value!.id : entry.teacher_id === subject.value!.id
).length)
const targetHours = computed(() => selectedClass.value?.weekly_hours ?? null)

async function handleSave() {
  await saveDraft()
}

function handleRevert() {
  revertDraft()
}

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true
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
      <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/" />
      <h1 class="text-xl font-semibold">{{ t('schedule.title') }}</h1>
    </div>
    <div v-if="isDirty" class="flex items-center justify-between rounded border border-warning bg-warning/10 px-4 py-3">
      <span class="text-sm font-medium">{{ t('schedule.draftBanner') }}</span>
      <div class="flex gap-2">
        <UButton :label="t('schedule.revert')" color="neutral" variant="outline" @click="handleRevert" />
        <UButton :label="t('schedule.save')" @click="handleSave" />
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <UTabs v-model="mode" :content="false" :items="modeItems" class="w-64" />
      <USelectMenu v-model="selectedEntityId" value-key="value" :items="entityOptions" :placeholder="mode === 'class' ? t('schedule.selectClass') : t('schedule.selectTeacher')" class="w-64" />
    </div>
    <p v-if="subject === undefined" class="text-muted">{{ t('schedule.noClassSelected') }}</p>
    <div v-else class="space-y-4">
      <div v-if="mode === 'class'" class="flex items-center gap-2 text-sm">
        <span class="text-muted">{{ t('schedule.classHoursLabel') }}</span>
        <span v-if="targetHours !== null">{{ t('schedule.hoursAssigned', { assigned: occupiedHours, total: targetHours }) }}</span>
        <span v-else class="text-muted">{{ t('schedule.classHoursNoTarget', { assigned: occupiedHours }) }}</span>
        <UBadge v-if="targetHours !== null && occupiedHours === targetHours" :label="t('schedule.complete')" color="success" variant="subtle" size="sm" />
        <UBadge v-else-if="targetHours !== null && occupiedHours > targetHours" :label="t('schedule.overassigned')" color="warning" variant="subtle" size="sm" />
      </div>
      <ScheduleSidebar :subject="subject" />
      <ScheduleGrid :subject="subject" />
    </div>
  </div>
</template>
