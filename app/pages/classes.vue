<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="max-w-md mx-auto p-6 space-y-6">
    <h1 class="text-xl font-semibold">{{ t('schoolClasses.title') }}</h1>
    <SchoolClassForm />
    <SchoolClassList />
  </div>
</template>
