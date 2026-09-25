<script setup lang="ts">
const { t } = useI18n()
const { filters } = useTeacherFilters()

const dayOffFilterOptions = computed(() => [
  { label: t('teachers.form.allDayOff'), value: null },
  ...WEEKDAY_VALUES.map((day) => ({ label: t(`weekdays.${day}`), value: day }))
])
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
              <USelect v-model="filters.day_off" :items="dayOffFilterOptions" :placeholder="t('teachers.form.dayOff')" class="w-full" />
            </div>
          </template>
        </UPopover>
        <UButton :label="t('teachers.addButton')" to="/teachers/new" />
      </div>
    </div>
    <TeacherTable />
  </div>
</template>
