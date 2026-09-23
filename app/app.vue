<script setup lang="ts">
import { it } from '@nuxt/ui/locale'

const { t } = useI18n()

const navItems = computed(() => [
  { label: t('nav.teachers'), to: '/' },
  { label: t('nav.schoolClasses'), to: '/classes' }
])
</script>

<template>
  <UApp :locale="it">
    <UNavigationMenu :items="navItems" class="border-b border-default px-4" />
    <NuxtPage />
  </UApp>
</template>
