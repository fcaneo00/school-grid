<script setup lang="ts">
const { t } = useI18n()
const { filters } = useTeacherFilters()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/registry" />
        <h1 class="text-xl font-semibold">{{ t('teachers.title') }}</h1>
      </div>
      <div class="flex gap-2">
        <UPopover>
          <UButton :label="t('table.filters')" icon="i-ph-funnel" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 space-y-2 w-64">
              <ClearableInput v-model="filters.last_name" :placeholder="t('teachers.form.lastName')" />
              <ClearableInput v-model="filters.first_name" :placeholder="t('teachers.form.firstName')" />
            </div>
          </template>
        </UPopover>
        <UButton :label="t('teachers.addButton')" to="/teachers/new" />
      </div>
    </div>
    <TeacherTable />
  </div>
</template>
