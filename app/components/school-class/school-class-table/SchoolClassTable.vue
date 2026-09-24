<script setup lang="ts">
import { useSchoolClassTable } from './useSchoolClassTable'

const { schoolClasses, loading, columns, handleDelete } = useSchoolClassTable()
</script>

<template>
  <div class="space-y-2">
    <UTable :data="schoolClasses" :columns="columns" :loading="loading">
      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          :to="`/classes/${row.original.id}/edit`"
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
