<script setup lang="ts">
interface ClearableInputNumberProps {
  placeholder?: string
  min?: number
  max?: number
}

const model = defineModel<number | undefined>({ default: undefined })

defineProps<ClearableInputNumberProps>()
</script>

<template>
  <div class="flex items-center gap-1">
    <UInputNumber v-model.optional="model" :placeholder="placeholder" :min="min" :max="max" class="w-full" />
    <UButton
      v-if="model !== undefined"
      icon="i-ph-x"
      color="neutral"
      variant="link"
      size="xs"
      square
      @click="model = undefined"
    />
  </div>
</template>
