<script setup lang="ts">
definePageMeta({ layout: 'menu' })

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-semibold">{{ t('home.title') }}</h1>
      <p class="text-muted">{{ t('menu.subtitle') }}</p>
    </div>
    <SaveList />
  </div>
</template>
