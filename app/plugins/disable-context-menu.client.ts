export default defineNuxtPlugin(() => {
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })
})
