<script setup lang="ts">
import { useSchoolClassTable } from './useSchoolClassTable'

const { t } = useI18n()
const { sectionGroups, loading, columns, expanded, sorting, toggleRow, isClosing, isOpen, handleDelete } = useSchoolClassTable()
</script>

<template>
  <div class="space-y-2">
    <UTable
      v-model:expanded="expanded"
      v-model:sorting="sorting"
      :data="sectionGroups"
      :columns="columns"
      :loading="loading"
      :ui="{ tr: 'border-t-0! border-b border-default data-[expanded=true]:border-transparent' }"
    >
      <template #expand-cell="{ row }">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-ph-caret-down"
          square
          :aria-label="t('schoolClasses.expandDetail')"
          :ui="{ leadingIcon: ['transition-transform', isOpen(row) ? 'duration-200 rotate-180' : ''] }"
          @click="toggleRow(row)"
        />
      </template>
      <template #sectionName-header="{ column }">
        <SortableHeader :column="column" :label="t('schoolClasses.form.section')" />
      </template>
      <template #sectionName-cell="{ row }">
        <button type="button" class="cursor-pointer bg-transparent p-0 text-left hover:underline" @click="toggleRow(row)">
          {{ row.original.sectionName }}
        </button>
      </template>
      <template #studyTrackLabel-header="{ column }">
        <SortableHeader :column="column" :label="t('schoolClasses.form.studyTrack')" />
      </template>
      <template #classCount-header="{ column }">
        <SortableHeader :column="column" :label="t('schoolClasses.classCount')" />
      </template>
      <template #expanded="{ row }">
        <div
          class="grid overflow-hidden transition-[grid-template-rows] duration-300 starting:grid-rows-[0fr]"
          :class="isClosing(row) ? 'grid-rows-[0fr] ease-in' : 'grid-rows-[1fr] ease-out'"
        >
          <div class="min-h-0 space-y-2 p-2">
            <div
              v-for="schoolClass in row.original.classes"
              :key="schoolClass.id"
              class="flex items-center justify-between gap-4 rounded border border-default px-3 py-2"
            >
              <span>{{ t('schoolClasses.yearOrdinal', { year: schoolClass.year }) }}</span>
              <div class="flex items-center gap-4">
                <span v-if="!row.original.studyTrackUniform" class="text-sm text-muted">{{ schoolClass.study_track_name ?? '-' }}</span>
                <span class="text-sm text-muted">{{ schoolClass.weekly_hours !== null ? t('schoolClasses.weeklyHoursValue', { hours: schoolClass.weekly_hours }) : t('schoolClasses.weeklyHoursNotSet') }}</span>
                <div class="flex gap-1">
                  <UButton icon="i-ph-pencil" color="neutral" variant="ghost" size="xs" :to="`/school-classes/${schoolClass.id}/edit`" />
                  <UButton icon="i-ph-trash" color="error" variant="ghost" size="xs" @click="handleDelete(schoolClass)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTable>
  </div>
</template>
