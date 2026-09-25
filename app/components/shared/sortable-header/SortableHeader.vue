<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'

interface SortableHeaderProps {
  column: Column<TData, unknown>
  label: string
}

const props = defineProps<SortableHeaderProps>()

const icon = computed(() => {
  const sorted = props.column.getIsSorted()
  if (sorted === 'asc') return 'i-ph-sort-ascending'
  if (sorted === 'desc') return 'i-ph-sort-descending'
  return 'i-ph-arrows-down-up'
})
</script>

<template>
  <UButton
    :label="label"
    :icon="icon"
    color="neutral"
    variant="ghost"
    class="-mx-2.5"
    @click="column.toggleSorting(column.getIsSorted() === 'asc')"
  />
</template>
