<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/" />
      <h1 class="text-xl font-semibold">{{ t('registry.title') }}</h1>
    </div>
    <UPageGrid>
      <UPageCard :title="t('teachers.title')" icon="i-lucide-user" to="/teachers" />
      <UPageCard :title="t('sections.title')" icon="i-lucide-baseline" to="/sections" />
      <UPageCard :title="t('studyTracks.title')" icon="i-lucide-graduation-cap" to="/study-tracks" />
      <UPageCard :title="t('schoolClasses.title')" icon="i-lucide-door-open" to="/school-classes" />
      <UPageCard :title="t('assignments.title')" icon="i-lucide-armchair" to="/assignments" />
    </UPageGrid>
  </div>
</template>
