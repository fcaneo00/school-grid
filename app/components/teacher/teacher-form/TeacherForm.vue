<script setup lang="ts">
import { useTeacherForm } from './useTeacherForm'

interface TeacherFormProps {
  id?: number
}

const props = defineProps<TeacherFormProps>()

const { t } = useI18n()
const { schema, state, dayOffOptions, returnTo, onSubmit } = useTeacherForm(toRef(() => props.id))
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" @submit="onSubmit">
    <UFormField name="first_name" :label="t('teachers.form.firstName')">
      <UInput v-model="state.first_name" class="w-full" />
    </UFormField>
    <UFormField name="last_name" :label="t('teachers.form.lastName')">
      <UInput v-model="state.last_name" class="w-full" />
    </UFormField>
    <UFormField name="day_off" :label="t('teachers.form.dayOff')">
      <USelect v-model="state.day_off" :items="dayOffOptions" multiple :placeholder="t('teachers.form.noDayOff')" class="w-full" />
    </UFormField>
    <div class="flex gap-2 col-span-full">
      <UButton type="submit" :label="t('table.save')" />
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" :to="returnTo" />
    </div>
  </UForm>
</template>
