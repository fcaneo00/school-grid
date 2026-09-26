<script setup lang="ts">
import { useSectionForm } from './useSectionForm'

interface SectionFormProps {
  id?: number
}

const props = defineProps<SectionFormProps>()

const { t } = useI18n()
const { schema, state, onSubmit } = useSectionForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="name" :label="t('sections.form.name')">
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/sections" />
    </div>
  </UForm>
</template>
