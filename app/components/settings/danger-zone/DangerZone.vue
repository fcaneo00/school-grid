<script setup lang="ts">
const { t } = useI18n()
const { loading, confirmAndWipe } = useDatabaseReset()
</script>

<template>
  <div class="space-y-3 rounded border border-error p-4">
    <h2 class="font-semibold text-error">{{ t('settings.dangerZone.title') }}</h2>
    <p class="text-sm text-muted">{{ t('settings.dangerZone.description') }}</p>
    <UButton
      :label="t('settings.dangerZone.wipeButton')"
      icon="i-ph-trash"
      color="error"
      variant="outline"
      :loading="loading"
      @click="confirmAndWipe"
    />
  </div>
</template>
