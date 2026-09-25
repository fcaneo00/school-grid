<script setup lang="ts">
const { t } = useI18n()

const navItems = computed(() => [
  { label: t('nav.registry'), icon: 'i-ph-address-book', to: '/registry' },
  { label: t('nav.schedule'), icon: 'i-ph-calendar', to: '/schedule' },
  { label: t('nav.pdfExport'), icon: 'i-ph-file-arrow-down', badge: t('nav.comingSoon'), disabled: true }
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
