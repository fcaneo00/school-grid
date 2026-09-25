<script setup lang="ts">
import { useSchoolClassTable } from './useSchoolClassTable'

const { t } = useI18n()
const { sectionGroups, loading, columns, expanded, sorting, handleDelete } = useSchoolClassTable()
</script>

<template>
  <div class="space-y-2">
    <UTable
      v-model:expanded="expanded"
      v-model:sorting="sorting"
      :data="sectionGroups"
      :columns="columns"
      :loading="loading"
    >
      <template #expand-cell="{ row }">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-down"
          square
          :aria-label="t('schoolClasses.expandDetail')"
          :ui="{ leadingIcon: ['transition-transform', row.getIsExpanded() ? 'duration-200 rotate-180' : ''] }"
          @click="row.toggleExpanded()"
        />
      </template>
      <template #sectionName-header="{ column }">
        <SortableHeader :column="column" :label="t('schoolClasses.form.section')" />
      </template>
      <template #sectionName-cell="{ row }">
        <button type="button" class="cursor-pointer bg-transparent p-0 text-left hover:underline" @click="row.toggleExpanded()">
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
        <div class="space-y-2 p-2">
          <div
            v-for="schoolClass in row.original.classes"
            :key="schoolClass.id"
            class="flex items-center justify-between gap-4 rounded border border-default px-3 py-2"
          >
            <span>{{ t('schoolClasses.yearOrdinal', { year: schoolClass.year }) }}</span>
            <div class="flex items-center gap-4">
              <span v-if="!row.original.studyTrackUniform" class="text-sm text-muted">{{ schoolClass.study_track_name ?? '-' }}</span>
              <div class="flex gap-1">
                <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" :to="`/school-classes/${schoolClass.id}/edit`" />
                <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" @click="handleDelete(schoolClass)" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTable>
  </div>
</template>
