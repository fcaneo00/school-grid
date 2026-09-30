import type { ContextMenuItem } from '@nuxt/ui'

type CellStatus = 'occupied' | 'blocked' | 'warning' | 'available' | 'empty'

// Misure in pixel della griglia - fonte unica: usate sia per il posizionamento assoluto dei
// blocchi sopra la tabella sia per la colgroup/intestazione, così restano sempre allineati.
export const ROW_HEIGHT_PX = 64
export const HOUR_COL_PX = 48
export const HEADER_HEIGHT_PX = 40

interface Block {
  day: Weekday
  assignmentId: number
  teacherId: number
  schoolClassId: number
  startHour: HourSlot
  span: number
  entryIds: number[]
  teacherFirstName: string
  teacherLastName: string
}

interface ResizeState {
  day: Weekday
  assignmentId: number
  startHour: HourSlot
  initialSpan: number
  startY: number
  previewSpan: number
}

export function useScheduleGrid(subject: Ref<ScheduleSubject>) {
  const { t } = useI18n()
  const notify = useNotification()
  const { effectiveEntries, placeDraftEntry, placeDraftEntries, removeDraftEntries, removeDraftBlock } = useScheduleDraft()
  const conflictEntries = computed(() => effectiveEntries())
  const { hasTeacherConflict, hasClassConflict, isDayOff } = useScheduleConflicts(conflictEntries)
  const { draggedAssignment, draggedBlockSource } = useScheduleDrag()
  const { settings, activeHourSlots } = useAppSettings()
  const { schoolClasses } = useSchoolClasses()
  const { isSuggested } = useScheduleHeuristic()
  const route = useRoute()

  const activeWeekdays = computed(() => settings.value.activeWeekdays)
  const maxDailyHours = computed(() => settings.value.maxDailyHours)

  const subjectEntries = computed(() =>
    effectiveEntries().filter((entry) =>
      subject.value.type === 'class' ? entry.school_class_id === subject.value.id : entry.teacher_id === subject.value.id
    )
  )

  const resizing = ref<ResizeState | null>(null)
  const dragOverTarget = ref<{ day: Weekday, hourSlot: HourSlot } | null>(null)

  function hasConflict(teacherId: number, schoolClassId: number, day: Weekday, hourSlot: HourSlot) {
    return subject.value.type === 'class'
      ? hasTeacherConflict(teacherId, day, hourSlot)
      : hasClassConflict(schoolClassId, day, hourSlot)
  }

  function blocksForDay(day: Weekday): Block[] {
    const dayEntries = [...subjectEntries.value]
      .filter((entry) => entry.day === day)
      .sort((a, b) => a.hour_slot - b.hour_slot)

    const blocks: Block[] = []
    let current: Block | null = null

    for (const entry of dayEntries) {
      if (current && current.assignmentId === entry.assignment_id && entry.hour_slot === current.startHour + current.span) {
        current.span += 1
        current.entryIds.push(entry.id)
      } else {
        current = {
          day,
          assignmentId: entry.assignment_id,
          teacherId: entry.teacher_id,
          schoolClassId: entry.school_class_id,
          startHour: entry.hour_slot,
          span: 1,
          entryIds: [entry.id],
          teacherFirstName: entry.teacher_first_name,
          teacherLastName: entry.teacher_last_name
        }
        blocks.push(current)
      }
    }

    return blocks
  }

  const allBlocks = computed(() => activeWeekdays.value.flatMap((day) => blocksForDay(day)))

  function blockAt(day: Weekday, hourSlot: HourSlot) {
    return blocksForDay(day).find((block) => hourSlot >= block.startHour && hourSlot < block.startHour + block.span)
  }

  function canPlaceSpan(day: Weekday, startHour: HourSlot, span: number, teacherId: number, schoolClassId: number, excludeEntryIds: number[]) {
    if (startHour + span - 1 > maxDailyHours.value) return false
    for (let hour = startHour; hour < startHour + span; hour++) {
      const hourSlot = hour as HourSlot
      const block = blockAt(day, hourSlot)
      const isOwnBlock = block !== undefined && block.entryIds.some((id) => excludeEntryIds.includes(id))
      if (block && !isOwnBlock) return false
      if (!isOwnBlock && hasConflict(teacherId, schoolClassId, day, hourSlot)) return false
    }
    return true
  }

  function cellStatus(day: Weekday, hourSlot: HourSlot): CellStatus {
    const moving = draggedBlockSource.value
    if (moving) {
      if (!canPlaceSpan(day, hourSlot, moving.span, moving.teacherId, moving.schoolClassId, moving.entryIds)) return 'blocked'
      return isDayOff(moving.teacherId, day) ? 'warning' : 'available'
    }

    if (blockAt(day, hourSlot)) return 'occupied'
    const dragging = draggedAssignment.value
    if (!dragging) return 'empty'
    if (hasConflict(dragging.teacher_id, dragging.school_class_id, day, hourSlot)) return 'blocked'
    if (isDayOff(dragging.teacher_id, day)) return 'warning'
    return 'available'
  }

  const rows = computed(() =>
    activeHourSlots.value.map((hourSlot) => ({
      hourSlot,
      cells: activeWeekdays.value.map((day) => ({
        day,
        status: cellStatus(day, hourSlot),
        suggested: isSuggested(day, hourSlot)
      }))
    }))
  )

  function isResizingBlock(block: Block) {
    return resizing.value !== null
      && resizing.value.day === block.day
      && resizing.value.assignmentId === block.assignmentId
      && resizing.value.startHour === block.startHour
  }

  function spanFor(block: Block) {
    return isResizingBlock(block) ? resizing.value!.previewSpan : block.span
  }

  function positionStyle(day: Weekday, startHour: HourSlot, span: number) {
    const dayIndex = activeWeekdays.value.indexOf(day)
    return {
      top: `${HEADER_HEIGHT_PX + (startHour - 1) * ROW_HEIGHT_PX}px`,
      height: `${span * ROW_HEIGHT_PX}px`,
      left: `calc(${HOUR_COL_PX}px + (100% - ${HOUR_COL_PX}px) * ${dayIndex} / ${activeWeekdays.value.length})`,
      width: `calc((100% - ${HOUR_COL_PX}px) / ${activeWeekdays.value.length})`
    }
  }

  function blockStyle(block: Block) {
    return positionStyle(block.day, block.startHour, spanFor(block))
  }

  function classLabel(schoolClassId: number) {
    const schoolClass = schoolClasses.value.find((candidate) => candidate.id === schoolClassId)
    return schoolClass ? formatSchoolClassShortName(schoolClass) : ''
  }

  function blockLabel(block: Pick<Block, 'schoolClassId' | 'teacherFirstName' | 'teacherLastName'>) {
    return subject.value.type === 'class'
      ? formatTeacherShortName(block.teacherLastName, block.teacherFirstName)
      : classLabel(block.schoolClassId)
  }

  function isMovingBlock(block: Block) {
    return draggedBlockSource.value !== null
      && draggedBlockSource.value.day === block.day
      && draggedBlockSource.value.assignmentId === block.assignmentId
      && draggedBlockSource.value.startHour === block.startHour
  }

  const movePreview = computed(() => {
    const moving = draggedBlockSource.value
    const target = dragOverTarget.value
    if (!moving || !target) return null
    return {
      style: positionStyle(target.day, target.hourSlot, moving.span),
      valid: canPlaceSpan(target.day, target.hourSlot, moving.span, moving.teacherId, moving.schoolClassId, moving.entryIds),
      label: blockLabel(moving)
    }
  })

  function onDragEnter(event: DragEvent, day: Weekday, hourSlot: HourSlot) {
    const status = cellStatus(day, hourSlot)
    if (status === 'available' || status === 'warning') {
      event.preventDefault()
    }
    if (draggedBlockSource.value) {
      dragOverTarget.value = { day, hourSlot }
    }
  }

  function onDragOver(event: DragEvent, day: Weekday, hourSlot: HourSlot) {
    const status = cellStatus(day, hourSlot)
    if (status === 'available' || status === 'warning') {
      event.preventDefault()
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }
  }

  function moveBlockTo(moving: NonNullable<typeof draggedBlockSource.value>, day: Weekday, hourSlot: HourSlot) {
    if (day === moving.day && hourSlot === moving.startHour) return
    if (!canPlaceSpan(day, hourSlot, moving.span, moving.teacherId, moving.schoolClassId, moving.entryIds)) return

    const dayOff = isDayOff(moving.teacherId, day)
    removeDraftEntries(moving.entryIds)
    const newHours: HourSlot[] = []
    for (let hour = hourSlot; hour < hourSlot + moving.span; hour++) {
      newHours.push(hour as HourSlot)
    }
    placeDraftEntries(
      {
        assignmentId: moving.assignmentId,
        teacherId: moving.teacherId,
        teacherFirstName: moving.teacherFirstName,
        teacherLastName: moving.teacherLastName,
        schoolClassId: moving.schoolClassId
      },
      day,
      newHours
    )
    if (dayOff) {
      notify.warning(
        t('schedule.dayOffWarningTitle'),
        t('schedule.dayOffWarningDescription', {
          teacher: `${moving.teacherLastName} ${moving.teacherFirstName}`,
          day: t(`weekdays.${day}`)
        })
      )
    }
  }

  function onDrop(event: DragEvent, day: Weekday, hourSlot: HourSlot) {
    event.preventDefault()

    const moving = draggedBlockSource.value
    if (moving) {
      draggedBlockSource.value = null
      dragOverTarget.value = null
      moveBlockTo(moving, day, hourSlot)
      return
    }

    const assignment = draggedAssignment.value
    if (!assignment) return
    const status = cellStatus(day, hourSlot)
    draggedAssignment.value = null
    if (status !== 'available' && status !== 'warning') return

    const dayOff = isDayOff(assignment.teacher_id, day)
    placeDraftEntry(
      {
        assignmentId: assignment.id,
        teacherId: assignment.teacher_id,
        teacherFirstName: assignment.teacher_first_name,
        teacherLastName: assignment.teacher_last_name,
        schoolClassId: assignment.school_class_id
      },
      day,
      hourSlot
    )
    if (dayOff) {
      notify.warning(
        t('schedule.dayOffWarningTitle'),
        t('schedule.dayOffWarningDescription', {
          teacher: `${assignment.teacher_last_name} ${assignment.teacher_first_name}`,
          day: t(`weekdays.${day}`)
        })
      )
    }
  }

  function onBlockDragStart(event: DragEvent, block: Block) {
    draggedBlockSource.value = {
      day: block.day,
      assignmentId: block.assignmentId,
      teacherId: block.teacherId,
      schoolClassId: block.schoolClassId,
      startHour: block.startHour,
      span: block.span,
      entryIds: block.entryIds,
      teacherFirstName: block.teacherFirstName,
      teacherLastName: block.teacherLastName
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(block.assignmentId))
    }
  }

  function onBlockDragEnd() {
    draggedBlockSource.value = null
    dragOverTarget.value = null
  }

  function handleRemoveBlock(day: Weekday, assignmentId: number) {
    removeDraftBlock(day, assignmentId)
  }

  function contextMenuItems(block: Block): ContextMenuItem[] {
    return [
      {
        label: t('schedule.editTeacherRegistry'),
        icon: 'i-ph-identification-card',
        to: { path: `/teachers/${block.teacherId}/edit`, query: { returnTo: route.fullPath } }
      },
      {
        label: t('schedule.editAssignment'),
        icon: 'i-ph-chalkboard-teacher',
        to: { path: `/assignments/${block.assignmentId}/edit`, query: { returnTo: route.fullPath } }
      },
      {
        label: t('schedule.removeEntry'),
        icon: 'i-ph-trash',
        color: 'error',
        onSelect: () => handleRemoveBlock(block.day, block.assignmentId)
      }
    ]
  }

  function maxSpanFrom(day: Weekday, assignmentId: number, startHour: HourSlot, teacherId: number, schoolClassId: number) {
    let span = 0
    for (let hour = startHour; hour <= maxDailyHours.value; hour++) {
      const hourSlot = hour as HourSlot
      const block = blockAt(day, hourSlot)
      const isOwnBlock = block !== undefined && block.assignmentId === assignmentId && block.startHour === startHour
      if (block && !isOwnBlock) break
      if (!isOwnBlock && hasConflict(teacherId, schoolClassId, day, hourSlot)) break
      span++
    }
    return span
  }

  function onResizeMove(event: MouseEvent) {
    if (!resizing.value) return
    const { day, assignmentId, startHour, initialSpan, startY } = resizing.value
    const referenceEntry = subjectEntries.value.find((entry) => entry.assignment_id === assignmentId && entry.day === day)
    if (!referenceEntry) return

    const deltaHours = Math.round((event.clientY - startY) / ROW_HEIGHT_PX)
    const requestedSpan = initialSpan + deltaHours
    const maxSpan = maxSpanFrom(day, assignmentId, startHour, referenceEntry.teacher_id, referenceEntry.school_class_id)
    resizing.value.previewSpan = Math.min(Math.max(requestedSpan, 1), maxSpan)
  }

  function onResizeEnd() {
    if (!resizing.value) return
    const { day, assignmentId, startHour, initialSpan, previewSpan } = resizing.value
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeEnd)
    resizing.value = null

    if (previewSpan === initialSpan) return

    const referenceEntry = subjectEntries.value.find((entry) => entry.assignment_id === assignmentId && entry.day === day)
    if (!referenceEntry) return

    if (previewSpan > initialSpan) {
      const newHours: HourSlot[] = []
      for (let hour = startHour + initialSpan; hour < startHour + previewSpan; hour++) {
        newHours.push(hour as HourSlot)
      }
      placeDraftEntries(
        {
          assignmentId,
          teacherId: referenceEntry.teacher_id,
          teacherFirstName: referenceEntry.teacher_first_name,
          teacherLastName: referenceEntry.teacher_last_name,
          schoolClassId: referenceEntry.school_class_id
        },
        day,
        newHours
      )
    } else {
      const idsToRemove = subjectEntries.value
        .filter((entry) => entry.assignment_id === assignmentId && entry.day === day && entry.hour_slot >= startHour + previewSpan)
        .map((entry) => entry.id)
      removeDraftEntries(idsToRemove)
    }
  }

  function onResizeStart(event: MouseEvent, block: Block) {
    event.preventDefault()
    resizing.value = {
      day: block.day,
      assignmentId: block.assignmentId,
      startHour: block.startHour,
      initialSpan: block.span,
      startY: event.clientY,
      previewSpan: block.span
    }
    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', onResizeEnd)
  }

  onUnmounted(() => {
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeEnd)
  })

  return {
    activeWeekdays,
    rows,
    allBlocks,
    onDragEnter,
    onDragOver,
    onDrop,
    onBlockDragStart,
    onBlockDragEnd,
    handleRemoveBlock,
    contextMenuItems,
    onResizeStart,
    isResizingBlock,
    isMovingBlock,
    movePreview,
    blockStyle,
    blockLabel,
    rowHeightPx: ROW_HEIGHT_PX,
    hourColPx: HOUR_COL_PX,
    headerHeightPx: HEADER_HEIGHT_PX
  }
}
