<script setup lang="ts">
import { useSchoolClassForm } from './useSchoolClassForm'

const props = defineProps<{ id?: number }>()

const { t } = useI18n()
const { schema, state, submitLabel, studyTrackOptions, onSubmit } = useSchoolClassForm(props.id)
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="year" :label="t('schoolClasses.form.year')">
      <UInputNumber v-model="state.year" :min="1" :max="5" class="w-full" />
    </UFormField>
    <UFormField name="section" :label="t('schoolClasses.form.section')">
      <UInput v-model="state.section" class="w-full" />
    </UFormField>
    <UFormField name="study_track_id" :label="t('schoolClasses.form.studyTrack')">
      <USelect v-model="state.study_track_id" :items="studyTrackOptions" class="w-full" />
    </UFormField>
    <UButton type="submit" :label="submitLabel" />
  </UForm>
</template>
