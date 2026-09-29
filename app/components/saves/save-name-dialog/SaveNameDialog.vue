<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

interface SaveNameDialogProps {
  mode: 'create' | 'duplicate' | 'rename'
  sourceName?: string
  initialName?: string
}

const props = defineProps<SaveNameDialogProps>()
const emit = defineEmits<{
  close: [value: string | null]
}>()

const { t } = useI18n()
const schema = createSaveFormSchema(t)
const state = reactive<Partial<SaveFormSchema>>({ name: '' })

watch(() => props.initialName, (initialName) => {
  state.name = initialName ?? ''
}, { immediate: true })

const title = computed(() => {
  if (props.mode === 'duplicate') return t('saves.duplicateDialogTitle', { name: props.sourceName ?? '' })
  if (props.mode === 'rename') return t('saves.renameDialogTitle', { name: props.sourceName ?? '' })
  return t('saves.createDialogTitle')
})

function onSubmit(event: FormSubmitEvent<SaveFormSchema>) {
  emit('close', event.data.name)
}
</script>

<template>
  <UModal :title="title" :dismissible="false">
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="name" :label="t('saves.form.name')">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton type="button" :label="t('general.cancel')" color="neutral" variant="outline" @click="emit('close', null)" />
          <UButton type="submit" :label="t('general.confirm')" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
