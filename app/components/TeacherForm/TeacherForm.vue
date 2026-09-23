<script setup lang="ts">
import { useTeacherForm } from './useTeacherForm'

const { t } = useI18n()
const { schema, state, onSubmit } = useTeacherForm()
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFieldGroup>
      <UFormField name="first_name" :label="t('teachers.form.firstName')">
        <UInput v-model="state.first_name" />
      </UFormField>
      <UFormField name="last_name" :label="t('teachers.form.lastName')">
        <UInput v-model="state.last_name" />
      </UFormField>
    </UFieldGroup>
    <UButton type="submit" :label="t('form.submit')" />
  </UForm>
</template>
