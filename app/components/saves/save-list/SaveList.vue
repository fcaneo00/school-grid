<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Save } from '~/composables/saves/useSaves'
import { useSaveList } from './useSaveList'

const { t } = useI18n()
const { saves, activeSaveFile, loading, handleCreate, handleDuplicate, handleRename, handleDelete, handleEnter } = useSaveList()

function actionItems(save: Save): DropdownMenuItem[] {
  return [
    { label: t('saves.duplicateAction'), icon: 'i-ph-copy', onSelect: () => handleDuplicate(save) },
    { label: t('saves.renameAction'), icon: 'i-ph-pencil', onSelect: () => handleRename(save) },
    { label: t('saves.deleteAction'), icon: 'i-ph-trash', color: 'error', onSelect: () => handleDelete(save) }
  ]
}

const columns: TableColumn<Save>[] = [
  { accessorKey: 'displayName', header: t('saves.form.name') },
  { id: 'actions', header: t('table.actions') }
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <UButton icon="i-ph-plus" :label="t('saves.createButton')" @click="handleCreate" />
    </div>
    <UTable :data="saves" :columns="columns" :loading="loading">
      <template #displayName-cell="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.original.displayName }}</span>
          <UBadge v-if="row.original.fileName === activeSaveFile" :label="t('saves.activeLabel')" color="success" variant="subtle" size="sm" />
        </div>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UButton icon="i-ph-arrow-square-in" :label="t('saves.enterAction')" size="sm" @click="handleEnter(row.original)" />
          <UDropdownMenu :items="actionItems(row.original)">
            <UButton icon="i-ph-dots-three-vertical" color="neutral" variant="ghost" :aria-label="t('table.actions')" />
          </UDropdownMenu>
        </div>
      </template>
    </UTable>
  </div>
</template>
