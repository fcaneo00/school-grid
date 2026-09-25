<script setup lang="ts">
import { useStudyTrackForm } from './useStudyTrackForm'

interface StudyTrackFormProps {
  id?: number
}

const props = defineProps<StudyTrackFormProps>()

const { t } = useI18n()
const { schema, state, onSubmit } = useStudyTrackForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="name" :label="t('studyTracks.form.name')">
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <div class="flex gap-2">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/study-tracks" />
    </div>
  </UForm>
</template>
