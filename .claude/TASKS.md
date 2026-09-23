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
