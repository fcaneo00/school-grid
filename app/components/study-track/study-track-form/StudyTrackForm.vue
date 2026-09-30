<script setup lang="ts">
import { useStudyTrackForm } from './useStudyTrackForm'

interface StudyTrackFormProps {
  id?: number
}

const props = defineProps<StudyTrackFormProps>()

const { t } = useI18n()
const { schema, state, nameModel, onSubmit } = useStudyTrackForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="name" :label="t('studyTracks.form.name')">
      <UInput v-model="nameModel" class="w-full" />
    </UFormField>
    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/study-tracks" />
    </div>
  </UForm>
</template>
