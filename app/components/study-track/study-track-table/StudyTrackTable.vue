<script setup lang="ts">
import { useStudyTrackTable } from './useStudyTrackTable'

const { t } = useI18n()
const { studyTracks, loading, columns, sorting, handleDelete } = useStudyTrackTable()
</script>

<template>
  <div class="space-y-2">
    <UTable v-model:sorting="sorting" :data="studyTracks" :columns="columns" :loading="loading">
      <template #name-header="{ column }">
        <SortableHeader :column="column" :label="t('studyTracks.form.name')" />
      </template>
      <template #actions-cell="{ row }">
        <UButton
          icon="i-ph-pencil"
          color="neutral"
          variant="ghost"
          :to="`/study-tracks/${row.original.id}/edit`"
        />
        <UButton
          icon="i-ph-trash"
          color="error"
          variant="ghost"
          @click="handleDelete(row.original)"
        />
      </template>
    </UTable>
  </div>
</template>
