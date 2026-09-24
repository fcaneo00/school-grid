<script setup lang="ts">
import { useStudyTrackTable } from './useStudyTrackTable'

const { studyTracks, loading, columns, handleDelete } = useStudyTrackTable()
</script>

<template>
  <div class="space-y-2">
    <UTable :data="studyTracks" :columns="columns" :loading="loading">
      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          :to="`/study-tracks/${row.original.id}/edit`"
        />
        <UButton
          icon="i-lucide-trash"
          color="error"
          variant="ghost"
          @click="handleDelete(row.original)"
        />
      </template>
    </UTable>
  </div>
</template>
