<script setup lang="ts">
const model = defineModel<number | undefined>({ default: undefined })

defineProps<{
  placeholder?: string
  min?: number
  max?: number
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <UInputNumber v-model.optional="model" :placeholder="placeholder" :min="min" :max="max" class="w-full" />
    <UButton
      v-if="model !== undefined"
      icon="i-lucide-x"
      color="neutral"
      variant="link"
      size="xs"
      square
      @click="model = undefined"
    />
  </div>
</template>
