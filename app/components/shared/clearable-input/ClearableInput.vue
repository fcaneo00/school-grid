<script setup lang="ts">
interface ClearableInputProps {
  placeholder?: string
}

const model = defineModel<string>({ default: '' })

defineProps<ClearableInputProps>()
</script>

<template>
  <UInput v-model="model" :placeholder="placeholder" class="w-full">
    <template v-if="model" #trailing>
      <UButton
        icon="i-ph-x"
        color="neutral"
        variant="link"
        size="xs"
        square
        @click="model = ''"
      />
    </template>
  </UInput>
</template>
