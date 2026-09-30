<script setup lang="ts">
import { useTeacherForm } from './useTeacherForm'

interface TeacherFormProps {
  id?: number
}

const props = defineProps<TeacherFormProps>()

const { t } = useI18n()
const {
  schema,
  timeConstraintSchema,
  state,
  dayOffOptions,
  hourOptions,
  returnTo,
  addTimeConstraintRow,
  removeTimeConstraintRow,
  onSubmit
} = useTeacherForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="first_name" :label="t('teachers.form.firstName')">
      <UInput v-model="state.first_name" class="w-full" />
    </UFormField>
    <UFormField name="last_name" :label="t('teachers.form.lastName')">
      <UInput v-model="state.last_name" class="w-full" />
    </UFormField>
    <UFormField name="day_off" :label="t('teachers.form.dayOff')">
      <USelect v-model="state.day_off" :items="dayOffOptions" multiple :placeholder="t('teachers.form.noDayOff')" class="w-full" />
    </UFormField>

    <div class="col-span-full space-y-2">
      <p class="text-sm font-medium">{{ t('teachers.form.timeConstraints') }}</p>
      <p class="text-sm text-muted">{{ t('teachers.form.timeConstraintsDescription') }}</p>
      <div
        v-for="(row, index) in state.time_constraints"
        :key="index"
        class="flex items-start gap-2 border-b border-default pb-4 last:border-b-0 last:pb-0"
      >
        <UForm :schema="timeConstraintSchema" :name="`time_constraints.${index}`" nested class="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          <UFormField name="day" :label="t('teachers.form.timeConstraintDay')">
            <USelect v-model="row.day" :items="dayOffOptions" class="w-full" />
          </UFormField>
          <UFormField name="not_before" :label="t('teachers.form.notBefore')">
            <USelect v-model="row.not_before" :items="hourOptions" class="w-full" />
          </UFormField>
          <UFormField name="not_after" :label="t('teachers.form.notAfter')">
            <USelect v-model="row.not_after" :items="hourOptions" class="w-full" />
          </UFormField>
          <p v-if="isTimeConstraintOrderInvalid(row)" class="text-error text-xs sm:col-span-3">
            {{ t('teachers.form.timeConstraintOrderInvalid') }}
          </p>
        </UForm>
        <UButton
          icon="i-ph-trash"
          color="error"
          variant="ghost"
          :aria-label="t('form.removeRow')"
          @click="removeTimeConstraintRow(index)"
        />
      </div>
      <UButton :label="t('form.addRow')" icon="i-ph-plus" color="neutral" variant="outline" size="sm" @click="addTimeConstraintRow" />
    </div>

    <div class="col-span-full space-y-2">
      <p class="text-sm font-medium">{{ t('teachers.form.maxConsecutiveHours') }}</p>
      <p class="text-sm text-muted">{{ t('teachers.form.maxConsecutiveHoursDescription') }}</p>
      <UFormField name="max_consecutive_hours" class="max-w-xs">
        <ClearableInputNumber v-model="state.max_consecutive_hours" :min="1" :max="HOUR_SLOT_VALUES.length" />
      </UFormField>
    </div>

    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" :to="returnTo" />
    </div>
  </UForm>
</template>
