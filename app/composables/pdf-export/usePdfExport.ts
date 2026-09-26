import { jsPDF } from 'jspdf'
import autoTable, { type Styles, type UserOptions } from 'jspdf-autotable'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import { openPath } from '@tauri-apps/plugin-opener'
import type { SchoolClassWithDetails } from '~/composables/school-class/useSchoolClasses'
import type { ScheduleEntryWithDetails } from '~/composables/schedule/useSchedule'
import type { TeacherWithDetails } from '~/composables/teacher/useTeachers'
import type { Weekday } from '~/utils/weekdays'
import type { HourSlot } from '~/utils/hourSlots'

const MARGIN_MM = 10
const GAP_MM = 8
const ROW_HEIGHT_MM = 6
const TITLE_HEIGHT_MM = 6

const CLASS_HOUR_COL_WIDTH_MM = 10
const MIN_CLASS_DAY_COL_WIDTH_MM = 18
const MIN_CLASS_TABLE_WIDTH_MM = CLASS_HOUR_COL_WIDTH_MM + MIN_CLASS_DAY_COL_WIDTH_MM * WEEKDAY_VALUES.length

const TEACHER_NAME_COL_WIDTH_MM = 32

const PRINT_STYLES: Partial<UserOptions> = {
  theme: 'grid',
  styles: {
    font: 'helvetica',
    fontSize: 8,
    textColor: 20,
    lineColor: 120,
    lineWidth: 0.2,
    fillColor: 255,
    cellPadding: 1,
    halign: 'center',
    valign: 'middle',
    minCellHeight: ROW_HEIGHT_MM,
    overflow: 'ellipsize'
  },
  headStyles: {
    fontStyle: 'bold',
    fillColor: 255,
    textColor: 0,
    lineWidth: 0.3,
    lineColor: 0
  }
}

