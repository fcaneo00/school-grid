<script setup lang="ts">
import { useAssignmentForm } from './useAssignmentForm'

const props = defineProps<{ id?: number }>()

const { t } = useI18n()
const { schema, state, submitLabel, teacherOptions, schoolClassOptions, subjectOptions, onSubmit } = useAssignmentForm(props.id)
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="teacher_id" :label="t('assignments.form.teacher')">
      <USelect v-model="state.teacher_id" :items="teacherOptions" class="w-full" />
    </UFormField>
    <UFormField name="school_class_id" :label="t('assignments.form.schoolClass')">
      <USelect v-model="state.school_class_id" :items="schoolClassOptions" class="w-full" />
    </UFormField>
    <UFormField name="subject_id" :label="t('assignments.form.subject')">
      <USelect v-model="state.subject_id" :items="subjectOptions" class="w-full" />
    </UFormField>
    <UFormField name="weekly_hours" :label="t('assignments.form.weeklyHours')">
      <UInputNumber v-model="state.weekly_hours" :min="1" class="w-full" />
    </UFormField>
    <UButton type="submit" :label="submitLabel" />
  </UForm>
</template>
