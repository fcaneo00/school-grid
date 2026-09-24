<script setup lang="ts">
definePageMeta({ alias: '/' })

const { t } = useI18n()
const { filters } = useTeacherFilters()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">{{ t('teachers.title') }}</h1>
      <div class="flex gap-2">
        <UPopover>
          <UButton :label="t('table.filters')" icon="i-lucide-filter" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 space-y-2 w-64">
              <ClearableInput v-model="filters.first_name" :placeholder="t('teachers.form.firstName')" />
              <ClearableInput v-model="filters.last_name" :placeholder="t('teachers.form.lastName')" />
            </div>
          </template>
        </UPopover>
        <UButton :label="t('teachers.addButton')" to="/teachers/new" />
      </div>
    </div>
    <TeacherTable />
  </div>
</template>
