<script setup lang="ts">
import type { AssignmentHoursStatus } from '~/composables/pdf-export/usePdfExport'

const { t } = useI18n()
const { loading, previewOpen, previewUrl, hoursReport, openPreview, closePreview, exportPdf, exportPdfFromPreview } = usePdfExport()

function issueLabel(issue: AssignmentHoursStatus) {
  const teacher = formatTeacherShortName(issue.assignment.teacher_last_name, issue.assignment.teacher_first_name)
  const schoolClass = formatSchoolClassName({
    year: issue.assignment.school_class_year,
    section_name: issue.assignment.school_class_section_name,
    study_track_name: issue.assignment.school_class_study_track_name
  })
  return `${teacher} - ${schoolClass}`
}

function goToIssue(issue: AssignmentHoursStatus) {
  closePreview()
  navigateTo({ path: '/schedule', query: { mode: 'class', entityId: issue.assignment.school_class_id } })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <UButton icon="i-ph-arrow-left" variant="ghost" color="neutral" :aria-label="t('general.back')" to="/" />
      <h1 class="text-xl font-semibold">{{ t('pdfExport.title') }}</h1>
    </div>
    <p class="text-muted">{{ t('pdfExport.description') }}</p>
    <div class="flex gap-2">
      <UButton :label="t('pdfExport.previewButton')" icon="i-ph-eye" color="neutral" variant="outline" :loading="loading" @click="openPreview" />
      <UButton :label="t('pdfExport.generateButton')" icon="i-ph-file-arrow-down" :loading="loading" @click="exportPdf" />
    </div>

    <UModal v-model:open="previewOpen" fullscreen :title="t('pdfExport.previewTitle')">
      <template #body>
        <div class="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
          <div class="space-y-3 lg:w-96 lg:shrink-0 lg:overflow-y-auto">
            <h2 class="font-semibold">{{ t('pdfExport.hoursReportTitle') }}</h2>
            <p class="text-sm text-muted">
              {{ t('pdfExport.hoursReportSummary', { complete: hoursReport.complete, under: hoursReport.under, over: hoursReport.over, total: hoursReport.total }) }}
            </p>
            <p v-if="hoursReport.issues.length === 0" class="text-sm text-success">
              {{ t('pdfExport.hoursReportAllComplete') }}
            </p>
            <div v-else class="space-y-2">
              <button
                v-for="issue in hoursReport.issues"
                :key="issue.assignment.id"
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded border border-default p-2 text-left text-sm hover:bg-elevated"
                @click="goToIssue(issue)"
              >
                <span class="truncate">{{ issueLabel(issue) }}</span>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="text-muted">{{ t('schedule.hoursAssigned', { assigned: issue.assigned, total: issue.assignment.weekly_hours }) }}</span>
                  <UBadge v-if="issue.status === 'under'" :label="t('pdfExport.hoursIncomplete')" color="warning" variant="subtle" size="sm" />
                  <UBadge v-else :label="t('schedule.overassigned')" color="warning" variant="subtle" size="sm" />
                </div>
              </button>
            </div>
          </div>
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            :title="t('pdfExport.previewTitle')"
            class="min-h-[60vh] flex-1 rounded border border-default lg:min-h-0"
          />
        </div>
      </template>

      <template #footer>
        <UButton :label="t('general.cancel')" color="neutral" variant="outline" @click="closePreview" />
        <UButton :label="t('pdfExport.generateButton')" icon="i-ph-file-arrow-down" :loading="loading" @click="exportPdfFromPreview" />
      </template>
    </UModal>
  </div>
</template>
