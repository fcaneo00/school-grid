<script setup lang="ts">
const { t } = useI18n()
const { saves, activeSaveFile } = useSaves()

const activeSaveName = computed(() => saves.value.find((save) => save.fileName === activeSaveFile.value)?.displayName)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold">{{ activeSaveName ? t('home.activeSave', { name: activeSaveName }) : t('home.title') }}</h1>
      <p class="text-muted">{{ t('home.subtitle') }}</p>
    </div>
    <UPageGrid>
      <UPageCard
        :title="t('home.registryTitle')"
        :description="t('home.registryDescription')"
        icon="i-ph-address-book"
        to="/registry"
      />
      <UPageCard
        :title="t('home.scheduleTitle')"
        :description="t('home.scheduleDescription')"
        icon="i-ph-calendar"
        to="/schedule"
      />
      <UPageCard
        :title="t('home.pdfExportTitle')"
        :description="t('home.pdfExportDescription')"
        icon="i-ph-file-arrow-down"
        to="/pdf-export"
      />
    </UPageGrid>
  </div>
</template>
