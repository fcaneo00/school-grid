<script setup lang="ts">
const { t } = useI18n()
const { filters } = useSubjectFilters()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">{{ t('subjects.title') }}</h1>
      <div class="flex gap-2">
        <UPopover>
          <UButton :label="t('table.filters')" icon="i-lucide-filter" color="neutral" variant="outline" />
          <template #content>
            <div class="p-4 space-y-2 w-64">
              <ClearableInput v-model="filters.name" :placeholder="t('subjects.form.name')" />
            </div>
          </template>
        </UPopover>
        <UButton :label="t('subjects.addButton')" to="/subjects/new" />
      </div>
    </div>
    <SubjectTable />
  </div>
</template>
