<script setup lang="ts">
import { useTeacherList } from './useTeacherList'

const { teachers, loading, error, deleteTeacher } = useTeacherList()
</script>

<template>
  <div class="space-y-2">
    <UAlert v-if="error" color="error" :title="error" />

    <ul class="space-y-2">
      <li v-for="teacher in teachers" :key="teacher.id" class="flex items-center justify-between">
        <span>{{ teacher.last_name }} {{ teacher.first_name }}</span>
        <UButton
          icon="i-lucide-trash"
          color="error"
          variant="ghost"
          @click="deleteTeacher(teacher.id)"
        />
      </li>
    </ul>

    <p v-if="loading" class="text-muted">{{ $t('teachers.list.loading') }}</p>
  </div>
</template>