export function usePdfExport() {
  const { t } = useI18n()
  const notify = useNotification()
  const { schoolClasses, fetchSchoolClasses } = useSchoolClasses()
  const { teachers, fetchTeachers } = useTeachers()
  const { entries, fetchEntries } = useSchedule()

  const loading = ref(false)

  function sortedClasses() {
    return [...schoolClasses.value].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return (a.section_name ?? '').localeCompare(b.section_name ?? '')
    })
  }

  function usedHourSlots(classEntries: ScheduleEntryWithDetails[]) {
    return HOUR_SLOT_VALUES.filter((hourSlot) => classEntries.some((entry) => entry.hour_slot === hourSlot))
  }

  function cellLabel(classEntries: ScheduleEntryWithDetails[], day: Weekday, hourSlot: HourSlot) {
    const entry = classEntries.find((e) => e.day === day && e.hour_slot === hourSlot)
    return entry ? formatTeacherShortName(entry.teacher_last_name, entry.teacher_first_name) : ''
  }

  function buildClassRow(classEntries: ScheduleEntryWithDetails[], hourSlot: HourSlot) {
    return [String(hourSlot), ...WEEKDAY_VALUES.map((day) => cellLabel(classEntries, day, hourSlot))]
  }

  function classTableHeight(rowsCount: number) {
    return TITLE_HEIGHT_MM + ROW_HEIGHT_MM + rowsCount * ROW_HEIGHT_MM
  }

  function classColumnStyles(dayColWidth: number) {
    const dayStyles = WEEKDAY_VALUES.map((_, index): [number, Partial<Styles>] =>
      [index + 1, { cellWidth: dayColWidth }])
    return Object.fromEntries([[0, { cellWidth: CLASS_HOUR_COL_WIDTH_MM }], ...dayStyles])
  }

  function renderClassTable(
    doc: jsPDF,
    schoolClass: SchoolClassWithDetails,
    classEntries: ScheduleEntryWithDetails[],
    x: number,
    y: number,
    tableWidth: number
  ) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(formatSchoolClassName(schoolClass), x, y + 4)
    doc.setFont('helvetica', 'normal')

    const hourSlots = usedHourSlots(classEntries)
    const head = [[t('pdfExport.hourColumn'), ...WEEKDAY_VALUES.map((day) => t(`weekdays.${day}`))]]
    const body = hourSlots.map((hourSlot) => buildClassRow(classEntries, hourSlot))
    const dayColWidth = (tableWidth - CLASS_HOUR_COL_WIDTH_MM) / WEEKDAY_VALUES.length

    autoTable(doc, {
      ...PRINT_STYLES,
      head,
      body,
      startY: y + TITLE_HEIGHT_MM,
      margin: { left: x, top: MARGIN_MM, right: MARGIN_MM, bottom: MARGIN_MM },
      tableWidth,
      columnStyles: classColumnStyles(dayColWidth)
    })
  }

  function packClassTables(doc: jsPDF, classes: SchoolClassWithDetails[]) {
    const usableWidth = doc.internal.pageSize.getWidth() - MARGIN_MM * 2
    const usableHeight = doc.internal.pageSize.getHeight() - MARGIN_MM * 2
    const columnsPerRow = Math.max(1, Math.floor((usableWidth + GAP_MM) / (MIN_CLASS_TABLE_WIDTH_MM + GAP_MM)))
    const tableWidth = (usableWidth - (columnsPerRow - 1) * GAP_MM) / columnsPerRow

    let cursorX = MARGIN_MM
    let cursorY = MARGIN_MM
    let column = 0
    let rowHeight = 0

    classes.forEach((schoolClass) => {
      const classEntries = entries.value.filter((entry) => entry.school_class_id === schoolClass.id)
      const height = classTableHeight(usedHourSlots(classEntries).length)

      if (column >= columnsPerRow) {
        cursorY += rowHeight + GAP_MM
        cursorX = MARGIN_MM
        column = 0
        rowHeight = 0
      }

      if (cursorY + height > MARGIN_MM + usableHeight) {
        doc.addPage()
        cursorX = MARGIN_MM
        cursorY = MARGIN_MM
        column = 0
        rowHeight = 0
      }

      renderClassTable(doc, schoolClass, classEntries, cursorX, cursorY, tableWidth)

      cursorX += tableWidth + GAP_MM
      column += 1
      rowHeight = Math.max(rowHeight, height)
    })
  }

  function teacherCellLabel(teacherEntries: ScheduleEntryWithDetails[], day: Weekday, hourSlot: HourSlot, classById: Map<number, SchoolClassWithDetails>) {
    const entry = teacherEntries.find((e) => e.day === day && e.hour_slot === hourSlot)
    if (!entry) return ''
    const schoolClass = classById.get(entry.school_class_id)
    return schoolClass ? formatSchoolClassShortName(schoolClass) : ''
  }

  function teacherRow(teacher: TeacherWithDetails, classById: Map<number, SchoolClassWithDetails>, hourSlots: HourSlot[]) {
    const teacherEntries = entries.value.filter((entry) => entry.teacher_id === teacher.id)
    const label = `${teacher.last_name} ${teacher.first_name}`
    const cells = WEEKDAY_VALUES.flatMap((day) => hourSlots.map((hourSlot) => teacherCellLabel(teacherEntries, day, hourSlot, classById)))
    return [label, ...cells]
  }

  function teacherColumnStyles(hourColWidth: number, hourSlots: HourSlot[]) {
    const hourColumnCount = WEEKDAY_VALUES.length * hourSlots.length
    const hourStyles = Array.from({ length: hourColumnCount }, (_, index): [number, Partial<Styles>] =>
      [index + 1, { cellWidth: hourColWidth }])
    return Object.fromEntries([[0, { cellWidth: TEACHER_NAME_COL_WIDTH_MM, halign: 'left' as const }], ...hourStyles])
  }

  function teacherTableHead(hourSlots: HourSlot[]) {
    const dayHeaders = WEEKDAY_VALUES.map((day) => ({ content: t(`weekdays.${day}`), colSpan: hourSlots.length }))
    const hourHeaders = WEEKDAY_VALUES.flatMap(() => hourSlots.map((hourSlot) => String(hourSlot)))
    return [[{ content: t('pdfExport.teacherColumn'), rowSpan: 2 }, ...dayHeaders], hourHeaders]
  }

  function addTeacherSchedule(doc: jsPDF, classById: Map<number, SchoolClassWithDetails>) {
    doc.addPage()
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(t('pdfExport.teacherScheduleTitle'), MARGIN_MM, MARGIN_MM + 4)
    doc.setFont('helvetica', 'normal')

    const hourSlots = usedHourSlots(entries.value)
    const usableWidth = doc.internal.pageSize.getWidth() - MARGIN_MM * 2
    const hourColWidth = (usableWidth - TEACHER_NAME_COL_WIDTH_MM) / (WEEKDAY_VALUES.length * hourSlots.length)

    autoTable(doc, {
      ...PRINT_STYLES,
      head: teacherTableHead(hourSlots),
      body: teachers.value.map((teacher) => teacherRow(teacher, classById, hourSlots)),
      startY: MARGIN_MM + TITLE_HEIGHT_MM,
      margin: { left: MARGIN_MM, top: MARGIN_MM, right: MARGIN_MM, bottom: MARGIN_MM },
      columnStyles: teacherColumnStyles(hourColWidth, hourSlots)
    })
  }

  function buildDocument() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' })
    const classes = sortedClasses()
    const classById = new Map(schoolClasses.value.map((schoolClass) => [schoolClass.id, schoolClass]))

    if (classes.length === 0) {
      doc.setFontSize(14)
      doc.text(t('pdfExport.noClasses'), MARGIN_MM, MARGIN_MM + 4)
    } else {
      packClassTables(doc, classes)
    }

    if (teachers.value.length > 0) {
      addTeacherSchedule(doc, classById)
    }

    return doc
  }

  async function exportPdf() {
    loading.value = true
    try {
      await Promise.all([fetchSchoolClasses(), fetchTeachers(), fetchEntries()])

      const filePath = await save({
        defaultPath: 'orario-scolastico.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      if (!filePath) return

      const doc = buildDocument()
      const bytes = new Uint8Array(doc.output('arraybuffer'))
      await writeFile(filePath, bytes)

      notify.success(t('pdfExport.successTitle'), filePath, {
        duration: 5000,
        onClick: () => {
          openPath(filePath).catch((error) => notify.error(t('general.errorTitle'), String(error)))
        }
      })
    } catch (e) {
      notify.error(t('general.errorTitle'), String(e))
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    exportPdf
  }
}
