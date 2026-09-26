<script setup lang="ts">
import { useSchoolClassForm } from './useSchoolClassForm'

interface SchoolClassFormProps {
  id: number
}

const props = defineProps<SchoolClassFormProps>()

const { t } = useI18n()
const { schema, state, sectionOptions, studyTrackOptions, onSubmit } = useSchoolClassForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="year" :label="t('schoolClasses.form.year')">
      <UInputNumber v-model="state.year" :min="1" :max="5" class="w-full" />
    </UFormField>
    <UFormField name="section_id" :label="t('schoolClasses.form.section')">
      <USelect v-model="state.section_id" :items="sectionOptions" class="w-full" />
    </UFormField>
    <UFormField name="study_track_id" :label="t('schoolClasses.form.studyTrack')">
      <USelect v-model="state.study_track_id" :items="studyTrackOptions" class="w-full" />
    </UFormField>
    <UFormField name="weekly_hours" :label="t('schoolClasses.form.weeklyHours')">
      <UInputNumber v-model="state.weekly_hours" :min="1" :max="36" class="w-full" />
    </UFormField>
    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/school-classes" />
    </div>
  </UForm>
</template>
