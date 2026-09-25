<script setup lang="ts">
import { useScheduleGrid } from './useScheduleGrid'

interface ScheduleGridProps {
  schoolClassId: number
}

const props = defineProps<ScheduleGridProps>()

const { t } = useI18n()
const {
  rows,
  allBlocks,
  onDragEnter,
  onDragOver,
  onDrop,
  onBlockDragStart,
  onBlockDragEnd,
  handleRemoveBlock,
  onResizeStart,
  isResizingBlock,
  isMovingBlock,
  movePreview,
  blockStyle,
  shortName,
  rowHeightPx,
  hourColPx,
  headerHeightPx
} = useScheduleGrid(toRef(() => props.schoolClassId))
</script>

<template>
  <div class="overflow-x-auto">
    <div class="relative">
      <table class="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col :style="{ width: `${hourColPx}px` }">
          <col v-for="day in WEEKDAY_VALUES" :key="day">
        </colgroup>
        <thead>
          <tr>
            <th class="p-2" :style="{ height: `${headerHeightPx}px` }" />
            <th v-for="day in WEEKDAY_VALUES" :key="day" class="p-2 text-left font-medium" :style="{ height: `${headerHeightPx}px` }">
              {{ t(`weekdays.${day}`) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.hourSlot">
            <td class="border border-default p-2 text-center text-muted" :style="{ height: `${rowHeightPx}px` }">
              {{ row.hourSlot }}
            </td>
            <td
              v-for="cell in row.cells"
              :key="cell.day"
              class="border border-default"
              :style="{ height: `${rowHeightPx}px` }"
            >
              <div
                class="h-full w-full"
                :class="{
                  'bg-error/10': cell.status === 'blocked',
                  'bg-warning/10': cell.status === 'warning',
                  'bg-success/10': cell.status === 'available'
                }"
                @dragenter="onDragEnter($event, cell.day, row.hourSlot)"
                @dragover="onDragOver($event, cell.day, row.hourSlot)"
                @drop="onDrop($event, cell.day, row.hourSlot)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <TransitionGroup
        tag="div"
        class="pointer-events-none absolute inset-0"
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 scale-95"
        leave-active-class="transition-all duration-500 ease-in"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-for="block in allBlocks"
          :key="`${block.day}-${block.assignmentId}-${block.startHour}`"
          draggable="true"
          class="group pointer-events-auto absolute flex cursor-grab items-center justify-between gap-1 rounded bg-primary/10 p-2 active:cursor-grabbing"
          :class="{
            'transition-[height] duration-500 ease-out': !isResizingBlock(block),
            'opacity-30': isMovingBlock(block)
          }"
          :style="blockStyle(block)"
          @dragstart="onBlockDragStart($event, block)"
          @dragend="onBlockDragEnd"
        >
          <span class="truncate">{{ shortName(block) }}</span>
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="ghost"
            :aria-label="t('schedule.removeEntry')"
            @click="handleRemoveBlock(block.day, block.assignmentId)"
          />
          <div
            class="absolute inset-x-0 bottom-0 h-1.5 cursor-row-resize rounded-b opacity-0 group-hover:bg-primary/40 group-hover:opacity-100"
            @mousedown="onResizeStart($event, block)"
          />
        </div>
      </TransitionGroup>

      <div
        v-if="movePreview"
        class="pointer-events-none absolute flex items-center rounded border-2 border-dashed p-2"
        :class="movePreview.valid ? 'border-primary bg-primary/20' : 'border-error bg-error/20'"
        :style="movePreview.style"
      >
        <span class="truncate text-xs font-medium">{{ movePreview.label }}</span>
      </div>
    </div>
  </div>
</template>
