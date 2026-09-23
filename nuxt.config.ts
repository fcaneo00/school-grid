// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/i18n', '@nuxt/eslint'],
  css: ['~/assets/css/main.css', '~/assets/scss/main.scss'],
  ssr: false,
  devServer: { port: 3001 },
  components: [{ path: '~/components', pathPrefix: false, extensions: ['vue'] }],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'it',
    locales: [{ code: 'it', name: 'Italiano', file: 'it.json' }]
  }
})