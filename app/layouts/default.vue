<script setup lang="ts">
const { t } = useI18n()

const navItems = computed(() => [
  { label: t('nav.registry'), icon: 'i-lucide-clipboard-edit', to: '/registry' },
  { label: t('nav.schedule'), icon: 'i-lucide-calendar-days', badge: t('nav.comingSoon'), disabled: true },
  { label: t('nav.pdfExport'), icon: 'i-lucide-file-down', badge: t('nav.comingSoon'), disabled: true }
])
</script>

<template>
  <div>
    <header class="flex items-center gap-4 border-b border-default px-4">
      <NuxtLink to="/" class="text-lg font-semibold shrink-0">
        {{ t('home.title') }}
      </NuxtLink>
      <UNavigationMenu :items="navItems" class="flex-1" />
      <UColorModeButton />
    </header>
    <UContainer :as="'main'">
      <div class="container mx-auto p-6">
        <slot />
      </div>
    </UContainer>
  </div>
</template>
