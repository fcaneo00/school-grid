<script setup lang="ts">
const CONFIRM_PHRASE = 'ELIMINA TUTTO'

const emit = defineEmits<{
  close: [value: boolean]
}>()

const { t } = useI18n()
const typedText = ref('')
const canConfirm = computed(() => typedText.value.trim() === CONFIRM_PHRASE)
</script>

<template>
  <UModal
    :title="t('settings.dangerZone.wipeDialogTitle')"
    :description="t('settings.dangerZone.wipeDialogDescription')"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <p class="text-sm text-muted">
        {{ t('settings.dangerZone.wipeDialogPrompt', { phrase: CONFIRM_PHRASE }) }}
      </p>
      <UInput v-model="typedText" :placeholder="CONFIRM_PHRASE" class="mt-3 w-full" />
    </template>
    <template #footer>
      <UButton :label="t('general.cancel')" color="neutral" variant="outline" @click="emit('close', false)" />
      <UButton :label="t('settings.dangerZone.wipeConfirmButton')" color="error" :disabled="!canConfirm" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
