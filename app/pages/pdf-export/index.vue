<script setup lang="ts">
const { t } = useI18n()
const { loading, exportPdf } = usePdfExport()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/" />
      <h1 class="text-xl font-semibold">{{ t('pdfExport.title') }}</h1>
    </div>
    <p class="text-muted">{{ t('pdfExport.description') }}</p>
    <UButton :label="t('pdfExport.generateButton')" icon="i-ph-file-arrow-down" :loading="loading" @click="exportPdf" />
  </div>
</template>
