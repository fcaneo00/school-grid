type ToastOverrides = Pick<Parameters<ReturnType<typeof useToast>['add']>[0], 'duration' | 'onClick'>

export function useNotification() {
  const toastDuration = 2500

  const toast = useToast()

  function success(title: string, description?: string, overrides?: ToastOverrides) {
    toast.add({ title, description, color: 'success', icon: 'i-ph-check-circle', duration: toastDuration, ...overrides })
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

  return {
    success,
    error,
    warning,
    info
  }
}
