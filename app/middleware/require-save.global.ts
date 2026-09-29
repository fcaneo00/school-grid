export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/menu') return

  const { hasEnteredSave } = useAppEntry()
  if (!hasEnteredSave.value) {
    return navigateTo('/menu')
  }
})
