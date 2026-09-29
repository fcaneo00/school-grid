// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/i18n', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  ssr: false,
  devServer: { port: 3001 },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' }
  },
  components: [{ path: '~/components', pathPrefix: false, extensions: ['vue'] }],
  imports: {
    dirs: ['composables', 'composables/**']
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'it',
    locales: [{ code: 'it', name: 'Italiano', file: 'it.json' }],
    compilation: {
      strictMessage: false
    }
  }
})