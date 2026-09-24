<script setup lang="ts">
const { t } = useI18n()

const navItems = computed(() => [
  { label: t('nav.teachers'), to: '/teachers' },
  { label: t('nav.schoolClasses'), to: '/classes' },
  { label: t('nav.subjects'), to: '/subjects' },
  { label: t('nav.studyTracks'), to: '/study-tracks' }
])
</script>

<template>
  <div>
    <UNavigationMenu :as="'header'" :items="navItems" class="border-b border-default px-4" />
    <UContainer :as="'main'">
      <div class="container mx-auto p-6">
        <slot />
      </div>
    </UContainer>
  </div>
</template>
