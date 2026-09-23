# Task list

Checklist di lavoro in corso. Per feature corposa si scrive qui la checklist prima di implementare, poi si spunta via via. Lavoriamo diretti su `main`, niente branch/PR per adesso.

## Setup Tauri + schema DB

- [x] `ssr: false` in `nuxt.config.ts` (build statica, richiesta da Tauri)
- [x] Inizializzare `src-tauri/` (Tauri 2) — identifier provvisorio `com.school-grid.app`, dominio ancora da fissare (vedi tabella "I nomi" in CLAUDE.md)
- [x] Collegare `tauri.conf.json` alla build Nuxt: `frontendDist` → `../.output/public`, `beforeDevCommand`/`beforeBuildCommand` → `npm run dev`/`npm run generate`
- [x] Aggiungere plugin Rust: `tauri-plugin-sql` (feature sqlite), `tauri-plugin-dialog`, `tauri-plugin-fs` in `Cargo.toml` + registrazione in `src-tauri/src/lib.rs`
- [x] Aggiungere pacchetti JS corrispondenti: `@tauri-apps/plugin-sql`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`
- [x] Capabilities/permessi in `src-tauri/capabilities/` per sql, dialog, fs — `sql:default` copre solo `allow-load`/`allow-select`/`allow-close` (letto in fase di scrittura di `useTeachers`, l'INSERT falliva silenziosamente); aggiunto `sql:allow-execute` esplicito per le scritture. Lo scope fs per il salvataggio PDF su percorso scelto dall'utente andrà ristretto quando implementiamo l'export
- [x] Migrazione SQL iniziale con le 6 tabelle (`teacher`, `school_class`, `subject`, `assignment`, `preference`, `schedule_entry`), FK e indici utili alle validazioni (`day`+`hour_slot`) — registrata in `src-tauri/src/lib.rs` via `add_migrations`, DB `sqlite:school-grid.db`
- [x] Verifica: `npm run tauri dev` apre la finestra nativa e il DB si inizializza senza errori

## i18n

Solo italiano attivo per ora, ma nessun testo hardcoded nei template — pronto per aggiungere lingue in futuro senza toccare i componenti.

- [x] Installare e configurare `@nuxtjs/i18n` (modulo dopo `@nuxt/ui`, `strategy: 'no_prefix'` — niente routing URL per lingua, è un'app desktop)
- [x] File di traduzione `i18n/locales/it.json` (root del progetto, non `app/` — convenzione del modulo con `restructureDir`) con le stringhe già in uso (Docenti: titolo, form, lista)
- [x] `UApp :locale` collegato al locale Nuxt UI (`@nuxt/ui/locale`) per la localizzazione interna dei componenti (date, calendari, ecc.)
- [x] Convertire i testi hardcoded esistenti (`TeacherForm.vue`, `TeacherList.vue`, `pages/index.vue`) a chiavi di traduzione
- [x] Messaggi di validazione zod (`teacherFormHelper.ts`) anch'essi tradotti, non hardcoded — lo schema diventa una funzione che riceve `t`
- [ ] Verifica: `npm run tauri dev`, testi tutti visibili in italiano, nessuna stringa mancante
