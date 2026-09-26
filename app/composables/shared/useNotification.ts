import { openPath } from '@tauri-apps/plugin-opener'

export function useNotification() {
  const { t } = useI18n()
  const toastDuration = 2500

  const toast = useToast()

  function success(title: string, description?: string) {
    toast.add({ title, description, color: 'success', icon: 'i-ph-check-circle', duration: toastDuration })
  }

  function error(title: string, description?: string) {
    toast.add({ title, description, color: 'error', icon: 'i-ph-x-circle', duration: toastDuration })
  }

  function warning(title: string, description?: string) {
    toast.add({ title, description, color: 'warning', icon: 'i-ph-warning', duration: toastDuration })
  }

  function info(title: string, description?: string) {
    toast.add({ title, description, color: 'info', icon: 'i-ph-info', duration: toastDuration })
  }

  function openFileToast(title: string, filePath: string) {
    toast.add({
      title,
      description: filePath,
      color: 'success',
      icon: 'i-ph-check-circle',
      onClick: () => {
        openPath(filePath).catch((e) => error(t('general.errorTitle'), String(e)))
      }
    })
  }

  return {
    success,
    error,
    warning,
    info,
    openFileToast
  }
}
