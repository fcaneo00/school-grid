<script setup lang="ts">
import { useScheduleSidebar } from './useScheduleSidebar'

interface ScheduleSidebarProps {
  subject: ScheduleSubject
}

const props = defineProps<ScheduleSidebarProps>()

const { t } = useI18n()
const { subjectAssignments, assignmentLabel, onDragStart, onDragEnd, handleSuggest, contextMenuItems } = useScheduleSidebar(toRef(() => props.subject))
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UContextMenu v-for="assignment in subjectAssignments" :key="assignment.id" :items="contextMenuItems(assignment)">
      <div
        draggable="true"
        class="flex cursor-grab items-center gap-2 rounded border border-default px-3 py-2 active:cursor-grabbing"
        @dragstart="onDragStart($event, assignment)"
        @dragend="onDragEnd"
      >
        <span class="font-medium">{{ assignmentLabel(assignment) }}</span>
        <span class="text-sm text-muted">{{ t('schedule.hoursAssigned', { assigned: assignment.assigned, total: assignment.weekly_hours }) }}</span>
        <UBadge v-if="assignment.assigned === assignment.weekly_hours" :label="t('schedule.complete')" color="success" variant="subtle" size="sm" />
        <UBadge v-else-if="assignment.assigned > assignment.weekly_hours" :label="t('schedule.overassigned')" color="warning" variant="subtle" size="sm" />
        <UButton
          v-if="assignment.assigned < assignment.weekly_hours"
          icon="i-ph-magic-wand"
          size="xs"
          color="neutral"
          variant="ghost"
          :aria-label="t('schedule.heuristic.suggestButton')"
          @click.stop="handleSuggest(assignment)"
        />
      </div>
    </UContextMenu>
    <p v-if="subjectAssignments.length === 0" class="text-sm text-muted">
      {{ t('schedule.noAssignments') }}
    </p>
  </div>
</template>
