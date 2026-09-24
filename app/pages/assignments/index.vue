<script setup lang="ts">
const { t } = useI18n()
const { filters } = useAssignmentFilters()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">{{ t('assignments.title') }}</h1>
      <div class="flex gap-2">
        <UPopover>
          <UButton :label="t('table.filters')" icon="i-lucide-filter" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 space-y-2 w-64">
              <ClearableInput v-model="filters.teacher" :placeholder="t('assignments.form.teacher')" />
              <ClearableInput v-model="filters.schoolClass" :placeholder="t('assignments.form.schoolClass')" />
              <ClearableInput v-model="filters.subject" :placeholder="t('assignments.form.subject')" />
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
