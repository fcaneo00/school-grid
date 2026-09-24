# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**School Grid** - applicazione desktop per la creazione manuale dell'orario scolastico settimanale, ad uso di un dirigente scolastico o di una persona incaricata (es. un docente delegato). Gestisce classi, docenti e le cattedre (le assegnazioni docente-classe con il relativo monte ore), e produce un PDF settimanale pronto per la distribuzione.

> **È uno strumento di costruzione assistita, non un motore di generazione automatica.**
> L'app segnala i conflitti - docente doppio, classe doppia, giorno libero non rispettato - ma la decisione di dove mettere ogni ora resta sempre di chi costruisce l'orario. Ogni volta che una scelta di progetto sembra "manca l'automazione", è perché protegge questa linea.

Le due ragioni per cui l'app esiste: **la validazione dei conflitti mentre si costruisce** l'orario, e **l'esportazione PDF** finale. Nessuna delle due è un dettaglio di contorno.

### Struttura

| Cartella | Cosa |
|---|---|
| `app/` | sorgente Nuxt 4 - pages, components, composables, layouts, `app.vue` |
| `public/` | asset statici |
| `server/` | Nitro - non eseguito in produzione (l'output è statico) |
| `src-tauri/` | progetto Rust/Tauri - comandi nativi, plugin, configurazione |

### Stack

- **Frontend**: Nuxt 4 (Vue), SPA statica (`ssr: false`, build con `nuxt generate`)
- **Linguaggio**: TypeScript in componenti e composables; SCSS per gli asset di stile
- **i18n**: `@nuxtjs/i18n` (`strategy: 'no_prefix'`, niente routing per lingua) - solo italiano attivo, ma nessun testo hardcoded nei template: tutte le stringhe passano da `i18n/locales/*.json` via `$t()`/`useI18n()`, pronto per aggiungere lingue senza toccare i componenti
- **Lint**: `@nuxt/eslint` (JS/TS/Vue) + `cargo clippy`/`fmt` (Rust) - `vue/block-order` (script→template→style) e `vue/attributes-order` forzati a `error` in `eslint.config.mjs`, resto ai default del modulo
- **Shell desktop**: Tauri 2 (Rust + WebView2 su Windows)
- **Database**: SQLite locale via `tauri-plugin-sql` - nessun backend remoto, app a singolo utilizzatore
- **PDF**: `jsPDF` + `jspdf-autotable` lato client, salvataggio via `tauri-plugin-dialog` + `tauri-plugin-fs`

### Comandi

```bash
npm run dev           # dev server Nuxt nel browser, senza Tauri
npm run tauri dev     # finestra nativa + dev server Nuxt, plugin disponibili
npm run generate      # build statica Nuxt (.output/public)
npm run tauri build   # eseguibile finale
npm run lint          # ESLint (@nuxt/eslint) su tutto il progetto
npm run lint:fix      # come sopra, applica le correzioni automatiche
npm run lint:rust     # cargo clippy su src-tauri/, warning trattati come errori
npm run lint:rust:fix # cargo fmt + cargo clippy --fix su src-tauri/
```

⚠️ **`npm run dev` da solo non basta per testare sql/dialog/fs**: quei plugin esistono solo dentro il processo Tauri. Per lavorare su quella parte serve sempre `npm run tauri dev`.

### Modello dati

Nomi delle tabelle in inglese (`school_class` invece di `class`, riservata in JS/TS).

| Tabella | Campi |
|---|---|
| `teacher` | `id` · `first_name` · `last_name` |
| `school_class` | `id` · `year` (1-5) · `section_id` FK · `study_track_id` FK (nullable) - stesso anno+sezione può ripetersi su corsi diversi (es. 1A Scientifico ≠ 1A Linguistico), `study_track` disambigua. Colonna `year` ancora TEXT (affinità ereditata dalla migrazione v1/v2, cambiarla richiederebbe ricostruire la tabella e con essa il vincolo FK di `assignment` - non vale la pena per un intero 1-5): letta con `CAST(year AS INTEGER)` così il livello applicativo la tratta sempre come numero. `section_id` è nullable anche a livello SQL per lo stesso motivo (impossibile imporre `NOT NULL` senza ricostruire la tabella), ma è sempre obbligatorio a livello applicativo (zod). **`UNIQUE(year, section_id, study_track_id)`** (migrazione v6) - impedisce due classi identiche (es. due 1A Scientifico); righe legacy con `section_id`/`study_track_id` `NULL` restano escluse dal vincolo per semantica SQL (`NULL` non è mai uguale a `NULL`), coerente con la scelta già presa di lasciarle "da sistemare a mano" |
| `study_track` | `id` · `name` - il corso di studio (es. "Scientifico", "Linguistico"), entità propria e non testo libero: serve per contare/raggruppare/validare in modo affidabile, in vista del PDF |
| `section` | `id` · `name` - la sezione (es. "A", "B"), entità propria per lo stesso motivo di `study_track`: testo libero avrebbe permesso incoerenze ("a" vs "A") che spezzano i raggruppamenti |
| `assignment` | `id` · `teacher_id` FK · `school_class_id` FK · `weekly_hours` - la "cattedra": docente + classe + ore settimanali, senza materia (rimossa in v5 - vedi nota sotto) |
| `preference` | `id` · `teacher_id` FK · `day_off` - opzionale, **più righe per docente** (un docente può avere più giorni di riposo). Valori di `day_off` da un vocabolario fisso lunedì-sabato (`app/utils/weekdays.ts`, `WEEKDAY_VALUES`), non un'entità come `study_track`/`section` - i giorni della settimana non sono qualcosa che l'utente gestisce. Gestita dal form Docente stesso (select multipla), non ha una pagina propria |
| `schedule_entry` | `id` · `assignment_id` FK · `day` · `hour_slot` - lo slot occupato in griglia |

Regole di validazione in fase di inserimento:
1. **Docente doppio** - stesso `teacher_id` già occupato in quel `day`+`hour_slot` su un'altra classe → blocco.
2. **Classe doppia** - la `school_class` ha già un'altra `schedule_entry` in quel `day`+`hour_slot` → blocco.
3. **Giorno libero** - il `day` coincide col `day_off` del docente → avviso, non blocco.
4. **Monte ore** - conteggio ore assegnate vs `weekly_hours` dell'assignment, per segnalare cattedre incomplete o sovra-assegnate.

**Nota - `subject`/Materie rimossa (migrazione v5)**: decisione dell'utente, la cattedra non ha più bisogno della materia perché si sa già a prescindere quante ore un docente deve fare in una classe. Compromesso segnalato e accettato: un docente non può più avere due incarichi distinti sulla stessa classe (es. Italiano + Storia con ore diverse) - sarebbero due righe `assignment` indistinguibili, e nel PDF finale ogni slot mostra solo il nome del docente, non cosa insegna in quel momento.

### I nomi

| Cosa | Nome |
|---|---|
| Nome progetto | `school-grid` *(per adesso - provvisorio)* |
| Tabelle DB | `teacher` · `school_class` · `study_track` · `section` · `assignment` · `preference` · `schedule_entry` |
| Composables | `useTeachers` · `useSchoolClasses` · `useStudyTracks` · `useSections` · `useAssignments` · `useTeacherPreference` · `useSchedule` |
| Tauri identifier | `com.school-grid.app` *(provvisorio - dominio ancora da fissare)* |

## Principi di lavoro (il faro)

Facciamo una cosa piccola che deve restare semplice - ed è lì che sta la difficoltà. Niente cerimonie enterprise (non servono per un'app desktop mono-utente), ma l'asticella resta l'eccellenza: codice leggibile, che chiunque - anche tu fra sei mesi - può ribaltare senza paura.

Due fallimenti, stesso peso:
- **Over-engineering** - astrazioni per un solo caso d'uso, pattern pensati per una scala che qui non esiste. Se una complessità non previene un problema concreto, non entra.
- **Sciatteria** - validazioni saltate, workaround che tamponano il sintomo invece di risolvere la causa, copia-incolla al posto del refactor.

Regole:
1. **Right-size** - la complessità si paga solo dove protegge dati reali (es. l'integrità dell'orario). Il resto, semplice.
2. **No workaround** - un fix va alla causa, non al sintomo.
3. **Niente yes-man** - se una scelta è sbagliata o rischiosa, dillo, con l'alternativa.
4. **Dillo se è una cavolata** - contesta la richiesta se non ha senso, non eseguire in silenzio.
5. **Onestà > adulazione** - se qualcosa non va, si dice, con l'output alla mano.

## Le case dei fatti

Per un progetto di queste dimensioni non serve separare specs/docs/backlog in cartelle diverse: **tutto vive in questo `CLAUDE.md`**, aggiornato ad ogni decisione architetturale - è quello che abbiamo fatto finora in chat. Se il progetto crescesse davvero, si scorporerà in una cartella `docs/` quando (e solo quando) diventerà scomodo tenerlo qui dentro.

La checklist di lavoro in corso vive invece in [`.claude/TASKS.md`](.claude/TASKS.md), per non far lievitare questo file con lo stato di avanzamento. Lavoriamo diretti su `main`, niente branch/PR per adesso.

## Planning Workflow

Per modifiche piccole si implementa direttamente. Per una feature corposa (es. la UI della griglia trascinabile, l'esportazione PDF) si scrive prima una checklist breve in `.claude/TASKS.md`, poi si implementa spuntando via via.

## Regole di ingaggio operative

- Quando scrivi un piano o della documentazione, salvalo subito su file - non limitarti a mostrarlo in chat.
- Non iniziare a implementare o eseguire codice finché non viene chiesto esplicitamente. Se presenti un piano, aspetta conferma prima di agire.
- Non estendere lo scope oltre quanto chiesto. Idee in più, se ci sono, si accennano in fondo senza svilupparle.
- Se una richiesta non è chiara (specialmente se in italiano o specifica del dominio scolastico), chiedi chiarimenti invece di indovinare.
- Controlla `.claude/skills/` prima di lavorare con una tecnologia del progetto - le skill vengono aggiunte progressivamente, non procedere a memoria se ce n'è una disponibile.
- Niente commenti nel codice - il codice si autodocumenta con nomi chiari; l'unica eccezione è JSDoc dove serve documentare un'API pubblica.
- Niente em dash (—) nella prosa che si legge (documentazione, messaggi di commit, ecc.) - usa il trattino semplice `-`.
- Le props dei componenti si dichiarano come interface nominata (`interface NomeComponenteProps { ... }`) seguita da `defineProps<NomeComponenteProps>()`, mai `defineProps<{ ... }>()` inline - così l'interfaccia è riutilizzabile altrove (es. nei test Vitest in arrivo).