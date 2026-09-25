<script setup lang="ts">
import { useAssignmentBatchForm } from './useAssignmentBatchForm'

const { t } = useI18n()
const { schema, itemSchema, state, teacherOptions, schoolClassOptions, addRow, removeRow, onSubmit } = useAssignmentBatchForm()
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="teacher_id" :label="t('assignments.form.teacher')">
      <USelect v-model="state.teacher_id" :items="teacherOptions" class="w-full" />
    </UFormField>

    <div v-for="(row, index) in state.items" :key="index" class="flex items-end gap-2">
      <UForm :schema="itemSchema" :name="`items.${index}`" nested class="flex flex-1 gap-2">
        <UFormField name="school_class_id" :label="index === 0 ? t('assignments.form.schoolClass') : undefined" class="flex-1">
          <USelect v-model="row.school_class_id" :items="schoolClassOptions" class="w-full" />
        </UFormField>
        <UFormField name="weekly_hours" :label="index === 0 ? t('assignments.form.weeklyHours') : undefined" class="w-32">
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
    <div class="flex gap-2">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/assignments" />
    </div>
  </UForm>
</template>
