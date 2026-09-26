<script setup lang="ts">
import { useSettingsForm } from './useSettingsForm'

const { t } = useI18n()
const { schema, state, activeWeekdayOptions, onSubmit } = useSettingsForm()
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="active_weekdays" :label="t('settings.activeWeekdays')">
      <USelect v-model="state.active_weekdays" :items="activeWeekdayOptions" multiple class="w-full" />
    </UFormField>
    <UFormField name="max_daily_hours" :label="t('settings.maxDailyHours')">
      <UInputNumber v-model="state.max_daily_hours" :min="1" :max="HOUR_SLOT_VALUES.length" class="w-full" />
    </UFormField>
    <UButton type="submit" :label="t('settings.saveButton')" class="col-span-full" />
  </UForm>
</template>
