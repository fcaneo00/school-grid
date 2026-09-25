<script setup lang="ts">
import { useTeacherTable } from './useTeacherTable'

const { t } = useI18n()
const { teachers, loading, columns, sorting, handleDelete } = useTeacherTable()
</script>

<template>
  <div class="space-y-2">
    <UTable v-model:sorting="sorting" :data="teachers" :columns="columns" :loading="loading">
      <template #last_name-header="{ column }">
        <SortableHeader :column="column" :label="t('teachers.form.lastName')" />
      </template>
      <template #first_name-header="{ column }">
        <SortableHeader :column="column" :label="t('teachers.form.firstName')" />
      </template>
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
