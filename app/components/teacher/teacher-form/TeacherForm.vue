<script setup lang="ts">
import { useTeacherForm } from './useTeacherForm'

interface TeacherFormProps {
  id?: number
}

const props = defineProps<TeacherFormProps>()

const { t } = useI18n()
const {
  schema,
  unavailableHoursSchema,
  state,
  firstNameModel,
  lastNameModel,
  dayOffOptions,
  hourOptions,
  activeHourSlots,
  returnTo,
  addUnavailableHoursRow,
  removeUnavailableHoursRow,
  onSubmit
} = useTeacherForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="first_name" :label="t('teachers.form.firstName')">
      <UInput v-model="firstNameModel" class="w-full" />
    </UFormField>
    <UFormField name="last_name" :label="t('teachers.form.lastName')">
      <UInput v-model="lastNameModel" class="w-full" />
    </UFormField>
    <div class="col-span-full space-y-2">
      <p class="text-sm font-medium">{{ t('teachers.form.dayOff') }}</p>
      <p class="text-sm text-muted">{{ t('teachers.form.dayOffDescription') }}</p>
      <UFormField name="day_off" class="max-w-xs">
        <USelect v-model="state.day_off" :items="dayOffOptions" multiple :placeholder="t('teachers.form.noDayOff')" class="w-full" />
      </UFormField>
    </div>

    <div class="col-span-full space-y-2">
      <p class="text-sm font-medium">{{ t('teachers.form.unavailableHours') }}</p>
      <p class="text-sm text-muted">{{ t('teachers.form.unavailableHoursDescription') }}</p>
      <div
        v-for="(row, index) in state.unavailable_hours"
        :key="index"
        class="flex items-start gap-2 border-b border-default pb-4 last:border-b-0 last:pb-0"
      >
        <UForm :schema="unavailableHoursSchema" :name="`unavailable_hours.${index}`" nested class="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField name="day" :label="t('teachers.form.unavailableHoursDay')">
            <USelect v-model="row.day" :items="dayOffOptions" class="w-full" />
          </UFormField>
          <UFormField name="hours" :label="t('teachers.form.unavailableHoursSelect')">
            <USelect v-model="row.hours" :items="hourOptions" multiple :placeholder="t('teachers.form.noUnavailableHours')" class="w-full" />
          </UFormField>
        </UForm>
        <UButton
          icon="i-ph-trash"
          color="error"
          variant="ghost"
          :aria-label="t('form.removeRow')"
          @click="removeUnavailableHoursRow(index)"
        />
      </div>
      <UButton :label="t('form.addRow')" icon="i-ph-plus" color="neutral" variant="outline" size="sm" @click="addUnavailableHoursRow" />
    </div>

    <div class="col-span-full space-y-2">
      <p class="text-sm font-medium">{{ t('teachers.form.maxConsecutiveHours') }}</p>
      <p class="text-sm text-muted">{{ t('teachers.form.maxConsecutiveHoursDescription') }}</p>
      <UFormField name="max_consecutive_hours" class="max-w-xs">
        <ClearableInputNumber v-model="state.max_consecutive_hours" :min="1" :max="activeHourSlots.length" />
      </UFormField>
    </div>

    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" :to="returnTo" />
    </div>
  </UForm>
</template>
