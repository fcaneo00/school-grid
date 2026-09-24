<script setup lang="ts">
import { useSubjectTable } from './useSubjectTable'

const { subjects, loading, columns, handleDelete } = useSubjectTable()
</script>

<template>
  <div class="space-y-2">
    <UTable :data="subjects" :columns="columns" :loading="loading">
      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          :to="`/subjects/${row.original.id}/edit`"
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
