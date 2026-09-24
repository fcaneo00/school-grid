<script setup lang="ts">
import { useSubjectForm } from './useSubjectForm'

const props = defineProps<{ id?: number }>()

const { t } = useI18n()
const { schema, state, submitLabel, onSubmit } = useSubjectForm(props.id)
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="name" :label="t('subjects.form.name')">
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <UButton type="submit" :label="submitLabel" />
  </UForm>
</template>
