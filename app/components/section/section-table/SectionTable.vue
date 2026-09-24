<script setup lang="ts">
import { useSectionTable } from './useSectionTable'

const { sections, loading, columns, handleDelete } = useSectionTable()
</script>

<template>
  <div class="space-y-2">
    <UTable :data="sections" :columns="columns" :loading="loading">
      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          :to="`/sections/${row.original.id}/edit`"
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
