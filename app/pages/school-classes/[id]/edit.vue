<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const id = Number(route.params.id)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/school-classes" />
      <h1 class="text-xl font-semibold">{{ t('schoolClasses.editTitle') }}</h1>
    </div>
    <SchoolClassForm :id="id" />
  </div>
</template>
