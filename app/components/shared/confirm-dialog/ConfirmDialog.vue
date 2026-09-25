<script setup lang="ts">
interface ConfirmDialogProps {
  title?: string
  description?: string
}

defineProps<ConfirmDialogProps>()

const emit = defineEmits<{
  close: [value: boolean]
}>()

const { t } = useI18n()
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" @click="emit('close', false)" />
      <UButton :label="t('general.confirm')" color="error" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
