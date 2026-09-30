<script setup lang="ts">
interface ClearableInputNumberProps {
  placeholder?: string
  min?: number
  max?: number
}

const model = defineModel<number | undefined>({ default: undefined })

defineProps<ClearableInputNumberProps>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-1">
    <UInputNumber v-model.optional="model" :placeholder="placeholder" :min="min" :max="max" class="w-full" />
    <UButton
      icon="i-ph-x"
      color="neutral"
      variant="link"
      size="xs"
      square
      :disabled="model === undefined"
      :class="{ invisible: model === undefined }"
      :aria-label="t('general.clear')"
      @click="model = undefined"
    />
  </div>
</template>
