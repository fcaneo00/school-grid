<script setup lang="ts">
const { t } = useI18n()
const { filters } = useStudyTrackFilters()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/registry" />
        <h1 class="text-xl font-semibold">{{ t('studyTracks.title') }}</h1>
      </div>
      <div class="flex gap-2">
        <UPopover>
          <UButton :label="t('table.filters')" icon="i-ph-funnel" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 space-y-2 w-64">
              <ClearableInput v-model="filters.name" :placeholder="t('studyTracks.form.name')" />
            </div>
          </template>
        </UPopover>
        <UButton :label="t('studyTracks.addButton')" to="/study-tracks/new" />
      </div>
    </div>
    <StudyTrackTable />
  </div>
</template>
