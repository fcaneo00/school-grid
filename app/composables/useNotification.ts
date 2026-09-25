export function useNotification() {
  const toastDuration = 2500

  const toast = useToast()

  function success(title: string, description?: string) {
    toast.add({ title, description, color: 'success', icon: 'i-lucide-circle-check', duration: toastDuration })
  }

  function error(title: string, description?: string) {
    toast.add({ title, description, color: 'error', icon: 'i-lucide-circle-x', duration: toastDuration })
  }

  function warning(title: string, description?: string) {
    toast.add({ title, description, color: 'warning', icon: 'i-lucide-triangle-alert', duration: toastDuration })
  }

  function info(title: string, description?: string) {
    toast.add({ title, description, color: 'info', icon: 'i-lucide-info', duration: toastDuration })
  }

  return {
    success,
    error,
    warning,
    info
  }
}
