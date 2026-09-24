<script setup lang="ts">
import { useTeacherForm } from './useTeacherForm'

const props = defineProps<{ id?: number }>()

const { t } = useI18n()
const { schema, state, submitLabel, onSubmit } = useTeacherForm(props.id)
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="first_name" :label="t('teachers.form.firstName')">
      <UInput v-model="state.first_name" class="w-full" />
    </UFormField>
    <UFormField name="last_name" :label="t('teachers.form.lastName')">
      <UInput v-model="state.last_name" class="w-full" />
    </UFormField>
    <UButton type="submit" :label="submitLabel" />
  </UForm>
</template>
