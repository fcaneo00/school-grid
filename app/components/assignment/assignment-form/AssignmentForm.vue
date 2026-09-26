<script setup lang="ts">
import { useAssignmentForm } from './useAssignmentForm'

interface AssignmentFormProps {
  id: number
}

const props = defineProps<AssignmentFormProps>()

const { t } = useI18n()
const { schema, state, teacherOptions, schoolClassOptions, returnTo, onSubmit } = useAssignmentForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="teacher_id" :label="t('assignments.form.teacher')">
      <USelect v-model="state.teacher_id" :items="teacherOptions" class="w-full" />
    </UFormField>
    <UFormField name="school_class_id" :label="t('assignments.form.schoolClass')">
      <USelect v-model="state.school_class_id" :items="schoolClassOptions" class="w-full" />
    </UFormField>
    <UFormField name="weekly_hours" :label="t('assignments.form.weeklyHours')">
      <UInputNumber v-model="state.weekly_hours" :min="1" class="w-full" />
    </UFormField>
    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" :to="returnTo" />
    </div>
  </UForm>
</template>
