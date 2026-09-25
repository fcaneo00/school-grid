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
        class="opacity-50"
      >
        <template #header>
          <UBadge :label="t('nav.comingSoon')" color="neutral" variant="subtle" />
        </template>
      </UPageCard>
    </UPageGrid>
  </div>
</template>
