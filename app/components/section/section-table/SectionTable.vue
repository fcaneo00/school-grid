<script setup lang="ts">
import { useSectionTable } from './useSectionTable'

const { t } = useI18n()
const { sections, loading, columns, sorting, handleDelete } = useSectionTable()
</script>

<template>
  <div class="space-y-2">
    <UTable v-model:sorting="sorting" :data="sections" :columns="columns" :loading="loading">
      <template #name-header="{ column }">
        <SortableHeader :column="column" :label="t('sections.form.name')" />
      </template>
      <template #actions-cell="{ row }">
        <UButton
          icon="i-ph-pencil"
          color="neutral"
          variant="ghost"
          :to="`/sections/${row.original.id}/edit`"
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
