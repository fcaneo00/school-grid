<script setup lang="ts">
import { useAssignmentTable } from './useAssignmentTable'

const { assignments, loading, columns, handleDelete } = useAssignmentTable()
</script>

<template>
  <div class="space-y-2">
    <UTable :data="assignments" :columns="columns" :loading="loading">
      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          :to="`/assignments/${row.original.id}/edit`"
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
