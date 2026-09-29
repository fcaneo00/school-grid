<script setup lang="ts">
const { t } = useI18n()
const { loading, handleExportSave } = useSaveExport()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/" />
      <h1 class="text-xl font-semibold">{{ t('saveExport.title') }}</h1>
    </div>
    <p class="text-muted">{{ t('saveExport.description') }}</p>
    <UButton :label="t('saveExport.button')" icon="i-ph-upload-simple" :loading="loading" @click="handleExportSave" />
  </div>
</template>
