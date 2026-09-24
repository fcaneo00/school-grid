<script setup lang="ts">
import { useTeacherTable } from './useTeacherTable'

const { teachers, loading, columns, handleDelete } = useTeacherTable()
</script>

<template>
  <div class="space-y-2">
    <UTable :data="teachers" :columns="columns" :loading="loading">
      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          :to="`/teachers/${row.original.id}/edit`"
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
