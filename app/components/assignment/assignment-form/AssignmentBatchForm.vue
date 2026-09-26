<script setup lang="ts">
import { useAssignmentBatchForm } from './useAssignmentBatchForm'

const { t } = useI18n()
const { schema, itemSchema, state, teacherOptions, schoolClassOptions, addRow, removeRow, onSubmit } = useAssignmentBatchForm()
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="teacher_id" :label="t('assignments.form.teacher')">
      <USelect v-model="state.teacher_id" :items="teacherOptions" class="w-full" />
    </UFormField>

    <div class="col-span-full space-y-4">
      <div v-for="(row, index) in state.items" :key="index" class="flex items-start gap-2 border-b border-default pb-4 last:border-b-0 last:pb-0">
        <UForm :schema="itemSchema" :name="`items.${index}`" nested class="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UFormField name="school_class_id" :label="t('assignments.form.schoolClass')">
            <USelect v-model="row.school_class_id" :items="schoolClassOptions" class="w-full" />
          </UFormField>
          <UFormField name="weekly_hours" :label="t('assignments.form.weeklyHours')">
            <UInputNumber v-model="row.weekly_hours" :min="1" class="w-full" />
          </UFormField>
        </UForm>
        <UButton
          v-if="state.items.length > 1"
          icon="i-ph-trash"
          color="error"
          variant="ghost"
          :aria-label="t('form.removeRow')"
          @click="removeRow(index)"
        />
      </div>
      <UButton :label="t('form.addRow')" icon="i-ph-plus" color="neutral" variant="outline" @click="addRow" />
    </div>
    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/assignments" />
    </div>
  </UForm>
</template>
