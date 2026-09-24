<script setup lang="ts">
const { t } = useI18n()
const { filters } = useAssignmentFilters()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/registry" />
        <h1 class="text-xl font-semibold">{{ t('assignments.title') }}</h1>
      </div>
      <div class="flex gap-2">
        <UPopover>
          <UButton :label="t('table.filters')" icon="i-lucide-filter" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 space-y-2 w-64">
              <ClearableInput v-model="filters.teacher" :placeholder="t('assignments.form.teacher')" />
              <ClearableInput v-model="filters.schoolClass" :placeholder="t('assignments.form.schoolClass')" />
              <ClearableInputNumber v-model="filters.weeklyHours" :placeholder="t('assignments.form.weeklyHours')" :min="1" />
            </div>
          </template>
        </UPopover>
        <UButton :label="t('assignments.addButton')" to="/assignments/new" />
      </div>
    </div>
    <AssignmentTable />
  </div>
</template>
