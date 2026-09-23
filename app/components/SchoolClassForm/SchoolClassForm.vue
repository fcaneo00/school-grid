<script setup lang="ts">
import { useSchoolClassForm } from './useSchoolClassForm'

const { t } = useI18n()
const { schema, state, onSubmit } = useSchoolClassForm()
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFieldGroup>
      <UFormField name="name" :label="t('schoolClasses.form.name')">
        <UInput v-model="state.name" />
      </UFormField>
      <UFormField name="section" :label="t('schoolClasses.form.section')">
        <UInput v-model="state.section" />
      </UFormField>
    </UFieldGroup>
    <UButton type="submit" :label="t('form.submit')" />
  </UForm>
</template>
