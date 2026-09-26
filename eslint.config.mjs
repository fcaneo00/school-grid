// @ts-check
import { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // `src-tauri/target/` non è nel `.gitignore` alla radice (solo in quello di
  // `src-tauri/`, che ESLint non legge) - una build Rust in release genera lì
  // dentro asset `.js` generati da tauri-codegen che ESLint provava a
  // interpretare come sorgente, rompendo il lint dell'intero progetto appena
  // quella cartella esiste su disco.
  { ignores: ['src-tauri/target/**'] },

  sonarjsConfigs.recommended,

  // L'unico lint che guarda DENTRO il `<template>` Vue - le regole a11y di
  // SonarJS sono solo JSX e non lo vedono mai: senza questo plugin l'a11y non
  // era coperta da nessuno strumento.
  ...vuejsAccessibility.configs['flat/recommended'],

  {
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/attributes-order': ['error'],

      // TS strict, mai `any`.
      '@typescript-eslint/no-explicit-any': 'error',

      // Destrutturare le props perde la reattività appena il valore esce dallo
      // scope del setup - la stessa classe di bug già incontrata in questo
      // progetto (vedi TASKS.md, griglia orario: props non reattive nei
      // composable).
      'vue/no-setup-props-reactivity-loss': 'error',

      // Niente logica nei template.
      'vue/no-template-shadow': 'error',
      'vue/require-explicit-emits': 'error',
      'vue/no-v-html': 'error'
    }
  },

  {
    // La griglia orario usa il drag & drop nativo HTML5 (celle, blocchi piazzati,
    // card della sidebar) - per specifica non ha un equivalente da tastiera senza
    // costruire un'interfaccia alternativa a sé (es. sposta con le frecce),
    // fuori scope per ora. Lo scope è ristretto a questi due file - la regola
    // resta attiva ovunque altro.
    name: 'schedule/native-drag-and-drop',
    files: [
      'app/components/schedule/schedule-grid/ScheduleGrid.vue',
      'app/components/schedule/schedule-sidebar/ScheduleSidebar.vue'
    ],
    rules: {
      'vuejs-accessibility/no-static-element-interactions': 'off'
    }
  }
)
