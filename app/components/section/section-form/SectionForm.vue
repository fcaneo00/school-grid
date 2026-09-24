<script setup lang="ts">
import { useSectionForm } from './useSectionForm'

interface SectionFormProps {
  id?: number
}

const props = defineProps<SectionFormProps>()

const { t } = useI18n()
const { schema, state, submitLabel, onSubmit } = useSectionForm(props.id)
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="name" :label="t('sections.form.name')">
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <UButton type="submit" :label="submitLabel" />
  </UForm>
</template>
