<script setup lang="ts">
import { it } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="it">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
