<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'

interface SortableHeaderProps {
  column: Column<TData, unknown>
  label: string
}

const props = defineProps<SortableHeaderProps>()

const icon = computed(() => {
  const sorted = props.column.getIsSorted()
  if (sorted === 'asc') return 'i-lucide-arrow-up-narrow-wide'
  if (sorted === 'desc') return 'i-lucide-arrow-down-wide-narrow'
  return 'i-lucide-arrow-up-down'
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
