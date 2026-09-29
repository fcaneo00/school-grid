<script setup lang="ts">
import type { HistoryDiff } from '~/composables/saves/useSaveHistory'
import { useScheduleHistory } from './useScheduleHistory'

const { t } = useI18n()
const { rows, loading, load, handleRestore } = useScheduleHistory()

onMounted(load)

function formatTimestamp(date: Date) {
  return date.toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })
}

function movedTotal(diff: HistoryDiff) {
  return diff.moved.reduce((sum, group) => sum + group.count, 0)
}

function hasDiffDetail(diff: HistoryDiff) {
  return diff.added.length > 0 || diff.removed.length > 0 || diff.moved.length > 0
}
</script>

<template>
  <div class="space-y-4">
    <p v-if="loading" class="text-muted">{{ t('general.loading') }}</p>
    <p v-else-if="rows.length === 0" class="text-muted">{{ t('schedule.history.empty') }}</p>
    <div v-for="row in rows" :key="row.version.fileName" class="space-y-2 rounded border border-default p-4">
      <div class="flex items-center justify-between gap-2">
        <span class="font-medium">{{ formatTimestamp(row.version.timestamp) }}</span>
        <UButton :label="t('schedule.history.restoreButton')" size="sm" color="neutral" variant="outline" @click="handleRestore(row.version)" />
      </div>

      <p v-if="row.diff === null" class="text-sm text-muted">{{ t('schedule.history.firstVersion') }}</p>
      <p v-else-if="!hasDiffDetail(row.diff)" class="text-sm text-muted">{{ t('schedule.history.noChanges') }}</p>
      <UCollapsible v-else class="text-sm">
        <template #default="{ open }">
          <UButton
            :label="t('schedule.history.summary', { added: row.diff.added.length, removed: row.diff.removed.length, moved: movedTotal(row.diff) })"
            :trailing-icon="open ? 'i-ph-caret-up' : 'i-ph-caret-down'"
            variant="ghost"
            color="neutral"
            size="sm"
            class="text-muted"
          />
        </template>
        <template #content>
          <ul class="space-y-0.5 px-2 pt-2">
            <li v-for="(group, index) in row.diff.moved" :key="`moved-${index}`">
              {{ t('schedule.history.movedLine', { count: group.count, teacher: group.teacherName, schoolClass: group.schoolClassName }) }}
            </li>
            <li v-for="entry in row.diff.added" :key="`added-${entry.assignmentId}-${entry.day}-${entry.hourSlot}`" class="text-success">
              {{ t('schedule.history.addedLine', { teacher: entry.teacherName, schoolClass: entry.schoolClassName, day: t(`weekdays.${entry.day}`), hour: entry.hourSlot }) }}
            </li>
            <li v-for="entry in row.diff.removed" :key="`removed-${entry.assignmentId}-${entry.day}-${entry.hourSlot}`" class="text-error">
              {{ t('schedule.history.removedLine', { teacher: entry.teacherName, schoolClass: entry.schoolClassName, day: t(`weekdays.${entry.day}`), hour: entry.hourSlot }) }}
            </li>
          </ul>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
