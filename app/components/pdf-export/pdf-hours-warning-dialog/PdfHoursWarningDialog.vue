<script setup lang="ts">
const emit = defineEmits<{
  close: [value: 'generate' | 'preview']
}>()

const { t } = useI18n()
</script>

<template>
  <UModal
    :title="t('pdfExport.hoursWarningTitle')"
    :description="t('pdfExport.hoursWarningDescription')"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton :label="t('pdfExport.previewButton')" color="neutral" variant="outline" @click="emit('close', 'preview')" />
      <UButton :label="t('pdfExport.generateAnywayButton')" color="warning" @click="emit('close', 'generate')" />
    </template>
  </UModal>
</template>
