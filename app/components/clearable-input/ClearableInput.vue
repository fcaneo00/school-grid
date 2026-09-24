<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
}>()
</script>

<template>
  <UInput v-model="model" :placeholder="placeholder" class="w-full">
    <template v-if="model" #trailing>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="link"
        size="xs"
        square
        @click="model = ''"
      />
    </template>
  </UInput>
</template>
