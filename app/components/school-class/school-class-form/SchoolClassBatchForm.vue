<script setup lang="ts">
import { useSchoolClassBatchForm } from './useSchoolClassBatchForm'

const { t } = useI18n()
const { itemSchema, state, sectionOptions, studyTrackOptions, addRow, removeRow, onSubmit } = useSchoolClassBatchForm()
</script>

<template>
  <UForm :state="state" class="space-y-4" @submit="onSubmit">
    <div v-for="(row, index) in state.items" :key="index" class="flex items-end gap-2">
      <UForm :schema="itemSchema" :name="`items.${index}`" nested class="flex flex-1 gap-2">
        <UFormField name="year" :label="index === 0 ? t('schoolClasses.form.year') : undefined" class="w-24">
          <UInputNumber v-model="row.year" :min="1" :max="5" class="w-full" />
        </UFormField>
        <UFormField name="section_id" :label="index === 0 ? t('schoolClasses.form.section') : undefined" class="flex-1">
          <USelect v-model="row.section_id" :items="sectionOptions" class="w-full" />
        </UFormField>
        <UFormField name="study_track_id" :label="index === 0 ? t('schoolClasses.form.studyTrack') : undefined" class="flex-1">
          <USelect v-model="row.study_track_id" :items="studyTrackOptions" class="w-full" />
        </UFormField>
        <UFormField name="weekly_hours" :label="index === 0 ? t('schoolClasses.form.weeklyHours') : undefined" class="w-28">
          <UInputNumber v-model="row.weekly_hours" :min="1" :max="36" class="w-full" />
        </UFormField>
      </UForm>
      <UButton
        v-if="state.items.length > 1"
        icon="i-ph-trash"
        color="error"
        variant="ghost"
        :aria-label="t('form.removeRow')"
        @click="removeRow(index)"
      />
    </div>
    <UButton :label="t('form.addRow')" icon="i-ph-plus" color="neutral" variant="outline" @click="addRow" />
    <div class="flex gap-2">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/school-classes" />
    </div>
  </UForm>
</template>
