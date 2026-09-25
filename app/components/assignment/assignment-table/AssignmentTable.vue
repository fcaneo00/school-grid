<script setup lang="ts">
import { useAssignmentTable } from './useAssignmentTable'

const { t } = useI18n()
const { teacherGroups, loading, columns, expanded, sorting, toggleRow, isClosing, isOpen, schoolClassNameOf, handleDelete } = useAssignmentTable()
</script>

<template>
  <div class="space-y-2">
    <UTable
      v-model:expanded="expanded"
      v-model:sorting="sorting"
      :data="teacherGroups"
      :columns="columns"
      :loading="loading"
      :ui="{ tr: 'border-t-0! border-b border-default data-[expanded=true]:border-transparent' }"
    >
      <template #expand-cell="{ row }">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-down"
          square
          :aria-label="t('assignments.expandDetail')"
          :ui="{ leadingIcon: ['transition-transform', isOpen(row) ? 'duration-200 rotate-180' : ''] }"
          @click="toggleRow(row)"
        />
      </template>
      <template #teacherName-header="{ column }">
        <SortableHeader :column="column" :label="t('assignments.form.teacher')" />
      </template>
      <template #teacherName-cell="{ row }">
        <button type="button" class="cursor-pointer bg-transparent p-0 text-left hover:underline" @click="toggleRow(row)">
          {{ row.original.teacherName }}
        </button>
      </template>
      <template #classCount-header="{ column }">
        <SortableHeader :column="column" :label="t('assignments.classCount')" />
      </template>
      <template #totalHours-header="{ column }">
        <SortableHeader :column="column" :label="t('assignments.totalHours')" />
      </template>
      <template #expanded="{ row }">
        <div
          class="grid overflow-hidden transition-[grid-template-rows] duration-300 starting:grid-rows-[0fr]"
          :class="isClosing(row) ? 'grid-rows-[0fr] ease-in' : 'grid-rows-[1fr] ease-out'"
        >
          <div class="min-h-0 space-y-2 p-2">
            <div
              v-for="assignment in row.original.assignments"
              :key="assignment.id"
              class="flex items-center justify-between gap-4 rounded border border-default px-3 py-2"
            >
              <span>{{ schoolClassNameOf(assignment) }}</span>
              <div class="flex items-center gap-4">
                <span class="text-sm text-muted">{{ t('assignments.form.weeklyHours') }}: {{ assignment.weekly_hours }}</span>
                <div class="flex gap-1">
                  <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" :to="`/assignments/${assignment.id}/edit`" />
                  <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" @click="handleDelete(assignment)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTable>
  </div>
</template>
