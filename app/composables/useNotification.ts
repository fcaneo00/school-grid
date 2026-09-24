export function useNotification() {
  const toast = useToast()

  function success(title: string, description?: string) {
    toast.add({ title, description, color: 'success', icon: 'i-lucide-circle-check' })
  }

  function error(title: string, description?: string) {
    toast.add({ title, description, color: 'error', icon: 'i-lucide-circle-x' })
  }

  function warning(title: string, description?: string) {
    toast.add({ title, description, color: 'warning', icon: 'i-lucide-triangle-alert' })
  }

  function info(title: string, description?: string) {
    toast.add({ title, description, color: 'info', icon: 'i-lucide-info' })
  }

  return {
    success,
    error,
    warning,
    info
  }
}
