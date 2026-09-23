<script setup lang="ts">
import { useSchoolClassList } from './useSchoolClassList'

const { t } = useI18n()
const { schoolClasses, loading, error, deleteSchoolClass } = useSchoolClassList()
</script>

<template>
  <div class="space-y-2">
    <UAlert v-if="error" color="error" :title="error" />

    <ul class="space-y-2">
      <li v-for="schoolClass in schoolClasses" :key="schoolClass.id" class="flex items-center justify-between">
        <span>{{ schoolClass.name }} {{ schoolClass.section }}</span>
        <UButton
          icon="i-lucide-trash"
          color="error"
          variant="ghost"
          @click="deleteSchoolClass(schoolClass.id)"
        />
      </li>
    </ul>

    <p v-if="loading" class="text-muted">{{ t('general.loading') }}</p>
  </div>
</template>
