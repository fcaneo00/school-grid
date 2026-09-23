<script setup lang="ts">
import { useTeacherForm } from './useTeacherForm'

const { schema, state, onSubmit } = useTeacherForm()
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFieldGroup>
      <UFormField name="first_name" label="Nome">
        <UInput v-model="state.first_name" />
      </UFormField>
      <UFormField name="last_name" label="Cognome">
        <UInput v-model="state.last_name" />
      </UFormField>
    </UFieldGroup>
    <UButton type="submit" label="Aggiungi" />
  </UForm>
</template>
