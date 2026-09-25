<script setup lang="ts">
import { useScheduleSidebar } from './useScheduleSidebar'

interface ScheduleSidebarProps {
  schoolClassId: number
}

const props = defineProps<ScheduleSidebarProps>()

const { t } = useI18n()
const { classAssignments, onDragStart, onDragEnd } = useScheduleSidebar(toRef(() => props.schoolClassId))
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <div
      v-for="assignment in classAssignments"
      :key="assignment.id"
      draggable="true"
      class="flex cursor-grab items-center gap-2 rounded border border-default px-3 py-2 active:cursor-grabbing"
      @dragstart="onDragStart($event, assignment)"
      @dragend="onDragEnd"
    >
      <span class="font-medium">{{ formatTeacherShortName(assignment.teacher_last_name, assignment.teacher_first_name) }}</span>
      <span class="text-sm text-muted">{{ t('schedule.hoursAssigned', { assigned: assignment.assigned, total: assignment.weekly_hours }) }}</span>
      <UBadge v-if="assignment.assigned === assignment.weekly_hours" :label="t('schedule.complete')" color="success" variant="subtle" size="sm" />
      <UBadge v-else-if="assignment.assigned > assignment.weekly_hours" :label="t('schedule.overassigned')" color="warning" variant="subtle" size="sm" />
    </div>
    <p v-if="classAssignments.length === 0" class="text-sm text-muted">
      {{ t('schedule.noAssignments') }}
    </p>
  </div>
</template>
