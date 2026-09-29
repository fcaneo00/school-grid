<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const colorMode = useColorMode()
const confirmDialog = useConfirmDialog()
const { isDirty } = useScheduleDraft()
const { hasEnteredSave } = useAppEntry()

const sidebarOpen = ref(true)
const colorModeIcon = computed(() => colorMode.value === 'dark' ? 'i-ph-moon' : 'i-ph-sun')

const mainNavItems = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.registry'),
    icon: 'i-ph-address-book',
    to: '/registry',
    defaultOpen: true,
    children: [
      { label: t('nav.teachers'), icon: 'i-ph-user', to: '/teachers' },
      { label: t('nav.sections'), icon: 'i-ph-text-aa', to: '/sections' },
      { label: t('nav.studyTracks'), icon: 'i-ph-graduation-cap', to: '/study-tracks' },
      { label: t('nav.schoolClasses'), icon: 'i-ph-door-open', to: '/school-classes' },
      { label: t('nav.assignments'), icon: 'i-ph-chalkboard-teacher', to: '/assignments' }
    ]
  },
  { label: t('nav.schedule'), icon: 'i-ph-calendar', to: '/schedule' },
  { label: t('nav.pdfExport'), icon: 'i-ph-file-arrow-down', to: '/pdf-export' },
  { label: t('nav.saveExport'), icon: 'i-ph-upload-simple', to: '/save-export' }
])

async function backToMenu() {
  if (isDirty.value) {
    const confirmed = await confirmDialog({
      title: t('schedule.leaveConfirmTitle'),
      description: t('schedule.leaveConfirmDescription')
    })
    if (!confirmed) return
  }
  hasEnteredSave.value = false
  await navigateTo('/menu')
}

function footerNavItems(state: 'collapsed' | 'expanded'): NavigationMenuItem[] {
  const items: NavigationMenuItem[] = [
    { label: t('nav.settings'), icon: 'i-ph-gear', to: '/settings' },
    { label: t('nav.backToMenu'), icon: 'i-ph-list', onSelect: backToMenu }
  ]

  if (state === 'collapsed') {
    items.push({
      label: t('nav.colorMode'),
      icon: colorModeIcon.value,
      children: [
        {
          label: t('nav.colorModeLight'),
          icon: 'i-ph-sun',
          active: colorMode.preference === 'light',
          onSelect: () => { colorMode.preference = 'light' }
        },
        {
          label: t('nav.colorModeDark'),
          icon: 'i-ph-moon',
          active: colorMode.preference === 'dark',
          onSelect: () => { colorMode.preference = 'dark' }
        },
        {
          label: t('nav.colorModeSystem'),
          icon: 'i-ph-monitor',
          active: colorMode.preference === 'system',
          onSelect: () => { colorMode.preference = 'system' }
        }
      ]
    })
  }

  return items
}
</script>

<template>
  <div class="flex h-screen">
    <USidebar v-model:open="sidebarOpen" collapsible="icon" rail :ui="{ container: 'h-full' }">
      <template #header="{ state }">
        <NuxtLink to="/" class="px-1 text-lg font-semibold" :class="state === 'expanded' ? 'truncate' : ''">
          {{ state === 'expanded' ? t('home.title') : t('home.titleShort') }}
        </NuxtLink>
      </template>

      <template #default="{ state }">
        <UNavigationMenu
          :items="mainNavItems"
          orientation="vertical"
          :collapsed="state === 'collapsed'"
          :tooltip="state === 'collapsed'"
          :popover="state === 'collapsed'"
          :ui="{ link: 'p-1.5' }"
        />
      </template>

      <template #footer="{ state }">
        <div class="w-full space-y-1">
          <UNavigationMenu
            :items="footerNavItems(state)"
            orientation="vertical"
            :collapsed="state === 'collapsed'"
            :tooltip="state === 'collapsed'"
            :popover="state === 'collapsed'"
            :ui="{ link: 'p-1.5' }"
          />
          <UColorModeSelect v-if="state === 'expanded'" class="w-full" />
        </div>
      </template>
    </USidebar>

    <div class="flex flex-1 flex-col overflow-hidden">
      <div class="h-(--ui-header-height) shrink-0 flex items-center border-b border-default px-4">
        <UButton
          icon="i-ph-sidebar-simple"
          color="neutral"
          variant="ghost"
          :aria-label="t('nav.toggleSidebar')"
          @click="sidebarOpen = !sidebarOpen"
        />
      </div>
      <UContainer :as="'main'" class="flex-1 overflow-y-auto">
        <div class="container mx-auto p-6">
          <slot />
        </div>
      </UContainer>
    </div>
  </div>
</template>
