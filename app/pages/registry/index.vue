<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/" />
      <h1 class="text-xl font-semibold">{{ t('registry.title') }}</h1>
    </div>
    <UPageGrid>
      <UPageCard :title="t('teachers.title')" icon="i-ph-user" to="/teachers" />
      <UPageCard :title="t('sections.title')" icon="i-ph-text-aa" to="/sections" />
      <UPageCard :title="t('studyTracks.title')" icon="i-ph-graduation-cap" to="/study-tracks" />
      <UPageCard :title="t('schoolClasses.title')" icon="i-ph-door-open" to="/school-classes" />
      <UPageCard :title="t('assignments.title')" icon="i-ph-armchair" to="/assignments" />
    </UPageGrid>
  </div>
</template>
