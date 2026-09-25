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

export function useScheduleGrid(schoolClassId: Ref<number>) {
  const { t } = useI18n()
  const notify = useNotification()
  const {
    effectiveEntries,
    conflictCheckEntries,
    placeDraftEntry,
    placeDraftEntries,
    removeDraftEntries,
    removeDraftBlock
  } = useScheduleDraft()
  const conflictEntries = computed(() => conflictCheckEntries(schoolClassId.value))
  const { hasTeacherConflict, isDayOff } = useScheduleConflicts(conflictEntries)
  const { draggedAssignment, draggedBlockSource } = useScheduleDrag()

  const classEntries = computed(() => effectiveEntries(schoolClassId.value))

  const resizing = ref<ResizeState | null>(null)
  const dragOverTarget = ref<{ day: Weekday, hourSlot: HourSlot } | null>(null)

  function blocksForDay(day: Weekday): Block[] {
    const dayEntries = [...classEntries.value]
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

  const allBlocks = computed(() => WEEKDAY_VALUES.flatMap((day) => blocksForDay(day)))

  function blockAt(day: Weekday, hourSlot: HourSlot) {
    return blocksForDay(day).find((block) => hourSlot >= block.startHour && hourSlot < block.startHour + block.span)
  }

  function canPlaceSpan(day: Weekday, startHour: HourSlot, span: number, teacherId: number, excludeEntryIds: number[]) {
    if (startHour + span - 1 > 6) return false
    for (let hour = startHour; hour < startHour + span; hour++) {
      const hourSlot = hour as HourSlot
      const block = blockAt(day, hourSlot)
      const isOwnBlock = block !== undefined && block.entryIds.some((id) => excludeEntryIds.includes(id))
      if (block && !isOwnBlock) return false
      if (!isOwnBlock && hasTeacherConflict(teacherId, day, hourSlot)) return false
    }
    return true
  }

  function cellStatus(day: Weekday, hourSlot: HourSlot): CellStatus {
    const moving = draggedBlockSource.value
    if (moving) {
      if (!canPlaceSpan(day, hourSlot, moving.span, moving.teacherId, moving.entryIds)) return 'blocked'
      return isDayOff(moving.teacherId, day) ? 'warning' : 'available'
    }

    if (blockAt(day, hourSlot)) return 'occupied'
    const dragging = draggedAssignment.value
    if (!dragging) return 'empty'
    if (hasTeacherConflict(dragging.teacher_id, day, hourSlot)) return 'blocked'
    if (isDayOff(dragging.teacher_id, day)) return 'warning'
    return 'available'
  }

  const rows = computed(() =>
    HOUR_SLOT_VALUES.map((hourSlot) => ({
      hourSlot,
      cells: WEEKDAY_VALUES.map((day) => ({
        day,
        status: cellStatus(day, hourSlot)
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
    const dayIndex = WEEKDAY_VALUES.indexOf(day)
    return {
      top: `${HEADER_HEIGHT_PX + (startHour - 1) * ROW_HEIGHT_PX}px`,
      height: `${span * ROW_HEIGHT_PX}px`,
      left: `calc(${HOUR_COL_PX}px + (100% - ${HOUR_COL_PX}px) * ${dayIndex} / ${WEEKDAY_VALUES.length})`,
      width: `calc((100% - ${HOUR_COL_PX}px) / ${WEEKDAY_VALUES.length})`
    }
  }

  function blockStyle(block: Block) {
    return positionStyle(block.day, block.startHour, spanFor(block))
  }

  function shortName(block: Block) {
    return formatTeacherShortName(block.teacherLastName, block.teacherFirstName)
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
      valid: canPlaceSpan(target.day, target.hourSlot, moving.span, moving.teacherId, moving.entryIds),
      label: formatTeacherShortName(moving.teacherLastName, moving.teacherFirstName)
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
    if (!canPlaceSpan(day, hourSlot, moving.span, moving.teacherId, moving.entryIds)) return

    const dayOff = isDayOff(moving.teacherId, day)
    removeDraftEntries(schoolClassId.value, moving.entryIds)
    const newHours: HourSlot[] = []
    for (let hour = hourSlot; hour < hourSlot + moving.span; hour++) {
      newHours.push(hour as HourSlot)
    }
    placeDraftEntries(
      schoolClassId.value,
      { assignmentId: moving.assignmentId, teacherId: moving.teacherId, teacherFirstName: moving.teacherFirstName, teacherLastName: moving.teacherLastName },
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
      schoolClassId.value,
      { assignmentId: assignment.id, teacherId: assignment.teacher_id, teacherFirstName: assignment.teacher_first_name, teacherLastName: assignment.teacher_last_name },
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
    removeDraftBlock(schoolClassId.value, day, assignmentId)
  }

  function maxSpanFrom(day: Weekday, assignmentId: number, startHour: HourSlot, teacherId: number) {
    let span = 0
    for (let hour = startHour; hour <= 6; hour++) {
      const hourSlot = hour as HourSlot
      const block = blockAt(day, hourSlot)
      const isOwnBlock = block !== undefined && block.assignmentId === assignmentId && block.startHour === startHour
      if (block && !isOwnBlock) break
      if (!isOwnBlock && hasTeacherConflict(teacherId, day, hourSlot)) break
      span++
    }
    return span
  }

  function onResizeMove(event: MouseEvent) {
    if (!resizing.value) return
    const { day, assignmentId, startHour, initialSpan, startY } = resizing.value
    const referenceEntry = classEntries.value.find((entry) => entry.assignment_id === assignmentId && entry.day === day)
    if (!referenceEntry) return

    const deltaHours = Math.round((event.clientY - startY) / ROW_HEIGHT_PX)
    const requestedSpan = initialSpan + deltaHours
    const maxSpan = maxSpanFrom(day, assignmentId, startHour, referenceEntry.teacher_id)
    resizing.value.previewSpan = Math.min(Math.max(requestedSpan, 1), maxSpan)
  }

  function onResizeEnd() {
    if (!resizing.value) return
    const { day, assignmentId, startHour, initialSpan, previewSpan } = resizing.value
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeEnd)
    resizing.value = null

    if (previewSpan === initialSpan) return

    const referenceEntry = classEntries.value.find((entry) => entry.assignment_id === assignmentId && entry.day === day)
    if (!referenceEntry) return

    if (previewSpan > initialSpan) {
      const newHours: HourSlot[] = []
      for (let hour = startHour + initialSpan; hour < startHour + previewSpan; hour++) {
        newHours.push(hour as HourSlot)
      }
      placeDraftEntries(
        schoolClassId.value,
        {
          assignmentId,
          teacherId: referenceEntry.teacher_id,
          teacherFirstName: referenceEntry.teacher_first_name,
          teacherLastName: referenceEntry.teacher_last_name
        },
        day,
        newHours
      )
    } else {
      const idsToRemove = classEntries.value
        .filter((entry) => entry.assignment_id === assignmentId && entry.day === day && entry.hour_slot >= startHour + previewSpan)
        .map((entry) => entry.id)
      removeDraftEntries(schoolClassId.value, idsToRemove)
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
    rowHeightPx: ROW_HEIGHT_PX,
    hourColPx: HOUR_COL_PX,
    headerHeightPx: HEADER_HEIGHT_PX
  }
}
