<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold">{{ t('home.title') }}</h1>
      <p class="text-muted">{{ t('home.subtitle') }}</p>
    </div>
    <UPageGrid>
      <UPageCard
        :title="t('home.registryTitle')"
        :description="t('home.registryDescription')"
        icon="i-lucide-clipboard-edit"
        to="/registry"
      />
      <UPageCard
        :title="t('home.scheduleTitle')"
        :description="t('home.scheduleDescription')"
        icon="i-lucide-calendar-days"
        class="opacity-50"
      >
        <template #header>
          <UBadge :label="t('nav.comingSoon')" color="neutral" variant="subtle" />
        </template>
      </UPageCard>
      <UPageCard
        :title="t('home.pdfExportTitle')"
        :description="t('home.pdfExportDescription')"
        icon="i-lucide-file-down"
        class="opacity-50"
      >
        <template #header>
          <UBadge :label="t('nav.comingSoon')" color="neutral" variant="subtle" />
        </template>
      </UPageCard>
    </UPageGrid>
  </div>
</template>
