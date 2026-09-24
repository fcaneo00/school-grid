<script setup lang="ts">
const { t } = useI18n()
const { filters } = useSchoolClassFilters()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">{{ t('schoolClasses.title') }}</h1>
      <div class="flex gap-2">
        <UPopover>
          <UButton :label="t('table.filters')" icon="i-lucide-filter" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 space-y-2 w-64">
              <ClearableInputNumber v-model="filters.year" :placeholder="t('schoolClasses.form.year')" :min="1" :max="5" />
              <ClearableInput v-model="filters.section_name" :placeholder="t('schoolClasses.form.section')" />
              <ClearableInput v-model="filters.study_track_name" :placeholder="t('schoolClasses.form.studyTrack')" />
            </div>
          </template>
        </UPopover>
        <UButton :label="t('schoolClasses.addButton')" to="/school-classes/new" />
      </div>
    </div>
    <SchoolClassTable />
  </div>
</template>
