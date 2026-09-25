<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/teachers" />
      <h1 class="text-xl font-semibold">{{ t('teachers.addButton') }}</h1>
    </div>
    <TeacherForm />
  </div>
</template>
