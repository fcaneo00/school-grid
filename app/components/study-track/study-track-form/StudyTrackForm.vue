<script setup lang="ts">
import { useStudyTrackForm } from './useStudyTrackForm'

interface StudyTrackFormProps {
  id?: number
}

const props = defineProps<StudyTrackFormProps>()

const { t } = useI18n()
const { schema, state, submitLabel, onSubmit } = useStudyTrackForm(props.id)
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="name" :label="t('studyTracks.form.name')">
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <UButton type="submit" :label="submitLabel" />
  </UForm>
</template>
