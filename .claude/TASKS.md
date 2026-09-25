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
- [x] Verifica: `npm run tauri dev`, testi tutti visibili in italiano, nessuna stringa mancante

## Classi (school_class)

Stesso pattern di Docenti: composable dati condiviso + componente form/lista per-cartella. In più: prima pagina aggiuntiva, quindi serve una navigazione minima tra Docenti e Classi (finora c'era solo `/`, senza modo di raggiungere una seconda pagina in una finestra desktop senza barra indirizzi).

- [x] `useSchoolClasses.ts` in `app/composables/` — stesso layer dati di `useTeachers` (fetch/add/update/delete su `school_class`)
- [x] `app/components/SchoolClassForm/` — `SchoolClassForm.vue`, `useSchoolClassForm.ts`, `schoolClassFormHelper.ts` (schema zod: `name`, `section`)
- [x] `app/components/SchoolClassList/` — `SchoolClassList.vue`, `useSchoolClassList.ts`
- [x] `app/pages/classes.vue`
- [x] Navigazione minima tra `/` (Docenti) e `/classes` (Classi) — `UNavigationMenu` in `app.vue`, items statici con `$t()`
- [x] Chiavi di traduzione in `i18n/locales/it.json` (titolo, form, lista, voci nav) — stessa struttura di `teachers`
- [x] Verifica: `npm run tauri dev`, aggiungere/eliminare una classe, navigare tra le due pagine, testi in italiano
- [x] Fix stile: `UInput` non riempiva il container (`inline-flex` senza `w-full` sul suo slot `root`) — `class="w-full"` direttamente sul componente nei template, non un override globale in `app.config.ts` (deviava dall'approccio "classi Tailwind dove servono")
- [ ] Spostata la nav da `app.vue` a `app/layouts/default.vue` — `app.vue` resta minimale (`UApp` + locale + `NuxtLayout`/`NuxtPage`)
- [x] Fix bug: la lista non si aggiornava dopo un inserimento dal form — `useTeachers`/`useSchoolClasses` creavano un `ref([])` nuovo a ogni chiamata (form e lista non condividevano stato). Sostituito con `useState()` (chiave condivisa, persiste tra i componenti che lo richiamano)
- [x] Fix stile: i bottoni non mostravano `cursor: pointer` (Tailwind dalla v3 l'ha tolto dal reset di default) — regola globale `button:not(:disabled) { cursor: pointer }` in `@layer base` dentro `app/assets/scss/main.scss` (è un reset di base, non uno stile per-componente da ripetere nei template)

## Materie (subject)

Stesso pattern di Docenti/Classi — la più semplice delle tre (solo `name`).

- [x] `useSubjects.ts` in `app/composables/`
- [x] `app/components/SubjectForm/` — `SubjectForm.vue`, `useSubjectForm.ts`, `subjectFormHelper.ts`
- [x] `app/components/SubjectList/` — `SubjectList.vue`, `useSubjectList.ts`
- [x] `app/pages/subjects.vue`
- [x] Voce di navigazione in `app/layouts/default.vue`
- [x] Chiavi di traduzione in `i18n/locales/it.json`
- [x] Verifica: `npm run tauri dev`, aggiungere/eliminare una materia, lista si aggiorna subito, nav funziona

## Cattedre (assignment)

Più complessa delle precedenti: collega docente+classe+materia+ore. Differenze rispetto al pattern finora:
- il form ha 3 `USelect` (docente/classe/materia, liste piccole — sotto i 10 elementi tipicamente, altrimenti si passa a `USelectMenu`) invece di `UInput` di testo, più `UInputNumber` per le ore settimanali
- la query di lettura fa JOIN su `teacher`/`school_class`/`subject` per mostrare nomi leggibili nella lista invece dei soli id — tipo `AssignmentWithDetails` separato dal tipo `Assignment` grezzo (quello usato per insert/update)
- il form per le select deve popolare le liste di docenti/classi/materie (fetch al mount, come già fa `useTeacherList` ecc.)

- [x] `useAssignments.ts` in `app/composables/` — `Assignment` (id, teacher_id, school_class_id, subject_id, weekly_hours) + `AssignmentWithDetails` per la lista (via JOIN)
- [x] `app/components/AssignmentForm/` — `AssignmentForm.vue`, `useAssignmentForm.ts`, `assignmentFormHelper.ts` (schema zod: 3 id + weekly_hours positivo). Il form fa anche `fetchTeachers`/`fetchSchoolClasses`/`fetchSubjects` al mount per popolare le `USelect` (nessuna delle tre liste è già montata sulla pagina Cattedre)
- [x] `app/components/AssignmentList/` — `AssignmentList.vue`, `useAssignmentList.ts`
- [x] `app/pages/assignments.vue`
- [x] Voce di navigazione in `app/layouts/default.vue`
- [x] Chiavi di traduzione in `i18n/locales/it.json`
- [ ] Verifica: `npm run tauri dev`, creare una cattedra con le select popolate, lista mostra nomi leggibili, si aggiorna subito, nav funziona
- [x] Fix stile: `max-w-md mx-auto p-6 space-y-6` era duplicato identico su tutte e 4 le pagine — spostato il wrapper (`container mx-auto p-6`, niente più `max-w-md`: a tutto schermo per ora) in `app/layouts/default.vue`, le pagine restano con solo `space-y-6` per lo spacing interno del loro contenuto

## Tabelle + modifica (tutte e 4 le entità)

Le liste (`<ul><li>`) diventano tabelle (`UTable`): header con i nomi dei campi, una riga per record, colonna finale "Azioni" con matita (modifica) e cestino (elimina) — stesso stile inline già usato per il cestino, niente dropdown.

La modifica non esisteva ancora in UI (solo `updateTeacher`/`updateSchoolClass`/ecc. nei composable, mai collegati). Il `UModal` di modifica vive dentro lo stesso `*Table.vue`/`use*Table.ts` (non una cartella a parte): è scatenato dalla riga della tabella, quindi ci sta dentro la stessa "una chiamata al composable" del componente — il composable espone anche stato/submit del form di modifica, riusando lo schema zod già scritto in `*FormHelper.ts`.

Parto da Docenti come pattern di riferimento, poi replico su Classi/Materie/Cattedre.

- [x] `TeacherTable.vue` + `useTeacherTable.ts` (sostituisce `TeacherList`/`useTeacherList`) — colonne Nome/Cognome/Azioni, `UModal` di modifica incluso
- [x] `SchoolClassTable.vue` + `useSchoolClassTable.ts` — colonne Nome/Sezione/Azioni
- [x] `SubjectTable.vue` + `useSubjectTable.ts` — colonna Nome/Azioni
- [x] `AssignmentTable.vue` + `useAssignmentTable.ts` — colonne Docente/Classe/Materia/Ore settimanali/Azioni. Estratto `useAssignmentOptions.ts` (composable condiviso in `app/composables/`) per le opzioni delle 3 select: sia il form di creazione che il modal di modifica ne avevano bisogno identiche, duplicarle sarebbe stato un rischio di disallineamento
- [x] Aggiornare le 4 pagine per usare `*Table` al posto di `*List`
- [x] Chiavi di traduzione per gli header di colonna e le azioni (modifica/elimina) — `table.actions`/`table.cancel`/`table.save` condivisi, `*.editTitle` per-entità
- [x] Spostati i 4 `*FormHelper.ts` da dentro le cartelle `*Form/` a `app/utils/` — ora servono sia al form di creazione sia al modal di modifica nella tabella, non sono più "di un solo componente"
- [x] Verifica: `npm run tauri dev`, modificare ed eliminare un elemento per ognuna delle 4 entità

## Pagine dedicate per aggiunta/modifica (sostituisce il modal appena fatto)

Cambio di rotta rispetto al blocco precedente: niente più `UModal`, aggiunta e modifica diventano pagine separate, stesso componente form riusato in entrambe le modalità.

**Routing per entità** (esempio Docenti, stesso schema per le altre 3):
- `app/pages/teachers/index.vue` — tabella (Docenti si sposta da `/` a `/teachers`, `/` resta alias della stessa pagina — vedi tabella "I nomi"/Struttura in CLAUDE.md se serve aggiornare riferimenti)
- `app/pages/teachers/new.vue` — `<TeacherForm />` senza id, modalità creazione
- `app/pages/teachers/[id]/edit.vue` — `<TeacherForm :id="..." />`, modalità modifica

**Form a doppia modalità**: `*Form.vue` accetta un prop opzionale `id: number`. Nel composable: se `id` è presente → fetch, cerca il record, precompila lo stato, il submit chiama `updateX(id, data)`; se assente → stato vuoto, submit chiama `addX(data)`. Dopo il submit (in entrambi i casi), `navigateTo('/entità')` torna alla tabella. Sono due richieste DB separate (`addX` vs `updateX`), non un unico branch condizionale nella query.

**Tabella**: il bottone "modifica" diventa un link (`to="/entità/:id/edit"`) invece di aprire il modal — tolgo tutto lo stato/UI del modal da `use*Table.ts`/`*Table.vue` fatto nel blocco precedente. Il bottone "Aggiungi {Entità}" (per-entità, non generico: "Aggiungi Docente", "Aggiungi Classe"...) sta nella pagina index, a destra dell'h1, non nella tabella — è navigazione, non comportamento della tabella.

**Riorganizzazione cartelle**: `app/components/<Entità>/<Entità>Form/` e `app/components/<Entità>/<Entità>Table/` — una cartella macroarea per entità con dentro le sue due sotto-cartelle, invece di `<Entità>Form/`/`<Entità>Table/` come sibling diretti in `components/`.

Parto da Docenti come pattern di riferimento, poi replico su Classi/Materie/Cattedre.

- [x] Spostare `app/components/TeacherForm/` e `app/components/TeacherTable/` dentro `app/components/Teacher/`
- [x] `TeacherForm.vue`/`useTeacherForm.ts` — prop `id?`, doppia modalità (crea/modifica), redirect dopo submit
- [x] `TeacherTable.vue`/`useTeacherTable.ts` — tolto il modal, "modifica" diventa link a `/teachers/:id/edit`
- [x] `app/pages/teachers/index.vue` (spostata da `app/pages/index.vue`, alias `/`), `new.vue`, `[id]/edit.vue`
- [x] Bottone "Aggiungi Docente" nella pagina index
- [x] Ripetuto per Classi (`app/components/SchoolClass/`), Materie (`app/components/Subject/`), Cattedre (`app/components/Assignment/`) — per Cattedre anche `useAssignmentForm` ora fa doppio fetch al mount (opzioni select + dati esistenti se in modifica)
- [x] Chiavi di traduzione: `*.addButton` per entità, rimosso `table.cancel` (non più usato, era per il modal)
- [x] Rinominare i nomi delle cartelle con kebab-case, mantenendo i nomi dei file in camelCase; tranne per i file .vue che mantengono SensitiveCase — `components/Teacher/TeacherForm/` → `components/teacher/teacher-form/` ecc. (rename bloccato dal lock di Windows sulle cartelle finché `npm run tauri dev` era attivo)
- [x] Verifica: `npm run tauri dev`, aggiungere/modificare/eliminare per tutte e 4, nav e redirect funzionano
- [x] Bottone "torna indietro" (icona, `aria-label`) nelle 8 pagine `new.vue`/`[id]/edit.vue`, accanto al titolo
- [x] Fix bug: cancellare un docente/classe/materia già collegato a una cattedra falliva con `FOREIGN KEY constraint failed` non gestito (promise non catchata, errore grezzo in console). Il vincolo FK di per sé è corretto — SQLite lo applica davvero, a differenza di quanto pensavo inizialmente durante il setup iniziale del DB. Aggiunto `describeDbError()` in `app/utils/dbErrors.ts` (helper puro condiviso) + try/catch nei 4 `delete*` dei composable, messaggio tradotto (`general.deleteBlocked`) mostrato nell'`UAlert` già esistente nelle tabelle
- [x] Migliorato il messaggio di cancellazione bloccata: toast (`useToast()`, non tocca il layout della tabella) invece di `UAlert` inline, con nome del record cliccato e dove viene usato (elenco cattedre coinvolte). `app/utils/dbErrors.ts` ridotto a `isForeignKeyError()` (solo detection); `app/composables/useAssignmentUsages.ts` (nuovo, condiviso) cerca le cattedre che referenziano un docente/classe/materia riusando lo stato già in `useAssignments`, nessuna query aggiuntiva
- [x] Filtro testuale per colonna in cima alle 4 tabelle (non su "Azioni") — client-side (`computed` che filtra l'array prima di passarlo a `UTable`, dataset piccoli, non serve altro), stato `filters` reattivo per-composable
- [x] Filtri spostati in un `UPopover` dietro un bottone "Filtri" a sinistra di "Aggiungi X" (non più input sempre visibili sopra la tabella). Il bottone/popover sta nella pagina, la tabella filtra i dati: serviva stato condiviso tra i due, quindi `filters` è passato da `reactive()` locale a `useState()` in un composable dedicato per entità (`use*Filters.ts`, stesso pattern di `useTeachers` ecc.)
- [x] Bottone "x" per svuotare i filtri quando popolati — nuovo componente condiviso `app/components/ClearableInput/` (wrapper su `UInput`, `#trailing` condizionale), non legato a un'entità quindi fuori dalle cartelle macroarea. Usato nei 9 campi filtro delle 4 pagine
- [x] Composables riorganizzati per entità: `app/composables/{teacher,school-class,subject,assignment}/`, stesso principio delle cartelle macroarea già fatto per `components/`. A differenza di `components/`, Nuxt scansiona solo i file di primo livello in `composables/` — aggiunto `imports.dirs: ['composables', 'composables/**']` in `nuxt.config.ts` per far funzionare l'auto-import dalle sottocartelle

## useNotification — notifiche unificate su toast

Composable condiviso (`app/composables/useNotification.ts`, non legato a un'entità) che wrappa `useToast()` con 4 metodi — `success`/`error`/`warning`/`info` — colore e icona di default già impostati, cosi le chiamate passano solo testo. "Alert" trattato come sinonimo di `error` (Nuxt UI non ha un colore "alert" a sé).

Decisioni confermate: **tutto** il feedback (successo, errore di fetch, blocco FK) passa da qui — tolgo `UAlert`/stato `error` dalle 4 tabelle; **ogni** operazione CRUD riuscita (12 in totale: add/update/delete × 4 entità) mostra un toast di conferma, non solo le eliminazioni.

Problema di concordanza di genere (Docente m., Classe/Materia/Cattedra f.) risolto con participi impersonali come titolo ("Aggiunto"/"Modificato"/"Eliminato", chiavi generiche in `general.*`) + nome del record in descrizione — niente aggettivo che deve concordare col genere dell'entità.

- [x] `app/composables/useNotification.ts` — `success`/`error`/`warning`/`info`, ognuno chiama `toast.add()` con color/icon di default
- [x] Chiavi i18n generiche: `general.added`/`general.updated`/`general.deleted` (participi impersonali), `general.errorTitle` (per errori imprevisti non-FK)
- [x] 4 composable dati (`useTeachers`, `useSchoolClasses`, `useSubjects`, `useAssignments`): sostituito `error.value = ...` (fetch) e la logica FK esistente con `useNotification`; aggiunto `notify.success(...)` dopo add/update/delete riusciti. Per delete il nome va letto prima della query DELETE; per l'add di Cattedre non avevamo il nome finché non abbiamo il `lastInsertId` dal risultato dell'INSERT + un refetch (i nomi leggibili vengono dalla JOIN, non dai soli id)
- [x] Rimosso `error` dal return dei 4 composable e `<UAlert v-if="error">` dalle 4 `*Table.vue`
- [x] Verifica: fetch fallito (browser senza Tauri) mostra correttamente il toast d'errore invece del banner fisso — verificato dal vivo. Manca ancora la verifica dei toast di successo/blocco FK, serve il DB reale in Tauri

## Conferma eliminazione + fix naming

- [x] Fix: cartella `ClearableInput` era in PascalCase invece di kebab-case, incoerente con la convenzione — rinominata in `clearable-input`
- [x] Modale di conferma prima di ogni eliminazione (tutte e 4 le tabelle) — pattern ufficiale Nuxt UI (`useOverlay` + componente generico che emette `close: boolean`), non serviva inventare nulla: `app/components/confirm-dialog/ConfirmDialog.vue` + `app/composables/useConfirmDialog.ts` (funzione che ritorna `Promise<boolean>`, `dismissible: false` — va scelto esplicitamente, non si chiude cliccando fuori). Bottone elimina nelle 4 tabelle ora chiama `handleDelete` (mostra il modale, poi `delete*` solo se confermato) invece di `delete*` direttamente
- [ ] Verifica: `npm run tauri dev`, cliccare elimina su un elemento mostra il modale, annulla non cancella nulla, conferma cancella (e mostra il toast di successo)

## Classi: anno + indirizzo di studio

`school_class` rappresentava solo anno+sezione (campi `name`/`section`). In realtà nello stesso plesso possono coesistere più corsi (es. 1A Scientifico Tradizionale ≠ 1E Scienze Umane, e due corsi diversi possono persino condividere anno+sezione) — serve un terzo campo per l'indirizzo di studio.

Decisioni confermate:
- `name` → rinominato `year` (era già l'anno, il nome era fuorviante)
- nuovo campo `study_track` (TEXT, richiesto per i nuovi inserimenti)
- migrazione v2 additiva (`ALTER TABLE ... RENAME COLUMN` + `ADD COLUMN ... DEFAULT ''`), non si tocca la v1 già applicata — i dati di test esistenti avranno `study_track` vuoto finché non li modifichiamo a mano

Il nome per la visualizzazione (`{year}{section} - {study_track}`) va condiviso: oltre alla tabella Classi, serve anche nelle Cattedre (select di scelta classe, colonna "Classe", messaggi di blocco eliminazione) — altrimenti l'ambiguità che stiamo risolvendo si ripresenta proprio lì. Estraggo un formatter puro condiviso invece di duplicare la concatenazione in 4 punti diversi.

- [x] Migrazione v2 in `src-tauri/src/lib.rs` — rename + add column
- [x] `app/utils/schoolClassDisplay.ts` — `formatSchoolClassName({year, section, study_track})`, pure, condiviso
- [x] `useSchoolClasses.ts` — interfaccia, query, displayName via il formatter condiviso
- [x] `schoolClassFormHelper.ts` — schema zod con `year`/`section`/`study_track`
- [x] `SchoolClassForm.vue` — 3° campo, etichetta "Nome" → "Anno"
- [x] `useSchoolClassTable.ts`/`SchoolClassTable.vue` — colonna indirizzo
- [x] `useSchoolClassFilters.ts` + popover filtri — 3° filtro
- [x] `useAssignments.ts` — `AssignmentWithDetails` (`school_class_name` → `school_class_year` + `school_class_study_track`), query JOIN, displayName interno
- [x] `useAssignmentOptions.ts` — label delle select classe col formatter condiviso
- [x] `useAssignmentTable.ts`/`AssignmentTable.vue` — colonna "Classe", filtro, `handleDelete` (estratto `schoolClassNameOf()` locale per non ripetere 3 volte la stessa costruzione oggetto)
- [x] `useTeachers.ts`/`useSubjects.ts` — testo "dove viene usato" nel blocco FK, col formatter condiviso
- [x] Chiavi i18n: `schoolClasses.form.name` → `schoolClasses.form.year`, nuova `schoolClasses.form.studyTrack`
- [x] Aggiornato CLAUDE.md (tabella "Modello dati")
- [x] Verifica statica: typecheck/lint puliti, nessun riferimento residuo a `school_class_name`/`schoolClass.name`, pagina "Aggiungi classe" mostra i 3 campi corretti (screenshot). Manca la verifica funzionale col DB reale (creare classe, vederla nella select Cattedre, filtrare)

## Corso di studio: da testo a entità vera

Il testo libero `study_track` non basta: serve poter contare/raggruppare/validare in modo affidabile, in vista soprattutto del PDF finale (la cosa più importante di tutto il progetto). Diventa un'entità come Materie, con FK da `school_class` — stesso pattern già rodato 4 volte, lo replico velocemente.

**Migrazione v3** (verificata a mano con SQLite prima di scriverla in Rust — vedi sopra): crea `study_track` (id, name), popola con i valori distinti già presenti in `school_class.study_track`, aggiunge `school_class.study_track_id` FK, lo valorizza per corrispondenza testuale, droppa la vecchia colonna testo. Righe con `study_track` vuoto restano con `study_track_id = NULL` (classi di test da sistemare a mano, coerente con la decisione già presa per la v2).

- [x] Migrazione v3 in `src-tauri/src/lib.rs` + indice su `school_class(study_track_id)` (stesso trattamento delle altre FK)
- [x] Nuova entità **Corsi di studio**, stesso pattern di Materie (solo `name`):
  - [x] `app/composables/study-track/useStudyTracks.ts` — CRUD, blocco eliminazione se un `school_class` lo referenzia ancora
  - [x] `app/composables/study-track/useStudyTrackFilters.ts`
  - [x] `app/utils/studyTrackFormHelper.ts`
  - [x] `app/components/study-track/study-track-form/`, `app/components/study-track/study-track-table/`
  - [x] `app/pages/study-tracks/index.vue`, `new.vue`, `[id]/edit.vue`
  - [x] Voce di navigazione + chiavi i18n (`studyTracks.*`, `nav.studyTracks`)
- [x] `school_class` da testo a FK:
  - [x] `SchoolClass` (raw, per insert/update) + nuovo `SchoolClassWithDetails` (con `study_track_name` via JOIN) — stessa distinzione già usata per `Assignment`/`AssignmentWithDetails`
  - [x] `useSchoolClasses.ts` — query con `LEFT JOIN study_track` (LEFT, non JOIN: righe con `study_track_id NULL` devono restare visibili), insert/update con `study_track_id`
  - [x] `schoolClassFormHelper.ts` — `study_track_id` invece di `study_track` testo
  - [x] `SchoolClassForm.vue`/`useSchoolClassForm.ts` — il campo diventa una `USelect` con le opzioni da `useStudyTracks()` (fetch al mount, come già fa `useAssignmentForm`)
  - [x] `useSchoolClassTable.ts`/`SchoolClassTable.vue` — colonna e filtro leggono `study_track_name`
- [x] Propagare il rename fino alle Cattedre (stesso giro già fatto per year/section):
  - [x] `useAssignments.ts` — `AssignmentWithDetails.school_class_study_track` → `school_class_study_track_name`, query con `LEFT JOIN study_track` aggiuntivo tramite `school_class.study_track_id`
  - [x] `useAssignmentOptions.ts`, `useAssignmentTable.ts` (`schoolClassNameOf`), `useTeachers.ts`/`useSubjects.ts` (testo "dove viene usato")
- [x] Aggiornare CLAUDE.md (Struttura tabelle + tabella "I nomi" se serve)
- [x] `year` diventato numero intero (1-5) invece di testo libero — decisione presa a valle, direttamente su `SchoolClassForm.vue` (`UInputNumber` con `:min="1" :max="5"`, coerente col dominio: l'anno scolastico è sempre 1-5). Colonna DB resta TEXT (cambiarne l'affinità richiederebbe ricostruire `school_class`, che è genitore FK di `assignment` — SQLite blocca il `DROP TABLE` dentro la transazione della migrazione, verificato con test Python dedicato prima di scartare l'opzione): lettura via `CAST(year AS INTEGER)` in tutte le query (`useSchoolClasses.ts`, `useAssignments.ts`), scrittura invariata (l'affinità TEXT converte comunque il numero in ingresso). `schoolClassFormHelper.ts` con `z.number().int().min(1).max(5)`, nuova chiave i18n `schoolClasses.form.yearInvalid`
- [ ] Verifica: `npm run tauri dev` — la migrazione v3 si applica senza errori sui dati di test già presenti, creare/eliminare un corso di studio, la select in Classi si popola, il blocco eliminazione funziona se un corso è ancora usato, il campo Anno accetta solo 1-5

## Sezione: da testo a entità vera

Stesso ragionamento di `study_track`: `section` (es. "A", "B") è testo libero su `school_class`, quindi soggetto a incoerenze (maiuscole/minuscole, spazi) che spezzerebbero raggruppamenti che dovrebbero coincidere — problema uguale in vista del PDF. Diventa un'entità **Sezioni**, stesso pattern minimale già rodato 5 volte (solo `name`).

**Migrazione v4** (verificata a mano con SQLite prima di scriverla in Rust, stesso approccio di v3): crea `section` (id, name), popola con i valori distinti già presenti in `school_class.section`, aggiunge `school_class.section_id` FK, lo valorizza per corrispondenza testuale, droppa la vecchia colonna testo. A differenza di `study_track_id`, `section` era `NOT NULL` fin dalla v1 (nessuna classe di test con sezione vuota) quindi non ci si aspetta `section_id NULL` dopo il backfill — ma la colonna resta comunque nullable a livello SQL (stesso motivo già accettato per `study_track_id`: imporre `NOT NULL` richiederebbe ricostruire `school_class`, bloccato dal vincolo FK di `assignment` dentro la transazione della migrazione). Il vincolo "sempre presente" resta quindi a livello applicativo (zod), come già per `teacher_id`/`subject_id` nelle Cattedre.

- [x] Migrazione v4 in `src-tauri/src/lib.rs` + indice su `school_class(section_id)`
- [x] Nuova entità **Sezioni**, stesso pattern di Corsi di studio (solo `name`):
  - [x] `app/composables/section/useSections.ts` — CRUD, blocco eliminazione se un `school_class` la referenzia ancora
  - [x] `app/composables/section/useSectionFilters.ts`
  - [x] `app/utils/sectionFormHelper.ts`
  - [x] `app/components/section/section-form/`, `app/components/section/section-table/`
  - [x] `app/pages/sections/index.vue`, `new.vue`, `[id]/edit.vue`
  - [x] Voce di navigazione + chiavi i18n (`sections.*`, `nav.sections`)
- [x] `school_class` da testo a FK:
  - [x] `SchoolClass`/`SchoolClassWithDetails` — `section: string` → `section_id: number | null` (raw) + `section_name: string | null` (via JOIN)
  - [x] `useSchoolClasses.ts` — query con `LEFT JOIN section` aggiuntivo, insert/update con `section_id`
  - [x] `schoolClassFormHelper.ts` — `section_id` invece di `section` testo
  - [x] `SchoolClassForm.vue`/`useSchoolClassForm.ts` — il campo diventa una `USelect` con le opzioni da `useSections()`
  - [x] `useSchoolClassTable.ts`/`SchoolClassTable.vue` — colonna e filtro leggono `section_name`
  - [x] `schoolClassDisplay.ts` (`formatSchoolClassName`) — `section: string` → `section_name: string | null` (mai vuoto in pratica ma tipizzato coerente con `study_track_name`)
- [x] Propagare fino alle Cattedre (stesso giro già fatto per `study_track`):
  - [x] `useAssignments.ts` — `AssignmentWithDetails.school_class_section` → `school_class_section_name`, query con `LEFT JOIN section` aggiuntivo tramite `school_class.section_id`
  - [x] `useAssignmentOptions.ts` (nessuna modifica: usa già `formatSchoolClassName(schoolClass)` genericamente), `useAssignmentTable.ts` (`schoolClassNameOf`), `useTeachers.ts`/`useSubjects.ts` (testo "dove viene usato"), `useStudyTracks.ts` (stesso testo "dove viene usato" per il blocco eliminazione di un corso di studio)
- [x] Aggiornare CLAUDE.md (Struttura tabelle + tabella "I nomi")
- [ ] Verifica: `npm run tauri dev` — la migrazione v4 si applica senza errori sui dati di test già presenti, creare/eliminare una sezione, la select in Classi si popola, il blocco eliminazione funziona se una sezione è ancora usata

## Home page, Anagrafica come macro-area, tema chiaro/scuro

Finora il menu in alto elencava tutte le 6 entità sullo stesso piano. Ora che il progetto ha più di un'area (Anagrafica oggi, Tabella orario ed Esportazione PDF in arrivo), serve un punto di ingresso che le presenti come scelte di pari livello - non solo un elenco piatto di tabelle.

Decisioni confermate:
- `/` diventa una vera home page con 3 card grandi (Anagrafica, Tabella orario, Esporta PDF), non più alias di `/teachers`
- Tabella orario ed Esporta PDF non esistono ancora: card/voci di menu visibili ma disabilitate, con badge "In arrivo" - la struttura è pronta, si abilitano quando la feature esiste
- Le 6 entità restano alle URL attuali (`/teachers`, `/school-classes`, ecc.) - nessun nesting delle route, solo una nuova pagina hub `/registry` che le presenta come card
- Il menu in alto si riduce a 3 voci (Anagrafica, Tabella orario, Esporta PDF) invece delle 6 attuali, più un titolo/logo a sinistra che porta alla home e il pulsante tema a destra
- Tema chiaro/scuro: `@nuxt/ui` registra già `@nuxt/color-mode` in automatico, basta `UColorModeButton` - nessuna dipendenza o configurazione nuova

- [x] `app/pages/index.vue` - vera home page, 3 `UPageCard` in `UPageGrid` (Anagrafica abilitata, Tabella orario/Esporta PDF disabilitate con badge)
- [x] Rimuovere `definePageMeta({ alias: '/' })` da `app/pages/teachers/index.vue`
- [x] `app/pages/registry/index.vue` - hub Anagrafica, 6 `UPageCard` verso le entità esistenti (icona + titolo, riuso delle chiavi i18n `teachers.title`/`schoolClasses.title`/ecc. già esistenti)
- [x] `app/layouts/default.vue` - riscritto: titolo/logo "School Grid" a sinistra (link a `/`), `UNavigationMenu` con le 3 macro-aree (Tabella orario/Esporta PDF con `disabled: true` e `badge`), `UColorModeButton` a destra
- [x] Chiavi i18n: `nav.registry`/`nav.schedule`/`nav.pdfExport`/`nav.comingSoon`, `home.*` (titolo/descrizione delle 3 card), `registry.title`
- [x] Coerenza titolo+indietro a ogni livello: le pagine indice delle 6 entità (`/teachers`, `/school-classes`, ecc.) non avevano un pulsante indietro proprio — si usciva solo ricliccando "Anagrafica" nel menu in alto. Aggiunto lo stesso pattern icona+aria-label già usato in `new.vue`/`[id]/edit.vue`, verso `/registry`
- [ ] Verifica: `npm run tauri dev` - `/` mostra la home, Anagrafica porta all'hub e da lì alle 6 entità, Tabella orario/Esporta PDF non sono cliccabili, il pulsante tema cambia chiaro/scuro e resta coerente su tutte le pagine, ogni pagina indice/hub ha un pulsante indietro funzionante

## Preferenze (giorno libero del docente)

Prossima dipendenza prima della griglia orario: la regola "giorno libero non rispettato" (avviso, non blocco) non ha senso senza sapere quale sia il giorno libero di ciascun docente. La tabella `preference` esiste già dalla migrazione v1 (`id`, `teacher_id` FK, `day_off`).

Decisioni confermate:
- Un docente ha **al massimo un** giorno libero, non una lista - niente entità/pagina CRUD a parte, il campo vive direttamente nel form Docente (select opzionale, "Nessuno" incluso)
- Giorni selezionabili: lunedì-sabato (settimana scolastica a 6 giorni) - lista fissa hardcoded, non una entità come Sezioni/Corsi di studio: i giorni della settimana non sono un vocabolario che l'utente gestisce
- `preference.day_off` resta il valore di riferimento anche per `schedule_entry.day` quando costruiremo la griglia: stesso vocabolario, stessi valori (`monday`..`saturday`), etichette tradotte via `weekdays.*`
- Eliminare un docente elimina anche la sua eventuale riga in `preference` (è un attributo suo, non un uso incrociato come le Cattedre) - niente blocco FK da gestire qui

- [x] `app/utils/weekdays.ts` - costante `WEEKDAY_VALUES` (`monday`..`saturday`)
- [x] Chiavi i18n: `weekdays.monday`..`weekdays.saturday`, `teachers.form.dayOff`, `teachers.form.noDayOff`, `teachers.form.allDayOff` (voce "Tutti" nel filtro)
- [x] `app/composables/teacher/useTeacherPreference.ts` (nuovo, condiviso) - `saveDayOff(teacherId, dayOff | null)` (upsert/delete), `deleteDayOff(teacherId)`
- [x] `useTeachers.ts` - `TeacherWithDetails` con `day_off: string | null` via `LEFT JOIN preference`; `addTeacher` ritorna l'id creato (serve per salvare la preferenza al primo submit); `deleteTeacher` cancella prima la riga in `preference`
- [x] `useTeacherForm.ts`/`TeacherForm.vue` - select "Giorno libero" (con opzione "Nessuno"), salvata via `useTeacherPreference` dopo l'add/update del docente
- [x] `useTeacherTable.ts`/`TeacherTable.vue` - colonna "Giorno libero"; `useTeacherFilters.ts`/pagina `teachers/index.vue` - filtro a `USelect` (non `ClearableInput`, è un vocabolario chiuso non testo libero)
- [x] Aggiornato CLAUDE.md (riga `preference` nel modello dati, `useTeacherPreference` nella tabella "I nomi")
- [ ] Verifica: `npm run tauri dev` - impostare/rimuovere il giorno libero di un docente, la colonna in tabella si aggiorna, eliminare un docente con giorno libero impostato non fallisce per FK

## Rimozione Materie: la cattedra non ha più bisogno della materia

Decisione: `assignment` (cattedra) diventa solo docente + classe + ore settimanali. Motivazione dell'utente: si sa già a prescindere dalla materia quante ore un docente deve fare in una classe.

Segnalato il compromesso prima di procedere: senza materia, un docente non può più avere due incarichi distinti sulla stessa classe (es. Italiano + Storia con ore diverse) - le due righe sarebbero indistinguibili in tabella, e nel PDF finale ogni slot mostrerà solo il nome del docente, non cosa insegna. Confermata la rimozione comunque.

- [x] Migrazione v5 in `src-tauri/src/lib.rs`: `ALTER TABLE assignment DROP COLUMN subject_id; DROP TABLE subject;` - verificato con test Python prima di scriverla: `DROP COLUMN` diretto funziona anche su una colonna con FK (SQLite moderno), non serve ricostruire la tabella come per `year`/`section_id`
- [x] Rimuovere l'intera entità Materie: `app/composables/subject/`, `app/components/subject/`, `app/pages/subjects/`, `app/utils/subjectFormHelper.ts`
- [x] `useAssignments.ts` - `Assignment`/`AssignmentWithDetails` senza `subject_id`/`subject_name`, query senza `JOIN subject`, `displayName()` senza materia
- [x] `useAssignmentOptions.ts` - via `subjectOptions`/`fetchSubjects`
- [x] `useAssignmentUsages.ts` - via `bySubject` (nessun altro consumer)
- [x] `assignmentFormHelper.ts`/`AssignmentForm.vue`/`useAssignmentForm.ts` - via il campo materia
- [x] `useAssignmentTable.ts`/`AssignmentTable.vue`/`useAssignmentFilters.ts`/`assignments/index.vue` - via colonna/filtro materia
- [x] `useSchoolClasses.ts`/`useTeachers.ts` - messaggio "dove viene usato" nel blocco eliminazione, via `subject_name`
- [x] `registry/index.vue` - via card Materie
- [x] i18n: via blocco `subjects.*`, `assignments.form.subject`, `nav.subjects`
- [x] Aggiornare CLAUDE.md (Project Overview + Modello dati: `assignment` senza `subject_id`, via riga `subject`, nota sul compromesso accettato; tabella "I nomi" via `useSubjects`)
- [ ] Verifica: `npm run tauri dev` - la migrazione v5 si applica senza errori sui dati di test già presenti, creare/modificare una cattedra senza materia, l'Anagrafica non mostra più Materie

## Preferenze: più giorni liberi per docente

Corregge la decisione precedente ("al massimo uno") - un docente può avere più giorni di riposo. Buona notizia: la tabella `preference` supporta già più righe per docente dal giorno 0 della migrazione v1, il vincolo "al massimo uno" era solo applicativo (form + composable), non nello schema.

- [x] `useTeacherPreference.ts` - `saveDayOff` → `saveDayOffs(teacherId, dayOffs: Weekday[])`: sostituisce tutte le righe (delete di tutte + insert per ogni giorno selezionato) - niente diffing, il set è troppo piccolo (max 6) per giustificarlo
- [x] `useTeachers.ts` - `TeacherWithDetails.day_off: string | null` → `day_off: Weekday[]`; il `LEFT JOIN preference` produrrebbe righe duplicate per docente con più giorni, quindi due query separate (docenti + tutte le preferenze) aggregate in JS invece del JOIN
- [x] `teacherFormHelper.ts` - `day_off: z.enum(WEEKDAY_VALUES).nullable()` → `day_off: z.array(z.enum(WEEKDAY_VALUES))`
- [x] `useTeacherForm.ts`/`TeacherForm.vue` - `USelect` con prop `multiple`, default `[]` invece di `null`
- [x] `useTeacherTable.ts` - colonna con i giorni liberi concatenati e tradotti; filtro `teachers/index.vue` invariato nella forma (select singola: "il docente ha questo giorno tra i suoi liberi", via `.includes()` invece di uguaglianza)
- [x] Aggiornare CLAUDE.md (riga `preference`: da "al massimo una riga per docente" a "più righe per docente")
- [ ] Verifica: `npm run tauri dev` - selezionare più giorni liberi per un docente, la tabella li mostra tutti, il filtro funziona, eliminare un docente con più giorni liberi non fallisce per FK

## Aggiunta in massa: Classi e Cattedre

Il processo di aggiunta a un record per volta è tedioso quando si inseriscono tante classi/cattedre simili (es. tutte le classi della sezione A, o tutte le classi assegnate a un docente). Il form "Aggiungi" (solo quello - "Modifica" resta un singolo record) diventa un elenco ripetibile di righe: parte con 1 riga come oggi (nessun click in più per il caso comune di un solo inserimento), un pulsante "+ Aggiungi" ne appende altre, il submit inserisce tutte le righe in un colpo solo con un'unica notifica riassuntiva invece di N notifiche separate.

Pattern tecnico: `UForm` supporta nativamente liste annidate (`nested` prop + `name="items.N"` + `UForm` figlio con proprio schema) - ogni riga si autovalida, il form padre aspetta tutte le righe prima di inviare. Niente libreria esterna, è già documentato in Nuxt UI.

Il form di modifica (`[id]/edit.vue`) non cambia: resta un singolo record con lo stesso componente/composable di sempre. Solo il form di creazione cambia forma, quindi si separa in un componente/composable dedicato invece di sovraccaricare quello esistente con due modalità molto diverse (riga singola vs elenco).

**Classi**: ogni riga ha anno/sezione/corso di studio (gli stessi 3 campi di sempre). "+ Aggiungi classe" copia sezione e corso di studio dall'ultima riga e incrementa l'anno di 1 (se ≤5) - così per "1A, 2A, 3A Scientifico" si clicca + due volte e non si cambia altro. Nessun campo condiviso a livello di form: ogni riga resta indipendente (si può comunque cambiare sezione/corso in una riga specifica se serve).

**Cattedre**: il docente si sceglie *una volta sola* in cima al form (campo condiviso, non ripetuto per riga - è esplicitamente il caso d'uso richiesto: "per un docente voglio aggiungere più classi"). Ogni riga ha solo classe e ore settimanali.

- [x] `useSchoolClasses.ts` - `addSchoolClass` sostituito da `addSchoolClasses(items[])` (unico entry point, anche per una singola riga): `insertSchoolClass` privato condiviso, un solo `fetchSchoolClasses()` e un solo toast alla fine (per 1 riga stesso messaggio di prima, per più righe titolo `general.addedBatch` con conteggio e descrizione coi nomi delle classi separati da virgola)
- [x] `useAssignments.ts` - stesso pattern: `addAssignment` sostituito da `addAssignments(teacherId, items[])`
- [x] Nuovo `useSchoolClassBatchForm.ts` + `SchoolClassBatchForm.vue` (create-only, sostituisce `SchoolClassForm` in `new.vue`): `state.items: Partial<SchoolClassFormSchema>[]`, parte con 1 riga, `addRow()`/`removeRow(index)` (cestino nascosto se resta 1 sola riga), ogni riga è un `UForm` annidato (`nested` + `name="items.N"`, niente `:state` proprio - eredita dal genitore, non passavo `:state` sulla nested form nel primo tentativo e TypeScript l'ha bloccato subito) col già esistente `createSchoolClassFormSchema`
- [x] Nuovo `useAssignmentBatchForm.ts` + `AssignmentBatchForm.vue` (create-only, sostituisce `AssignmentForm` in `new.vue`): `teacher_id` in cima (nuovo `createAssignmentTeacherFormSchema`, solo questo campo), righe classe+ore con nuovo `createAssignmentItemFormSchema` (senza `teacher_id`) - entrambi aggiunti a `assignmentFormHelper.ts` accanto allo schema esistente
- [x] `SchoolClassForm.vue`/`useSchoolClassForm.ts` e `AssignmentForm.vue`/`useAssignmentForm.ts` esistenti ridotti a edit-only (`id: number` obbligatorio, non più opzionale) - restano usati solo da `[id]/edit.vue`
- [x] `pages/school-classes/new.vue`/`pages/assignments/new.vue` - renderizzano i nuovi componenti Batch invece dei Form esistenti
- [x] Chiavi i18n: `form.addRow`, `form.removeRow`, `general.addedBatch`
- [ ] Verifica: `npm run tauri dev` - aggiungere una sola classe/cattedra funziona come prima (0 click in più), aggiungere 3 classi della stessa sezione con anni diversi in un solo submit, aggiungere 2 cattedre per lo stesso docente in un solo submit, rimuovere una riga funziona, non si può rimuovere l'ultima riga rimasta

## Uniformare i pulsanti dei form: Salva + Annulla

Il pulsante di submit diceva "Aggiungi" in creazione e "Salva" in modifica - stesso form, testo diverso senza un vero motivo. Diventa sempre "Salva". Aggiunto anche un pulsante "Annulla" di fianco (oltre alla freccia indietro già presente in cima alla pagina) che riporta alla lista - la freccia in alto da sola non è un affordance sufficiente per annullare un form a metà compilazione.

- [x] Rimossa la chiave i18n `form.submit` ("Aggiungi", ormai identica a `table.save`) - tutti i pulsanti di submit usano `table.save`
- [x] `useTeacherForm.ts`/`useSectionForm.ts`/`useStudyTrackForm.ts` - rimossi `isEditing`/`submitLabel` (il testo del bottone non dipende più dalla modalità, non serviva più il computed)
- [x] Aggiunto `<UButton :label="t('general.cancel')" color="neutral" variant="outline" to="/...">` di fianco al submit in tutti e 7 i form (Docenti, Sezioni, Corsi di studio, Classi singolo+batch, Cattedre singolo+batch) - stessa destinazione della freccia indietro della pagina
- [ ] Verifica: `npm run tauri dev` - ogni form (le 5 entità, creazione e modifica) mostra "Salva" + "Annulla", Annulla riporta alla lista senza salvare

## Fix: classi duplicate (stesso anno+sezione+corso di studio)

Bug grave scoperto dall'utente: nulla impediva di creare due classi identiche (es. due 1A Scientifico) - lo schema aveva `study_track_id` proprio per distinguere due classi con lo stesso anno+sezione (1A Scientifico ≠ 1A Linguistico), ma non c'era alcun vincolo che impedisse di creare due volte *la stessa identica combinazione*.

**Migrazione v6** (verificata a mano con SQLite prima di scriverla in Rust, incluso uno scenario con una cattedra che referenzia uno dei due duplicati): deduplica le classi già esistenti con lo stesso `(year, section_id, study_track_id)` non-null (tiene la riga con id più basso, ripunta le eventuali cattedre dei duplicati rimossi verso la riga tenuta, poi cancella i duplicati), poi aggiunge `CREATE UNIQUE INDEX ... ON school_class(year, section_id, study_track_id)`. Le righe legacy con `section_id`/`study_track_id` `NULL` restano escluse dal vincolo (semantica SQL: `NULL` non è mai considerato uguale a un altro `NULL`) e dalla deduplica - coerente con la scelta già presa di lasciarle "da sistemare a mano".

Limite noto accettato: `db.execute()` di `tauri-plugin-sql` non garantisce che chiamate sequenziali (`BEGIN`/`INSERT`/`COMMIT`) restino sulla stessa connessione del pool sqlx - avvolgere in una vera transazione l'inserimento a righe multiple del form batch non è affidabile con questo plugin, quindi *non* è stato fatto. In pratica: se una riga a metà di un inserimento in massa viola il vincolo, le righe precedenti restano comunque salvate (il form mostra l'errore e non naviga via, ma non riporta indietro quanto già inserito).

- [x] Migrazione v6 in `src-tauri/src/lib.rs`
- [x] `app/utils/dbErrors.ts` - nuovo `isUniqueConstraintError()`, stesso pattern di `isForeignKeyError()`
- [x] `useSchoolClasses.ts` - `addSchoolClasses`/`updateSchoolClass` catturano il vincolo univoco, mostrano un errore dedicato (`schoolClasses.duplicateTitle`/`duplicateDescription`) invece del messaggio SQL grezzo, e ritornano `boolean` (successo/fallimento)
- [x] `useSchoolClassForm.ts`/`useSchoolClassBatchForm.ts` - `onSubmit` naviga via dalla pagina solo se l'operazione è andata a buon fine, altrimenti resta sul form con l'errore visibile
- [x] Aggiornato CLAUDE.md (riga `school_class` nel modello dati)
- [ ] Verifica: `npm run tauri dev` - creare due classi identiche (stesso anno/sezione/corso) mostra l'errore invece di crearle entrambe, sia in creazione singola che in modifica; se ci sono già duplicati nel DB di test la migrazione li unisce senza errori all'avvio

## Tabella orario: griglia trascinabile

La feature per cui il progetto esiste, insieme all'export PDF (vedi Project Overview in CLAUDE.md). Finora la tabella `schedule_entry` (dalla migrazione v1) non è mai stata usata da nessuna UI.

Decisioni confermate:
- **Unità di costruzione: per classe.** Si sceglie una classe, si vede/riempie il suo orario settimanale trascinandoci le cattedre di quella classe. I controlli su docente doppio restano comunque globali (un docente non può comparire in due classi nello stesso slot, anche lavorando su una classe alla volta) - una vista per docente (sola lettura, il suo orario attraverso le classi) è rimandata a dopo, non blocca il v1.
- **Griglia fissa 6×6**: lunedì-sabato (`WEEKDAY_VALUES`, già esistente) × 6 ore (`hour_slot` 1-6, vincolo applicativo via zod come già fatto per `year` 1-5, non a livello DB). Non tutte le celle vanno per forza riempite: una classe può avere meno di 36 ore totali tra le sue cattedre (es. alcune prime fanno 4 ore su una materia, altre 5 o 6) - celle vuote sono uno stato normale, non un errore.
- **Integrità a livello DB, non solo applicativo** - lezione imparata dal bug delle classi duplicate: `schedule_entry` guadagna `teacher_id`/`school_class_id` denormalizzati (letti dall'`assignment` al momento dell'inserimento) più due indici univoci, così "docente doppio" e "classe doppia" sono impossibili anche in caso di bug nel controllo applicativo, non solo scoraggiati da un controllo prima dell'inserimento. Verificato con test Python (inclusi i due casi di conflitto reali) prima di scrivere la migrazione.
- **Cascade su modifica cattedra**: se si cambia docente o classe di una cattedra che ha già ore piazzate in griglia, `updateAssignment` aggiorna anche i campi denormalizzati nei suoi `schedule_entry` esistenti - altrimenti resterebbero disallineati dalla cattedra che li ha generati.
- **Drag & drop nativo (HTML5 Drag and Drop API), niente libreria nuova** - il WebView di Tauri su Windows è WebView2 (Chromium), che non ha i classici problemi di compatibilità cross-browser del drag&drop nativo (il motivo per cui di solito si sceglie una libreria). Si riconsidera una libreria dedicata (es. `vue-draggable-plus`) solo se l'esperienza nativa risulta davvero insoddisfacente una volta provata, non in anticipo.
- **Interattività**: mentre si trascina una cattedra, le celle mostrano subito uno stato visivo (libera / bloccata perché il docente è già occupato altrove in quello slot / bloccata perché la classe è già occupata / giorno libero del docente - avviso, non blocco) calcolato lato client prima ancora del tentativo di inserimento, non solo dopo un errore dal DB. Click su una cattedra già piazzata per rimuoverla (non solo drag fuori dalla griglia).
- **Monte ore in vista**: ogni cattedra nella lista laterale mostra "X/Y ore assegnate", aggiornato in tempo reale via un conteggio delle `schedule_entry` esistenti per quella cattedra.

- [x] Migrazione v7 in `src-tauri/src/lib.rs`: `schedule_entry` guadagna `teacher_id`/`school_class_id` (NOT NULL, backfill non necessario: tabella mai popolata finora), `CREATE UNIQUE INDEX ... ON schedule_entry(day, hour_slot, teacher_id)` e `... (day, hour_slot, school_class_id)` - verificato con test Python prima di scriverla (inclusi i due casi di conflitto reali)
- [x] `app/utils/hourSlots.ts` - costante `HOUR_SLOT_VALUES` (1-6), stesso pattern di `weekdays.ts`
- [x] `app/composables/schedule/useSchedule.ts` (nuovo - nome già previsto nella tabella "I nomi" di CLAUDE.md): `fetchEntries()` (tutte le entry con nome docente, non filtrate per classe - il filtro per classe è fatto client-side dove serve, dato che i controlli su docente doppio devono comunque vedere tutte le classi), `placeEntry(assignment, day, hourSlot)`, `removeEntry(entryId)`, `hoursAssigned(assignmentId)`
- [x] `app/composables/schedule/useScheduleConflicts.ts` (nuovo, più semplice del previsto): solo `isDayOff(teacherId, day)` e `hasTeacherConflict(teacherId, day, hourSlot)` - "classe doppia" non serve un controllo a parte, coincide con "la cella è già occupata" che la griglia vede già da sola dai propri dati
- [x] `app/composables/schedule/useScheduleDrag.ts` (nuovo, non previsto nel piano iniziale) - stato condiviso (`useState`) della cattedra attualmente trascinata, letto sia dalla griglia (per evidenziare le celle) sia dalla sidebar (per impostarlo su dragstart/dragend)
- [x] `useAssignments.ts` - `updateAssignment` aggiorna anche `schedule_entry.teacher_id`/`school_class_id` per le entry esistenti di quella cattedra; se il nuovo docente/classe andrebbe in conflitto con ore già piazzate altrove, il vincolo `UNIQUE` blocca l'update e mostra un errore dedicato (`assignments.scheduleConflictTitle`/`scheduleConflictDescription`) invece del messaggio SQL grezzo - stesso pattern del fix delle classi duplicate, `updateAssignment` ora ritorna `boolean`
- [x] `app/pages/schedule/index.vue` - selezione classe (`USelect` da `useSchoolClasses()`) + griglia, pulsante indietro verso `/` (è una voce di primo livello nel menu, non dentro Anagrafica)
- [x] `app/components/schedule/schedule-grid/` - griglia 6×6, celle come drop target native HTML5 (`@dragover`/`@drop`, `preventDefault()` chiamato solo sulle celle valide - una cella bloccata semplicemente non accetta il drop, niente toast d'errore per docente/classe doppio: il colore della cella durante il trascinamento è già il segnale), cattedra piazzata mostrata come chip col nome del docente e un pulsante di rimozione (con conferma via `useConfirmDialog`, stesso pattern delle altre eliminazioni)
- [x] `app/components/schedule/schedule-sidebar/` - lista delle cattedre della classe selezionata, ognuna trascinabile (`draggable="true"`, `@dragstart`/`@dragend`), indicatore "X/Y ore" con badge "Completa"/"Sovra-assegnata" (mai bloccata: il monte ore è una segnalazione, non un vincolo, coerente con CLAUDE.md)
- [x] Chiavi i18n: `schedule.*` (titolo pagina, selezione classe, nessuna cattedra, ore assegnate, avviso giorno libero, rimuovi), `assignments.scheduleConflictTitle`/`scheduleConflictDescription`
- [x] Abilitata la voce "Tabella orario" - tolto `disabled`/badge da `app/layouts/default.vue` e dalla card in `app/pages/index.vue`, puntano a `/schedule`
- [x] Aggiornato CLAUDE.md (riga `schedule_entry` nel modello dati, le 4 regole di validazione con nota su dove/come sono implementate, nuovo paragrafo sulla griglia)
- [ ] Verifica: `npm run tauri dev` - trascinare una cattedra in una cella la piazza, trascinarne una il cui docente è già occupato in quello slot (su un'altra classe) non permette il drop, stesso per una cella già occupata dalla stessa classe, il giorno libero del docente evidenzia la cella ma permette comunque il piazzamento (con avviso dopo), rimuovere una cattedra piazzata funziona, il conteggio ore si aggiorna in tempo reale, modificare il docente/classe di una cattedra già piazzata aggiorna correttamente i vincoli o blocca l'operazione se andrebbe in conflitto

**Bug trovati alla prima prova, corretti:**
- Cambiare classe non aggiornava la griglia: `useScheduleGrid(props.schoolClassId)`/`useScheduleSidebar(props.schoolClassId)` prendevano il valore della prop una tantum alla creazione del componente (un numero semplice, non reattivo) - dato che la griglia resta montata e cambia solo la prop, il filtro restava congelato sulla prima classe scelta. Corretto passando `toRef(() => props.schoolClassId)` (getter-based, Vue 3.3+) invece del valore grezzo, e i due composable ora accettano `Ref<number>`, leggendo `.value` dentro i `computed`.
- Il drag & drop non partiva: mancava `event.dataTransfer.setData(...)` nel gestore di `dragstart` - senza impostare dei dati sul `dataTransfer`, Chromium (quindi anche il WebView2 di Tauri) spesso non completa l'operazione di drag verso altri elementi. Aggiunto `setData`/`effectAllowed` in `onDragStart` (sidebar) e `dropEffect` in `onDragOver` (griglia) per un cursore coerente durante il trascinamento.
- Valutata la domanda se convenisse una libreria di drag&drop invece di continuare col nativo: no - il problema era codice incompleto, non un limite del nativo, e le nostre celle richiedono comunque una validazione per-cella con regole di business (docente doppio, giorno libero) che il nativo gestisce bene con controllo diretto; una libreria di liste ordinabili (es. SortableJS) è pensata per riordinare, non è il fit naturale qui.

**Causa reale del drag & drop che non partiva affatto** (cursore "vietato" immediato, nessuna animazione, anche dopo i due fix sopra): non era JS - è `tauri.conf.json`. Tauri intercetta a livello di finestra il drag & drop nativo per la propria funzionalità di file-drop, e `dragDropEnabled` è `true` di default; lo schema di configurazione lo dice esplicitamente: *"Disabling it is required to use HTML5 drag and drop on the frontend on Windows."* Aggiunto `"dragDropEnabled": false` alla finestra in `src-tauri/tauri.conf.json`. Nessuna funzionalità persa: l'app non usa il drop di file da Explorer da nessuna parte. Richiede un riavvio completo di `tauri dev` (file letto in fase di build, non un hot-reload Nuxt).

**Il drag partiva ma non si posizionava sulla cella** (dopo il fix sopra): due cause aggiuntive tipiche del drag&drop HTML5 nativo. Prima: mancava `preventDefault()` anche su `dragenter`, non solo su `dragover` - alcuni motori richiedono entrambi per registrare una cella come drop target valido, non basta l'uno o l'altro. Seconda: i gestori erano sul `<td>` della tabella - le celle di tabella hanno un comportamento noto per essere poco affidabile come target di drag&drop nativo in diversi motori (problemi di hit-testing interni al layout della tabella). Spostati i gestori (`dragenter`/`dragover`/`drop`) su un `<div>` interno che riempie la cella invece che sul `<td>` stesso, aggiunto `onDragEnter` in `useScheduleGrid.ts` con la stessa logica di `onDragOver`.

**Il drop non piazzava ancora nulla dopo tutti i fix sopra** (ma l'evidenziazione delle celle durante il trascinamento era corretta, segno che il drag stesso ormai funzionava): bug di ordine in `onDrop` - `draggedAssignment.value` veniva azzerato *prima* di chiamare `cellStatus(day, hourSlot)`, che però legge proprio `draggedAssignment.value` per calcolare lo stato. Il controllo vedeva quindi sempre `'empty'` (nessun trascinamento in corso, perché l'avevo appena cancellato) e usciva subito senza mai chiamare `placeEntry`. Corretto invertendo l'ordine: calcolare `status` mentre `draggedAssignment.value` è ancora valorizzato, azzerarlo solo dopo.

- [x] Rimossa la conferma su `handleRemove` in `useScheduleGrid.ts` - rimuovere un'ora dalla griglia è un'azione leggera e reversibile con un altro trascinamento, diversa da eliminare un record intero: la conferma qui è solo attrito quando si fanno molti drag/rimozioni di fila.

## Tabella orario: blocchi multi-ora (click & pull per estendere/restringere)

Oggi ogni `schedule_entry` occupa esattamente un'ora. L'utente vuole poter trascinare il bordo inferiore di una cattedra già piazzata per farla durare 2 o più ore consecutive nello stesso giorno, sia allungandola che accorciandola.

Decisioni:
- **Nessuna modifica allo schema**: un blocco di N ore resta N righe `schedule_entry` (stesso `assignment_id`+`day`, `hour_slot` consecutivi) - non un unico record con "ora inizio/fine". Cambiare lo schema per rappresentare un intervallo romperebbe i vincoli `UNIQUE` appena costruiti (che si basano su uguaglianza esatta `day`+`hour_slot`, non su sovrapposizione di intervalli) senza un beneficio reale: l'unica cosa che cambia è *come si costruisce visivamente* un blocco, non cosa significa nel dominio.
- **Rendering: `rowspan` nativo di HTML**, non un riscrittura della griglia a CSS grid. Si raggruppano le entry consecutive (stesso giorno+cattedra, `hour_slot` di fila) in "blocchi" a livello di computed; la prima ora del blocco diventa un `<td rowspan="N">` col contenuto, le ore successive del blocco vengono semplicemente *saltate* nel `v-for` di quella riga (la tabella HTML gestisce da sola lo spostamento di colonna quando una cella viene omessa - è esattamente il meccanismo per cui `rowspan` esiste, non serve altro).
- **Interazione di resize: matematica su delta pixel, non hit-testing del DOM**. Un maniglia in fondo al blocco, `mousedown` registra la posizione Y iniziale e la durata attuale; `mousemove` calcola quante righe in più/meno in base allo spostamento verticale diviso per l'altezza fissa di una riga (`h-16` = 64px, già usata nella griglia); `mouseup` applica la modifica. Niente `elementFromPoint`/attributi `data-*` per capire "su che ora sono": con righe di altezza fissa la matematica basta ed è più robusta dei problemi di hit-testing che una cella con `rowspan` introdurrebbe.
- **Il vincolo di conflitto resta lo stesso**: mentre si allunga, ogni nuova ora si allunga solo se libera (non occupata da un'altra cattedra della stessa classe, non già presa dallo stesso docente altrove) - l'estensione si ferma (clamp) alla prima ora bloccata invece di annullare tutto il gesto, per un'esperienza più permissiva.
- **La "x" di rimozione sul blocco elimina tutte le sue ore in un colpo solo**, non una singola ora - con il resize disponibile per accorciare, non serve più un modo per togliere "solo un'ora" cliccando: o si accorcia (resize) o si toglie tutto (x).

- [x] `useSchedule.ts` - `placeEntries(assignment, day, hourSlots[])` (batch insert, stesso pattern di `addSchoolClasses`/`addAssignments`: loop + singolo refetch alla fine), `removeEntries(entryIds[])` (batch delete), `removeBlock(day, assignmentId)` (cancella tutte le entry di quel blocco); estratto `insertEntry` privato condiviso tra `placeEntry`/`placeEntries`
- [x] `useScheduleGrid.ts` - `blocksForDay(day)` raggruppa le `classEntries` consecutive per `assignment_id` in blocchi `{ day, assignmentId, startHour, span, entryIds, teacherFirstName, teacherLastName }`; `blockAt(day, hourSlot)` per sapere se/quale blocco copre una cella; `rows` ora usa `flatMap` per omettere del tutto le celle coperte da un blocco iniziato prima invece di renderle vuote
- [x] Interazione di resize in `useScheduleGrid.ts`: `onResizeStart(event, block)` registra `clientY` e la durata iniziale, aggiunge listener su `window` per `mousemove`/`mouseup`; `onResizeMove` calcola la nuova durata proposta (clampata tra 1 e `maxSpanFrom` - le ore consecutive libere disponibili, che si ferma alla prima ora già occupata da un altro blocco o da un conflitto docente) e la espone come stato reattivo (`resizing.value.previewSpan`) letto da `blocksForDay` per l'anteprima visiva; `onResizeEnd` applica la differenza (`placeEntries` se si allunga, `removeEntries` se si accorcia) e rimuove i listener; `onUnmounted` li rimuove comunque per sicurezza
- [x] `ScheduleGrid.vue` - il `<td>` del blocco usa `:rowspan="cell.block?.span ?? 1"`; maniglia di resize in fondo al blocco (`cursor-row-resize`, visibile al hover del blocco via `group-hover`) collegata a `onResizeStart`
- [x] `handleRemove` diventa `handleRemoveBlock(day, assignmentId)` - rimuove tutte le ore del blocco invece di una singola entry
- [ ] Verifica: `npm run tauri dev` - piazzare una cattedra, trascinare la maniglia in basso per estenderla a più ore, verificare che si fermi se incontra un'ora già occupata (da un docente doppio o dalla stessa classe), trascinare verso l'alto per accorciarla, la "x" rimuove l'intero blocco, il conteggio ore nella sidebar riflette correttamente le ore totali del blocco

**Due bug trovati alla prova: il merge in blocco non avveniva, la maniglia di resize non compariva mai.**

Causa del mancato merge: `hour_slot` tornava dal DB come stringa nonostante la colonna sia dichiarata `INTEGER` (stesso genere di sorpresa già vista con `year`, che infatti richiede lo stesso trattamento). `blocksForDay` confrontava `entry.hour_slot === current.startHour + current.span` con uguaglianza stretta: se `startHour` è la stringa `"2"`, `"2" + 1` in JavaScript fa concatenazione (`"21"`), non addizione (`3`) - quindi il confronto falliva sempre, silenziosamente. Il controllo "cella occupata" (`blockAt`, che usa `>=`/`<`) sembrava funzionare perché quegli operatori *coercono* i tipi automaticamente, mascherando il problema. Corretto con `CAST(schedule_entry.hour_slot AS INTEGER) AS hour_slot` nella SELECT di `useSchedule.ts`, stesso trattamento già applicato a `year` in `useSchoolClasses.ts`/`useAssignments.ts`. **Effetto collaterale scoperto per inerzia**: `hasTeacherConflict` in `useScheduleConflicts.ts` usa anch'essa `===` su `hour_slot` - probabilmente il blocco "docente doppio" durante il trascinamento non funzionava bene neanche lui prima di questo fix, anche se non era stato ancora notato esplicitamente.

Causa plausibile per la maniglia invisibile: `h-full` (altezza percentuale) dentro un `<td>` di tabella - le altezze percentuali nei figli di celle di tabella sono un caso classico di risoluzione inaffidabile tra browser/motori. Sostituito con un'altezza esplicita in pixel (`(cell.block?.span ?? 1) * rowHeightPx`, con `ROW_HEIGHT_PX` ora esportato da `useScheduleGrid.ts` invece di duplicato via commento "deve restare in sync") sul contenitore diretto del `<td>`; il div della cattedra dentro può tenere `h-full` perché ora il suo genitore ha un'altezza esplicita in pixel, dove le percentuali si risolvono in modo normale.

Sostituito anche `.toSorted()` con `[...array].sort()` in `blocksForDay` per compatibilità più ampia (difesa preventiva, non confermato come causa).

**Animazione su drag&pull e drag&drop** (richiesta: transizione di mezzo secondo, niente scatti): `rowspan` è un attributo discreto - non è di per sé animabile, il cambio di layout della tabella è istantaneo. Aggirato con una transizione CSS sull'altezza esplicita già in pixel del contenitore diretto del `<td>` (`transition-[height] duration-500 ease-out`, la stessa altezza usata per il fix della maniglia sopra) - copre sia l'anteprima durante il resize sia il cambio di span dopo un drop; più un `<Transition>` di Vue (classi via prop, non un blocco `<style>` - coerente con l'uso di sole classi Tailwind nel progetto) per un'apparizione/scomparsa in dissolvenza+scala quando un blocco viene piazzato o rimosso. Deliberatamente non animato il colore di sfondo della cella durante il trascinamento (libera/bloccata/avviso): un feedback istantaneo lì è più utile di uno in ritardo mentre si decide dove rilasciare.

**Bug trovato dopo l'animazione: il riquadro non prendeva la dimensione corretta della tabella per i blocchi multi-ora.** Causa: doppia fonte di altezza sulla stessa cella. Il `<td>` portava sia la classe `h-16` (64px) sia `p-1` (padding) *oltre* all'altezza esplicita in pixel già impostata sul div interno (`span * ROW_HEIGHT_PX`) - con `box-sizing: border-box` (reset di Tailwind) il padding del `<td>` si sommava sopra ai 64px dichiarati sul div, quindi ogni riga finiva per essere leggermente più alta di `ROW_HEIGHT_PX` nella realtà. Per un blocco di una sola ora la differenza è impercettibile; su più ore lo scarto si accumula (es. 3 righe reali più alte di qualche pixel ciascuna) e il riquadro, dimensionato sui 64px "puri", resta visibilmente più corto delle righe che dovrebbe coprire. Corretto togliendo `h-16`/`p-1` dal `<td>` (che ora non dichiara nessuna propria altezza, si limita a "ospitare" il contenuto) e spostando il padding visivo (`p-1`) sul div interno, che resta l'unica fonte di verità sull'altezza della cella.

**Bug trovato dopo il fix sopra: durante il pull cambiava altezza anche la riga della tabella, non solo il riquadro del blocco.** Causa: `blocksForDay` continuava a iniettare `resizing.value.previewSpan` nel blocco "vero" restituito a `rows`, quindi il `rowspan` del `<td>` (un attributo discreto, non animabile) cambiava a ogni tick di `mousemove` - la transizione CSS ammorbidiva solo il div interno, non il reflow istantaneo della tabella sotto, da cui lo scatto visibile a ogni movimento.

Corretto disaccoppiando l'anteprima dalla struttura reale della tabella: `blocksForDay` ora ritorna solo i blocchi committati (le `schedule_entry` realmente salvate), il `rowspan` del `<td>` non cambia più durante il trascinamento. Il blocco in fase di resize (`isResizingBlock`, nuovo helper) nasconde il chip normale e mostra al suo posto un overlay in `position: absolute` (stesso contenitore `position: relative`), la cui altezza segue `resizing.previewSpan` **senza transizione** - deve seguire il cursore 1:1, non in ritardo - e si estende visivamente oltre i confini del `<td>` sopra le righe sottostanti (le celle di tabella non tagliano di default il contenuto che sconfina). Al rilascio l'overlay sparisce, `placeEntries`/`removeEntries` scrivono le nuove ore, e solo allora il blocco reale (con la sua transizione da 500ms già esistente) si assesta sulla nuova dimensione - un solo reflow della tabella, atteso, invece che uno per ogni pixel trascinato.

## Tabella orario: griglia a larghezza piena, blocchi come overlay, sidebar sopra

Richiesta: tabella al 100% di larghezza, i riquadri "sopra" la tabella, nomi abbreviati. Generalizzata la tecnica dell'overlay già validata per l'anteprima di resize a **tutti** i blocchi piazzati, non solo quello in resize - risolve anche i due bug precedenti alla radice invece di tamponarli, e rende banale la larghezza 100%.

- **Tabella**: torna a essere solo la griglia di sfondo - nessun `rowspan` mai, ogni `<td>` è sempre una singola ora. `table-fixed` + `<colgroup>` (colonna ore a `HOUR_COL_PX` fisso, le 6 colonne giorno si dividono lo spazio restante in automatico, algoritmo standard di `table-layout: fixed`) sostituisce le larghezze fisse (`w-32`) di prima - le colonne ora si allargano/stringono con la finestra.
- **Blocchi**: un livello separato (`TransitionGroup`, `position: absolute` dentro un contenitore `position: relative` che avvolge la tabella) sopra la griglia, uno per ogni blocco committato (`allBlocks`, nuovo computed che appiattisce `blocksForDay` su tutti i giorni). Posizione e dimensione calcolate in `useScheduleGrid.ts` (`blockStyle`) con sole costanti in pixel già esistenti/condivise (`ROW_HEIGHT_PX`, `HOUR_COL_PX`, nuova `HEADER_HEIGHT_PX` per l'altezza dell'intestazione) - stessa fonte unica di verità usata per dimensionare le celle sotto, quindi restano sempre allineati senza bisogno di misurare il DOM a runtime.
- **Risultato collaterale**: elimina per sempre sia il bug della doppia fonte di altezza sia il bug del reflow discreto di `rowspan` durante il resize, perché adesso *nessun* blocco vive più dentro un `<td>` con `rowspan` - la tabella non cambia mai struttura, cambia solo la posizione/altezza di un elemento assoluto sopra di essa. Il resize riusa esattamente lo stesso meccanismo (nessuna transizione mentre si trascina, così segue il cursore; transizione riattivata a rilascio per l'assestamento).
- **Nomi abbreviati** ("Cognome N."): nuovo `app/utils/teacherDisplay.ts` (`formatTeacherShortName`, pure, condiviso) - usato sia nei riquadri della griglia sia nelle card trascinabili della sidebar, invece di duplicare la stessa concatenazione in due punti. Aggiornato in seguito per i nomi composti ("Anna Maria" → "A.M." invece di solo "A."): `firstName` viene diviso sugli spazi, un'iniziale per parola.
- **Sidebar sopra la griglia**: le card trascinabili (quelle da cui si trascina una cattedra, non i blocchi già piazzati) erano quello a cui l'utente si riferiva con "riquadrini sopra la tabella" - non i blocchi in griglia (equivoco chiarito in corsa). `ScheduleSidebar.vue` da elenco verticale (`space-y-2`, card larghe) a fila orizzontale con wrap (`flex flex-wrap gap-2`, card compatte); `pages/schedule/index.vue` da griglia a due colonne (`grid-cols-[1fr_300px]`, sidebar di fianco) a colonna singola (`space-y-4`, sidebar sopra, griglia sotto) - coerente con la tabella ora a piena larghezza, che altrimenti non avrebbe lasciato spazio a una sidebar laterale.
- [x] `useScheduleGrid.ts` - `blocksForDay` senza più il merge dell'anteprima di resize; nuovo `allBlocks`; `rows` semplificato (nessuna cella più "saltata", la tabella è sempre una griglia uniforme); `blockStyle`/`shortName`/`isResizingBlock` esportati; nuove costanti `HOUR_COL_PX`/`HEADER_HEIGHT_PX` accanto a `ROW_HEIGHT_PX`
- [x] `ScheduleGrid.vue` - tabella senza `rowspan`, `<colgroup>` per le larghezze, blocchi renderizzati come `TransitionGroup` di elementi assoluti invece che dentro le celle
- [x] `app/utils/teacherDisplay.ts` (nuovo) - `formatTeacherShortName(lastName, firstName)`
- [x] `ScheduleSidebar.vue`/`pages/schedule/index.vue` - layout a colonna singola, sidebar sopra, card orizzontali compatte con nome abbreviato
- [ ] Verifica: `npm run tauri dev` - la tabella occupa tutta la larghezza disponibile, i blocchi piazzati restano allineati alle celle (anche ridimensionando la finestra), il drag&drop e il resize funzionano come prima, le card sopra la tabella mostrano "Cognome N." e vanno a capo se non c'entrano in una riga

## Tabella orario: spostare un blocco già piazzato (drag&drop dalla griglia, anche tra giorni diversi)

Finora un blocco già in griglia si poteva solo ridimensionare (maniglia in basso) o rimuovere (x) - non spostare. Richiesta: poter trascinare il riquadro stesso su una nuova posizione, stessa durata, anche su un giorno diverso.

Decisioni:
- Il blocco diventa esso stesso `draggable="true"` (stesso drag&drop nativo già usato per le card della sidebar) - si afferra dal corpo del blocco; la maniglia di resize (in basso, ha già `preventDefault()` sul proprio `mousedown`, che per specifica HTML sopprime l'avvio del drag nativo sull'antenato) e il pulsante "x" (un click non genera movimento, quindi mai un `dragstart`) restano interazioni separate senza conflitti.
- Nuovo stato condiviso `draggedBlockSource` in `useScheduleDrag.ts`, accanto al `draggedAssignment` già esistente - i due casi (cattedra nuova dalla sidebar vs blocco già in griglia) restano distinti, la logica di validazione/drop si dirama sull'uno o sull'altro invece di forzarli nella stessa forma. Contiene tutto il necessario per l'operazione senza dover rifare query (`day`, `assignmentId`, `teacherId`, `startHour`, `span`, `entryIds`, nome).
- **Validazione sull'intera durata**, non sulla singola ora sotto il cursore: nuovo `canPlaceSpan(day, startHour, span, teacherId, excludeEntryIds)` in `useScheduleGrid.ts`, stessa logica già scritta per `maxSpanFrom` (resize) ma generalizzata a un giorno arbitrario (non necessariamente quello di partenza) e a un controllo booleano invece che a un conteggio incrementale. Le ore che appartengono già al blocco in movimento non contano come occupate (altrimenti si bloccherebbe da solo trascinandosi sopra se stesso).
- `cellStatus` si dirama: se `draggedBlockSource` è valorizzato, ogni cella mostra lo stato risultante da "se lo spostamento partisse da qui" (`canPlaceSpan` sull'intero blocco), non lo stato della singola ora - `onDragEnter`/`onDragOver` restano invariati (chiamano già solo `cellStatus`).
- A rilascio: se il target coincide con la posizione di partenza, nessuna operazione. Altrimenti `removeEntries` delle ore vecchie **prima** di `placeEntries` delle nuove (stesso ordine già usato per il resize - evita conflitti transitori sul vincolo `UNIQUE` se il nuovo intervallo si sovrappone al vecchio, es. spostare di una sola ora sullo stesso giorno).
- `Block` guadagna il campo `teacherId` (già disponibile su `ScheduleEntryWithDetails`, prima non serviva al blocco) - necessario per validare/spostare senza dover cercare l'entry corrispondente altrove.

- [x] `useScheduleDrag.ts` - nuovo `draggedBlockSource` (`useState` condiviso)
- [x] `useScheduleGrid.ts` - `Block.teacherId`; `canPlaceSpan`; `cellStatus` con il ramo per lo spostamento; `onDrop` esteso (ramo spostamento prima del ramo esistente per la cattedra nuova); `onBlockDragStart`/`onBlockDragEnd`
- [x] `ScheduleGrid.vue` - blocco `draggable="true"` con `@dragstart`/`@dragend`, cursore `cursor-grab`/`active:cursor-grabbing`
- [ ] Verifica: `npm run tauri dev` - trascinare un blocco di più ore su un'altra fascia oraria libera dello stesso giorno lo sposta mantenendo la durata; trascinarlo su un altro giorno funziona allo stesso modo; trascinarlo su una posizione che non ha spazio libero per l'intera durata non lo sposta (e la cella si colora di bloccato durante il trascinamento); rilasciarlo sulla propria posizione di partenza non fa nulla; il giorno libero del docente mostra ancora l'avviso dopo lo spostamento; ridimensionare (maniglia) e rimuovere (x) un blocco continuano a funzionare senza avviare per sbaglio uno spostamento

**Aggiunta successiva: proiezione (ghost) di dove atterrerà il blocco durante lo spostamento.** Richiesta: rendere intuitivo dove si andrà a posizionare un blocco multi-ora prima ancora del rilascio, non solo la tinta della singola cella sotto il cursore.

- Estratto `positionStyle(day, startHour, span)` da `blockStyle` (stesso calcolo, ora riusabile anche per un blocco "virtuale" che non esiste ancora nei dati)
- Nuovo stato locale `dragOverTarget` (`{ day, hourSlot } | null`), aggiornato in `onDragEnter` quando uno spostamento è in corso (`draggedBlockSource` valorizzato) - `dragenter` fa scattare l'aggiornamento una volta per cella attraversata, a differenza di `dragover` che spara continuamente anche da fermo
- Nuovo `movePreview` (computed): quando c'è sia un blocco in movimento sia una cella sotto il cursore, calcola posizione/dimensione del riquadro fantasma nella posizione candidata (stessa durata del blocco originale) più `valid` (riusa `canPlaceSpan`, la stessa validazione già usata per il drop) - un solo riquadro tratteggiato, colorato in base alla validità (primary se valido, error se no), sempre `pointer-events-none` per non intercettare gli eventi di drag che devono continuare a raggiungere le celle sottostanti
- Il blocco originale si affievolisce (`opacity-30`, nuovo `isMovingBlock`) mentre è "in volo", per distinguerlo dal fantasma nella posizione candidata
- `dragOverTarget` ripulito sia a `drop` che a `dragend` (quest'ultimo copre anche il caso di trascinamento annullato fuori da qualunque cella valida)
- [x] `useScheduleGrid.ts` - `positionStyle`, `dragOverTarget`, `movePreview`, `isMovingBlock`
- [x] `ScheduleGrid.vue` - riquadro fantasma + blocco sorgente affievolito durante lo spostamento
- [ ] Verifica: `npm run tauri dev` - trascinando un blocco appare un riquadro tratteggiato nella cella sotto il cursore, della stessa durata del blocco, verde/blu se la posizione è libera e rosso se occupata/in conflitto; il blocco originale appare sbiadito mentre lo si trascina; il fantasma sparisce a rilascio o se si annulla il trascinamento

**Bug visivo segnalato con dati reali in griglia: nei blocchi di più ore si vedeva una sottile riga orizzontale a metà.** Causa: i riquadri (sia quello reale sia il fantasma di anteprima) hanno uno sfondo colorato ma semi-trasparente (`bg-primary/10`, coerente con le tinte usate altrove nella griglia) - per un blocco di una sola ora il bordo della tabella sottostante (`border border-default` su ogni `<td>`, mai rimosso da quando i blocchi sono diventati un overlay separato dalla tabella) cade solo ai margini del riquadro e non si nota, ma per un blocco multi-ora il confine tra due righe della tabella cade *dentro* il riquadro e si vede in trasparenza. Corretto aggiungendo uno strato di sfondo opaco (`bg-default`, il colore di sfondo della pagina) **sotto** la tinta colorata in entrambi i riquadri (blocco piazzato e fantasma di anteprima) - stessa tinta finale a vista, ma niente più bordi della tabella visibili in trasparenza.
- [x] `ScheduleGrid.vue` - due layer (`bg-default` poi `bg-primary/10` o `bg-error/20`/`bg-primary/20` per il fantasma) invece di un singolo sfondo traslucido diretto sul contenitore, contenuto racchiuso in un div `relative` sopra i due layer

## Tabella orario: modalità bozza (Salva/Ripristina invece di scrittura immediata)

Oggi ogni azione sulla griglia (drop, spostamento, resize, rimozione) scrive subito su DB e ricarica. Richiesta: le modifiche restano locali ("bozza") finché non si preme Salva; Ripristina scarta la bozza e ricarica l'ultimo stato salvato.

Decisioni (riviste dopo un primo giro di feedback - vedi sotto):
- **Bozza per classe, tenuta in memoria per tutta la permanenza nella sezione Tabella orario** - non per singola visita alla classe. Cambiare classe nel selettore non scarta né obbliga a salvare: si può passare da una classe all'altra facendo tentativi, ognuna mantiene la propria bozza finché non la si salva o scarta esplicitamente, o si esce dalla sezione.
- **Avviso solo uscendo dalla sezione Tabella orario** (verso Anagrafica, Home, Esporta PDF, o chiudendo/navigando altrove) - non cambiando classe all'interno della stessa sezione. Intercettato con la guardia di navigazione di Vue Router (`onBeforeRouteLeave` su `pages/schedule/index.vue`), che copre qualunque punto di uscita (menu in alto, pulsante indietro, ecc.) in un colpo solo invece di doverli presidiare uno per uno. Se ci sono bozze non salvate su una o più classi, mostra lo stesso `useConfirmDialog` già usato per le eliminazioni; conferma → scarta tutte le bozze pendenti e procede; annulla → blocca la navigazione.
- **Salva/Ripristina agiscono sulla classe attualmente aperta** - le altre bozze pendenti restano intatte in background finché non si esce dalla sezione (a quel punto, se non salvate, vengono scartate dall'avviso sopra).
- **Controllo "docente doppio" durante il trascinamento**: confronta con la bozza della classe aperta + l'ultimo stato **salvato** delle altre classi, non le loro bozze non salvate. Compromesso accettato: se si creano bozze in conflitto su due classi diverse senza salvare nessuna delle due, il conflitto emerge solo al Salva (vincolo `UNIQUE` a DB, stesso backstop già in uso) invece che live durante il trascinamento - evita di dover ricalcolare i conflitti su ogni bozza di ogni classe ad ogni digitazione, per un caso limite raro in un'app mono-utente.
- **Salva**: cancella tutte le ore di quella classe sul DB e riscrive quelle della bozza in un colpo solo (stesso pattern cancella-poi-riscrivi già usato per lo spostamento blocchi). Se il vincolo `UNIQUE` scatta, la bozza resta intatta e mostra l'errore invece di perdere le modifiche.
- **Ripristina**: scarta la bozza di quella classe, ricarica l'ultimo stato salvato.
- **Indicatore**: barra sopra la griglia, visibile solo se la classe aperta ha modifiche non salvate, con "Bozza - modifiche non salvate" + pulsanti Salva/Ripristina.
- **Monte ore nella sidebar** (X/Y ore, Completa/Sovra-assegnata) riflette la bozza della classe aperta, non l'ultimo salvataggio.

Non incluso ora: nessun indicatore su quali altre classi hanno bozze pendenti mentre si è su una classe diversa - se serve si aggiunge dopo.

- [x] `useScheduleDraft.ts` (nuovo) - `draftsByClass` (`useState`, `Map<school_class_id, ScheduleEntryWithDetails[]>` - non un `Record`, per evitare `delete` dinamico su chiave computata, vietato da `@typescript-eslint/no-dynamic-delete`; popolata al primo tentativo di modifica su quella classe, non alla sola visualizzazione), `dirtyClassIds` (array di id, non un `Set` - a questa scala un array è più semplice da manipolare immutabilmente per la reattività di `useState`), `effectiveEntries(classId)` (bozza se presente, altrimenti stato salvato), `placeDraftEntry`/`placeDraftEntries`/`removeDraftEntries`/`removeDraftBlock` (mutazioni locali pure e sincrone, id temporanei negativi via contatore decrescente per le righe non ancora salvate), `saveDraft(classId)` (cancella+riscrivi su DB via `useSchedule.replaceClassEntries`, gestisce l'errore da vincolo `UNIQUE` senza perdere la bozza), `revertDraft(classId)`, `discardAllDrafts()`
- [x] `useSchedule.ts` - ridotto al solo livello di scrittura DB effettiva: `placeEntry`/`placeEntries`/`removeEntry`/`removeEntries`/`removeBlock` (scrivevano subito, ora inutilizzati) sostituiti da un unico `replaceClassEntries(classId, entries[])` (cancella tutte le ore della classe, riscrive quelle passate) - chiamato solo da `saveDraft`. `hoursAssigned` rimosso (contava dallo stato salvato, ora serve dalla bozza - spostato inline in `useScheduleSidebar.ts`)
- [x] `useScheduleConflicts.ts` - accetta la sorgente entries da usare come parametro (`conflictCheckEntries`: bozza della classe aperta + stato salvato delle altre) invece di leggere sempre lo stato globale internamente
- [x] `useScheduleGrid.ts` - le mutazioni (`onDrop`, `moveBlockTo`, `onResizeEnd`, `handleRemoveBlock`) chiamano le funzioni di `useScheduleDraft` invece di quelle di `useSchedule` che scrivevano subito su DB - tutte tornate sincrone (niente più `async`/`await`), dato che una mutazione di bozza non fa più alcuna chiamata DB
- [x] `useScheduleSidebar.ts` - il conteggio ore per cattedra legge da `effectiveEntries` (bozza della classe aperta) invece che dallo stato salvato
- [x] `pages/schedule/index.vue` - barra "Bozza - modifiche non salvate" con Salva/Ripristina (visibile solo se la classe aperta è "dirty"), `onBeforeRouteLeave` con `useConfirmDialog` se ci sono bozze non salvate su una o più classi - conferma scarta tutto e naviga, annulla blocca la navigazione
- [ ] Verifica: `npm run tauri dev` - modificare una classe la mette in bozza (barra visibile), cambiare classe e tornare indietro mantiene la bozza intatta, Salva scrive su DB e la barra sparisce, Ripristina riporta all'ultimo salvataggio, uscire dalla sezione con bozze pendenti mostra l'avviso e annullando resta sulla pagina, confermando scarta tutto e naviga

## Cattedre: raggruppate per docente (righe espandibili)

La tabella Cattedre ripeteva lo stesso docente su una riga per classe - ridondante quando un docente ha più classi. Richiesta: una riga per docente (nome + monte ore totale a vista), espandibile nel dettaglio per-classe. Stesso ragionamento rimandato per Classi (più da definire come risolverlo lì).

Base tecnica: `UTable` (Nuxt UI, costruito su TanStack Table v8) supporta righe espandibili nativamente - `v-model:expanded` + colonna con pulsante che chiama `row.toggleExpanded()` + slot `#expanded` per il contenuto - nessuna libreria nuova.

- [x] `useAssignmentTable.ts` - `filteredAssignments` (invariato, stessi 3 filtri di sempre) raggruppato per `teacher_id` in `teacherGroups` (`{ teacherId, teacherName, classCount, totalHours, assignments[] }`, ordinato per nome) - i filtri restano sulla lista piatta prima del raggruppamento: un docente sparisce dalla tabella se nessuna sua cattedra passa il filtro, le classi escluse restano nascoste anche nel dettaglio espanso
- [x] Colonne tabella esterna: `expand` (pulsante freccia), Docente, N. classi, Ore totali - modifica/elimina non hanno più senso a livello di riga-docente, si spostano nel dettaglio
- [x] `AssignmentTable.vue` - slot `#expanded` con l'elenco delle classi del docente (classe, ore, modifica/elimina - le stesse azioni di sempre, ora per singola cattedra dentro il dettaglio invece che per riga)
- [x] Fix a11y in corsa: il nome del docente cliccabile per espandere era uno `<span @click>` - `vuejs-accessibility/no-static-element-interactions` e `click-events-have-key-events` lo bloccavano giustamente (un elemento non interattivo con un handler click non è azionabile da tastiera). A differenza dell'eccezione già concessa al drag&drop della griglia orario (nessun equivalente da tastiera possibile senza una feature a sé), qui un equivalente accessibile banale esiste - sostituito con un `<button type="button">` vero (nativamente focusabile e azionabile da tastiera), stile resettato via classi invece di disattivare la regola
- [ ] Verifica: `npm run tauri dev` - la tabella Cattedre mostra una riga per docente con ore totali corrette, espandere mostra le classi con le ore giuste, modifica/elimina dentro il dettaglio funzionano come prima, i filtri (docente/classe/ore) continuano a funzionare

## Classi: raggruppate per sezione (stesso pattern di Cattedre)

Stessa ridondanza di Cattedre, applicata a Classi: la sezione si ripeteva su una riga per anno. Variante rispetto a Cattedre: il corso di studio di norma è lo stesso per tutte le annualità di una sezione (1A, 2A, 3A Scientifico) - va mostrato una volta sola a livello di sezione, non ripetuto per riga nel dettaglio.

- [x] `useSchoolClassTable.ts` - `filteredSchoolClasses` (invariato) raggruppato per `section_id` in `sectionGroups` (`{ sectionId, sectionName, studyTrackLabel, studyTrackUniform, classCount, classes[] }`, ordinato per nome sezione, classi interne ordinate per anno)
- [x] **Corso di studio non sempre uniforme**: raggruppare per sola sezione (non sezione+corso) permette a una sezione di avere classi con corsi diversi tra le annualità - un caso limite ma possibile (nessun vincolo DB lo impedisce, `study_track_id` è per singola classe). Calcolato `studyTrackUniform` (tutte le classi della sezione condividono lo stesso `study_track_id`): se sì, il corso si mostra una sola volta nella colonna della sezione e si omette dal dettaglio; se no (sezione con corsi misti), la colonna di sezione mostra "Corsi diversi" e il corso torna a comparire per singola classe nel dettaglio - non si nasconde l'eccezione, si evita solo la ripetizione nel caso comune
- [x] Sezioni senza `section_id` (dati legacy, nullable a livello SQL - vedi nota migrazione v4 in CLAUDE.md) raggruppate sotto "Senza sezione" invece di sparire o rompere il raggruppamento
- [x] Colonne tabella esterna: `expand`, Sezione, Corso di studio (o "Corsi diversi"), N. classi - stesso trattamento di Cattedre, modifica/elimina si spostano nel dettaglio
- [x] `SchoolClassTable.vue` - stesso pattern di `AssignmentTable.vue` (pulsante freccia + nome sezione cliccabile via `<button>` vero, non uno `span` - stessa lezione di a11y già presa con Cattedre)
- [ ] Verifica: `npm run tauri dev` - la tabella Classi mostra una riga per sezione con corso di studio e conteggio corretti, espandere mostra le annualità; se si crea appositamente una sezione con corsi diversi tra le classi, la colonna mostra "Corsi diversi" e il dettaglio torna a mostrare il corso per singola classe; modifica/elimina dentro il dettaglio funzionano come prima, i filtri continuano a funzionare

## Tutte le tabelle: header ordinabili (crescente/decrescente)

Richiesta estesa a tutte e 5 le tabelle dell'Anagrafica (Docenti, Sezioni, Corsi di studio, Classi, Cattedre), non solo le due appena raggruppate. `UTable` (TanStack Table) supporta l'ordinamento nativamente - `v-model:sorting` sul componente, `enableSorting: true` per colonna, più uno slot `#<column>-header` (stessa famiglia di `#<column>-cell` già usata per le celle custom) per personalizzare l'header invece di usare funzioni di render `h()` come fanno gli esempi ufficiali - il progetto non ha mai usato `h()`/`resolveComponent` da nessuna parte, restare su template+slot è coerente con la convenzione esistente.

- [x] `app/components/sortable-header/SortableHeader.vue` (nuovo, condiviso, non legato a un'entità - stessa famiglia di `clearable-input/`/`confirm-dialog/`): componente generico (`<script setup generic="TData">`) che riceve `column: Column<TData, unknown>` e `label: string`, mostra un `UButton` con icona che riflette lo stato di ordinamento (neutra/crescente/decrescente) e lo cambia al click (`column.toggleSorting(...)`) - generico invece di tipizzato `Column<any, unknown>` per non violare `@typescript-eslint/no-explicit-any` (regola adottata in questa stessa sessione) e restare type-safe su ogni tabella che lo usa
- [x] Le due colonne "nome cliccabile per espandere" (Sezione in Classi, Docente in Cattedre) erano definite con solo `id` (nessun `accessorKey`) - TanStack non ha un modo per leggere/ordinare un valore da una colonna priva di accessor. Passate ad `accessorKey: 'sectionName'`/`'teacherName'` (il campo esiste già sull'oggetto raggruppato) mantenendo il rendering custom via `#sectionName-cell`/`#teacherName-cell` - accessor e rendering sono due cose distinte, non serve scegliere tra i due
- [x] Applicato a tutte e 5: Docenti (Nome, Cognome), Sezioni (Nome), Corsi di studio (Nome), Classi (Sezione, Corso di studio, N. classi), Cattedre (Docente, N. classi, Ore totali) - non ordinabili: "Giorno libero" (Docenti, è un array), le colonne `expand`/`actions`
- [ ] Verifica: `npm run tauri dev` - cliccare l'header di ogni colonna ordinabile, in ognuna delle 5 tabelle, alterna crescente/decrescente/nessun ordinamento con l'icona coerente; l'espansione (Classi/Cattedre) e i filtri continuano a funzionare insieme all'ordinamento

## Tabella orario: menu contestuale (tasto destro) su docente, con ritorno alla schermata di partenza

Richiesta: il flusso Anagrafica→Docenti→cerca→modifica→torna indietro è troppo lungo quando ci si accorge di un errore (nome, ore) mentre si costruisce l'orario. Tasto destro sul riquadro del docente (sia sopra la tabella che già piazzato in griglia) apre un menu con le azioni utili, "Modifica anagrafica" porta al form e al salvataggio torna esattamente dove si era.

Decisioni:
- **Menu contestuale nativo disattivato in tutta la finestra**: nuovo `app/plugins/disable-context-menu.client.ts`, un solo `document.addEventListener('contextmenu', preventDefault)` - coesiste senza conflitti con `UContextMenu` (Nuxt UI/Reka UI), che gestisce la propria apertura in modo indipendente e chiama comunque il proprio `preventDefault`. Quello che si vedeva col tasto destro non è il menu di Windows ma quello nativo del motore Chromium/WebView2 su cui gira Tauri - l'intercettazione resta scoperta solo dentro la finestra dell'app, il resto del sistema non è toccato.
- **Voci diverse a seconda di dove si fa tasto destro**, perché "rimuovi" significa cose diverse nei due contesti:
  - Card sopra la tabella (cattedra non ancora del tutto piazzata): **Modifica anagrafica** + **Elimina cattedra** (stessa azione/conferma già esistente in Cattedre - se ha ancora ore in griglia il vincolo DB blocca l'eliminazione con lo stesso messaggio generico di sempre, niente di nuovo da gestire)
  - Blocco già piazzato in griglia: **Modifica anagrafica** + **Rimuovi dalla griglia** (stessa azione della "x" già esistente, solo questa collocazione)
- **Si torna dove si era**: nuovo `app/utils/returnTo.ts` (`resolveReturnTo(value, fallback)`, pura, valida che il valore sia un path interno che comincia per `/` - non un URL esterno) - il link "Modifica anagrafica" porta `?returnTo=<path attuale>` in query string; il form Docente (`useTeacherForm.ts`) lo legge e lo usa al posto del path fisso `/teachers` sia dopo il salvataggio sia su Annulla; stessa cosa per la freccia "indietro" in `teachers/[id]/edit.vue`. Nessun'altra entità collegata per ora (solo Docenti è raggiungibile da qui) - il meccanismo resta comunque generico se serve altrove.
- **La classe selezionata nella Tabella orario ora vive anche nell'URL** (`?classId=`), non solo in uno stato locale del componente - altrimenti "tornare alla Tabella orario" riporterebbe a una pagina vuota senza classe scelta, vanificando il senso del ritorno. Letta all'avvio della pagina, scritta via `navigateTo(..., { replace: true })` a ogni cambio (niente voci extra nella cronologia del browser per ogni switch di classe).
- **Bozze non salvate**: nessun lavoro aggiuntivo - cliccare "Modifica anagrafica" naviga fuori da `/schedule`, quindi passa già dalla guardia `onBeforeRouteLeave` esistente (avviso se ci sono bozze pendenti su una o più classi).
- **Scope**: solo le due voci esplicitamente richieste per ciascun contesto - "altro che può servire" si aggiunge quando concretamente richiesto, il menu è già pronto per crescere (basta aggiungere item all'array).

- [x] `app/plugins/disable-context-menu.client.ts` (nuovo)
- [x] `app/utils/returnTo.ts` (nuovo) - `resolveReturnTo`
- [x] `pages/schedule/index.vue` - `selectedClassId` sincronizzato con `?classId=` nell'URL
- [x] `useScheduleSidebar.ts` - `contextMenuItems(assignment)`, `handleDeleteAssignment` (riusa `deleteAssignment` di `useAssignments`); `ScheduleSidebar.vue` - ogni card avvolta in `UContextMenu`
- [x] `useScheduleGrid.ts` - `contextMenuItems(block)` (riusa `handleRemoveBlock` esistente); `ScheduleGrid.vue` - ogni blocco piazzato avvolto in `UContextMenu`
- [x] `useTeacherForm.ts`/`TeacherForm.vue`/`teachers/[id]/edit.vue` - `returnTo` da `route.query.returnTo` (fallback `/teachers`), usato su Salva, Annulla e freccia indietro
- [x] Chiavi i18n: `schedule.editTeacherRegistry`, `schedule.deleteAssignment`
- [ ] Verifica: `npm run tauri dev` - tasto destro in qualunque punto della finestra non mostra più il menu nativo; tasto destro su una card sopra la tabella e su un blocco in griglia mostra il menu corretto per contesto; "Modifica anagrafica" apre il form del docente, salvando (o annullando) si torna alla Tabella orario con la stessa classe ancora selezionata; "Elimina cattedra"/"Rimuovi dalla griglia" funzionano come le azioni equivalenti già esistenti; con una bozza non salvata, cliccare "Modifica anagrafica" mostra l'avviso di uscita come già succede per gli altri punti di uscita dalla sezione

**Aggiunta successiva: "Modifica cattedra" in entrambi i menu.** Stesso trattamento già dato a "Modifica anagrafica" - link a `/assignments/:id/edit` con `?returnTo=<path attuale>`, e lo stesso `resolveReturnTo` esteso anche al form Cattedre (`useAssignmentForm.ts`/`AssignmentForm.vue`/`assignments/[id]/edit.vue`, prima fisso su `/assignments`) così anche modificare ore/docente/classe di una cattedra dalla griglia torna alla Tabella orario invece che alla lista Cattedre. Nessun problema di coerenza con la bozza: `updateAssignment` scrive direttamente su DB (cascata storica su `schedule_entry`, precedente alla modalità bozza) bypassando il livello bozza, ma per arrivare al form si è già passati dalla guardia `onBeforeRouteLeave` che scarta le bozze pendenti - al ritorno la pagina rifà comunque il fetch da zero.
- [x] `useAssignmentForm.ts`/`AssignmentForm.vue`/`assignments/[id]/edit.vue` - stesso `returnTo` del form Docente
- [x] `useScheduleSidebar.ts`/`useScheduleGrid.ts` - terza voce `editAssignment` in `contextMenuItems`
- [x] Chiave i18n: `schedule.editAssignment`

## Classi: monte ore settimanale + conteggio in Tabella orario

Richiesta: ogni classe ha un tetto di ore settimanali totali (monte ore), e la Tabella orario mostra quante ore sono occupate rispetto a quel tetto - non solo il monte ore per singola cattedra (già esistente nella sidebar), un totale a livello di classe.

**Migrazione v8** (banale, nessun test Python preventivo - `ALTER TABLE ADD COLUMN` singola, senza backfill né ricostruzione tabella, a differenza delle migrazioni precedenti su `school_class`): `school_class.weekly_hours INTEGER`, nullable a livello SQL (classi già esistenti restano senza valore finché non le si modifica a mano - stessa scelta già presa per `section_id`/`study_track_id`), obbligatorio a livello applicativo (zod) per le classi nuove o modificate da qui in avanti.

- [x] Migrazione v8 in `src-tauri/src/lib.rs`
- [x] `useSchoolClasses.ts` - `SchoolClass.weekly_hours: number | null`, incluso in select/insert/update
- [x] `schoolClassFormHelper.ts` - `weekly_hours` obbligatorio, intero 1-36 (il tetto della griglia: 6 giorni × 6 ore)
- [x] `SchoolClassForm.vue`/`useSchoolClassForm.ts` (modifica) e `SchoolClassBatchForm.vue`/`useSchoolClassBatchForm.ts` (creazione in massa, con lo stesso "+ Aggiungi classe" che ora porta avanti anche il monte ore dell'ultima riga, non solo sezione/corso) - nuovo campo
- [x] `SchoolClassTable.vue` - il monte ore compare nel dettaglio per singola annualità (accanto al corso di studio quando non è uniforme), non nella riga di sezione: a differenza del corso di studio, il monte ore cambia quasi sempre tra un anno e l'altro della stessa sezione (biennio/triennio), quindi non ha senso provare a mostrarlo "una volta sola"
- [x] `pages/schedule/index.vue` - riga "Ore occupate: X/Y ore" sotto il selettore classe (sempre visibile, non solo con bozza aperta), X = `effectiveEntries(classId).length` (bozza se presente, altrimenti stato salvato - stesso conteggio già usato per il monte ore per cattedra nella sidebar, qui a livello di classe), Y = `weekly_hours` della classe; badge "Completa"/"Sovra-assegnata" riusando le chiavi i18n già esistenti; se `weekly_hours` non è impostato mostra solo il conteggio occupato con una nota, niente rapporto
- [ ] Verifica: `npm run tauri dev` - impostare il monte ore su una classe (form singolo e batch), la Tabella orario mostra il rapporto corretto e si aggiorna in tempo reale piazzando/spostando/rimuovendo ore in griglia (anche prima di Salvare, riflette la bozza); una classe senza monte ore impostato mostra solo il conteggio senza rapporto

## Classi/Cattedre: animazione di apertura sulle righe espandibili

Discussione partita da una domanda su come sono fatti i dropdown del progetto (componenti Nuxt UI, niente costruito da zero) e se `UCollapsible` fosse più adatto delle righe espandibili native di `UTable` per Classi/Cattedre - no: `UCollapsible` produce un trigger + un `<div>` generico, senza idea di riga di tabella; usarlo dentro `UTable` avrebbe richiesto reimplementare a mano quello che l'espansione nativa già fa (vera `<tr colspan>`, integrata con ordinamento/filtri). Resta l'espansione nativa, ma senza alcuna animazione finora - richiesta un'apertura fluida simile a quella di un Collapsible.

**Perché non un semplice `transition: height`**: l'altezza del contenuto è variabile (dipende da quante classi/cattedre ha quella sezione/docente) e non si può animare in CSS puro da/verso `height: auto` - problema classico del web, non specifico di questo progetto. La tecnica di base è quella nota per risolverlo senza misurare nulla via JS: un contenitore `grid` la cui unica riga passa da `grid-template-rows: 0fr` a `1fr`, col figlio in `overflow-hidden` per non far sporgere il contenuto durante la transizione.

**Primo tentativo fallito: `<Transition>` di Vue attorno al contenuto - non si vedeva nessuna animazione, apertura e chiusura sempre di scatto.** Causa, trovata leggendo il sorgente di `UTable` (`node_modules/@nuxt/ui/dist/runtime/components/Table.vue`): la riga espansa è generata da Nuxt UI stesso con `<tr v-if="row.getIsExpanded()">...<slot name="expanded" /></tr>` - il `v-if` che monta/smonta davvero quella `<tr>` non è nostro, è dentro il componente. Un `<Transition>` scritto nel NOSTRO slot vive quindi dentro una `<tr>` che Nuxt UI crea e distrugge di colpo: alla chiusura, `<tr>` e tutto il suo contenuto (incluso il nostro `<Transition>`) spariscono nello stesso istante in cui `expanded` diventa `false`, prima che qualunque transizione di uscita abbia modo di partire - un `<Transition>` annidato non ha modo di "trattenere" la rimozione decisa da un `v-if` esterno che non lo conosce.

**Soluzione**: disaccoppiare il momento in cui l'animazione gioca dal momento in cui la riga viene davvero smontata. Nuovo composable condiviso `useExpandRowAnimation<TData>()` (`app/composables/useExpandRowAnimation.ts`, generico sul tipo di riga per non violare `@typescript-eslint/no-explicit-any`): un `Set` reattivo di id "in chiusura". `toggleRow(row)` - se la riga sta aprendo, chiama subito `row.toggleExpanded()` (il montaggio con `@starting-style` in CSS gestisce da solo l'animazione di entrata, senza bisogno di ritardare nulla); se sta chiudendo, NON chiama subito `toggleExpanded()` - aggiunge l'id al set "in chiusura" (che fa scattare via classe reattiva la transizione CSS verso `grid-rows-[0fr]` su un elemento ancora montato, quindi l'animazione parte per davvero) e solo dopo 300ms (durata della transizione) chiama il vero `toggleExpanded()`, che a quel punto smonta una riga già visivamente collassata - la rimozione diventa impercettibile perché avviene a animazione già conclusa.
- L'apertura usa `@starting-style` di CSS (variante `starting:` di Tailwind v4, confermata presente nel bundle installato) invece di un'altra gestione manuale: è pensata apposta per animare un elemento appena inserito nel DOM, nessun problema di sincronizzazione con un `v-if` esterno perché non serve intercettare nulla, il browser gestisce da solo il "valore di partenza" al primo istante di vita dell'elemento.
- [x] `app/composables/useExpandRowAnimation.ts` (nuovo, condiviso) - `toggleRow`, `isClosing`; guardia contro click ripetuti durante la chiusura (`if (closingRowIds.has(row.id)) return` prima di schedulare un secondo timeout, altrimenti due chiusure ravvicinate potevano far riaprire la riga da sole)
- [x] `useSchoolClassTable.ts`/`useAssignmentTable.ts` - usano il composable, espongono `toggleRow`/`isClosing`/`isOpen`
- [x] `SchoolClassTable.vue`/`AssignmentTable.vue` - i trigger (freccia ed etichetta cliccabile) chiamano `toggleRow(row)` invece di `row.toggleExpanded()` diretto; il contenitore del dettaglio non è più dentro un `<Transition>`, è un div sempre presente quando montato con classe reattiva `grid-rows-[0fr]` (se `isClosing(row)`) o `grid-rows-[1fr]` più `starting:grid-rows-[0fr]` altrimenti
- **Bug trovato subito dopo**: la freccia ruotava solo a fine chiusura (300ms dopo il click), non al click stesso - perché era legata a `row.getIsExpanded()`, che ora resta `true` per tutta la finestra di chiusura ritardata (lo giriamo davvero solo alla fine). Aggiunto `isOpen(row)` al composable (`row.getIsExpanded() && !isClosing(row)`) - diventa `false` nello stesso istante del click, prima ancora che l'animazione parta - e usato quello per la rotazione della freccia al posto di `row.getIsExpanded()` diretto.
- [ ] Verifica: `npm run tauri dev` - espandere/comprimere una riga in Classi e in Cattedre mostra un'apertura/chiusura fluida (circa 300ms) invece di uno scatto istantaneo, indipendentemente da quante righe di dettaglio contiene; la freccia ruota subito al click, non a fine animazione; cliccare rapidamente più volte di fila non lascia la riga in uno stato inconsistente

**Bug segnalato con screenshot: il bordo tra una riga e la successiva compariva subito sotto l'intestazione appena espansa, invece di restare in fondo al blocco e "scendere" insieme a lui mentre si apre.** Causa: il divisore tra righe è `divide-y divide-default` sul `<tbody>` di `UTable` (un bordo automatico tra `<tr>` adiacenti) - quando la riga di dettaglio viene inserita subito dopo la riga di sezione/docente, il divisore resta esattamente dov'era prima (appena sotto l'intestazione), non in fondo al nuovo contenuto.

Corretto sfruttando un attributo che `UTable` già scrive da solo sulla riga principale, `data-expanded="true"` quando è aperta (visto nel sorgente del componente): passato `:ui="{ tr: 'border-t-0! border-b border-default data-[expanded=true]:border-transparent' }"` a `UTable` in entrambe le tabelle - bordo in fondo a ogni riga per conto nostro (invece del `divide-y` automatico, disattivato con `border-t-0!`), spento specificamente sulla riga che è aperta. La riga di dettaglio (che non ha quell'attributo, resta sempre col suo bordo) eredita così il "ruolo" di confine finale - e poiché la sua altezza cresce insieme al contenuto animato dentro, il bordo in fondo a essa si sposta visivamente verso il basso man mano che il blocco si apre, invece di comparire fermo subito sotto l'intestazione.
- [x] `SchoolClassTable.vue`/`AssignmentTable.vue` - stesso override `:ui="{ tr: ... }"` in entrambe
- [ ] Verifica: `npm run tauri dev` - aprendo una sezione/docente il bordo sotto la sua riga sparisce subito e ne compare uno nuovo in fondo al dettaglio, che scende progressivamente mentre il blocco si apre invece di comparire fermo; chiudendo, il bordo torna sotto la riga una volta che l'animazione di chiusura è finita

## Riorganizzazione: componenti condivisi sotto components/shared/

I componenti non legati a un'entità (`clearable-input/`, `confirm-dialog/`, `sortable-header/`) erano sibling diretti delle cartelle macroarea per entità (`teacher/`, `school-class/`, ecc.) dentro `app/components/` - spostati sotto `app/components/shared/` per distinguerli a colpo d'occhio. Nessun impatto sui nomi dei componenti nei template (`ClearableInput`, `ConfirmDialog`, `SortableHeader` restano gli stessi): `nuxt.config.ts` ha già `pathPrefix: false` sullo scan di `components/`, quindi il nome registrato viene sempre dal nome del file, non dal percorso della cartella - la profondità in più non cambia nulla lato auto-import, verificato con typecheck/lint puliti dopo lo spostamento.

- [x] `clearable-input/`, `confirm-dialog/`, `sortable-header/` spostati sotto `app/components/shared/` (con `git mv`, storia preservata)

## Cambio tema: colori, icone Phosphor - BREAKING CHANGE

Tema generato con il web tool ufficiale di Nuxt UI (https://ui.nuxt.com/theme), file scaricati (`app.config.ts`, `main.css`) e confrontati con la configurazione esistente prima di applicare nulla.

**Cosa cambia davvero rispetto a prima** (verificato leggendo i default di Nuxt UI in `node_modules`, non per supposizione):
- **Colori**: `primary: rose`, `success: teal`, `neutral: stone` - il progetto non aveva mai un `app.config.ts` (usava i default di Nuxt UI, che sono `primary: green`/`neutral: slate`) - questa è la prima volta che i colori vengono scelti esplicitamente.
- **`main.css` invariato**: il file scaricato dal tool è byte-per-byte identico a quello già nel progetto (font `Plus Jakarta Sans`, `--ui-radius: 0.5rem`, gli override chiaro/scuro di `--ui-bg`/`--ui-text-inverted`) - il tool non tocca quella parte, quindi non c'è nulla da cambiare lì. Il font Plus Jakarta Sans non è mai stato davvero caricato (nessun modulo font, nessun link Google Fonts) - probabilmente ripiega già sul sans-serif di sistema; non toccato in questo giro perché il tema generato non lo cambia, resta un problema preesistente e separato.
- **Icone: Lucide → Phosphor**. Il file generato copre solo le icone *interne* di Nuxt UI (freccine dei componenti, spunta, chiusura popup, spinner di caricamento ecc. - la chiave `icons` di `app.config.ts`). Le icone che il progetto usa *direttamente* nei propri template (61 riferimenti `i-lucide-*` in ~20 file) non sono toccate da quel file - cercate a mano le corrispondenze Phosphor per ciascuna, verificate una per una con la ricerca icone invece di indovinare la convenzione di naming (Phosphor non ricalca sempre quella di Lucide):
  - `filter` → `funnel` (Phosphor non ha "filter")
  - `chevron-*` → `caret-*` (Phosphor chiama le frecce piccole "caret", non "chevron" - coerente con la mappatura già nel file generato)
  - `arrow-up-narrow-wide`/`arrow-down-wide-narrow`/`arrow-up-down` → `sort-ascending`/`sort-descending`/`arrows-down-up` (Phosphor ha icone di ordinamento dedicate, più pulite del nome descrittivo di Lucide)
  - `user-pen` (nessun equivalente diretto) → `identification-card` (stesso significato - "modifica anagrafica" - reso con un'icona semanticamente diversa ma coerente)
  - `clipboard-edit` (nessun equivalente diretto, usata per la voce di menu "Anagrafica") → `address-book` (più calzante concettualmente per un registro di persone)
  - `baseline` (nessun equivalente diretto, usata per "Sezioni") → `text-aa`
  - Tutte le altre (`arrow-left`, `trash`, `pencil`, `x`, `armchair`, `plus`, `file-down`→`file-arrow-down`, `calendar-days`→`calendar`, `user`, `triangle-alert`→`warning`, `info`, `graduation-cap`, `door-open`, `circle-x`→`x-circle`, `circle-check`→`check-circle`) hanno un corrispondente diretto o quasi-diretto, verificato prima di sostituire
- **Colore neutro sui campi form** (`input`/`select`/`textarea`/`selectMenu`/`inputMenu`/`inputNumber`/`inputTags`/`inputDate`/`inputTime`/`pinInput`): il generatore imposta `color: neutral` di default invece del primary (rose) - scelta del tool, non nostra, portata as-is.
- **`size: md`/`variant: solid`**: già i default di Nuxt UI, non richiedono override - il tool infatti non li scrive nel file generato.

- [x] `app/app.config.ts` (nuovo) - contenuto del file generato dal tool, invariato
- [x] Rinominate tutte le 23 icone `i-lucide-*` distinte usate nel progetto (61 occorrenze totali) nei rispettivi equivalenti `i-ph-*`, con sostituzione mirata (non un cerca-sostituisci alla cieca) per ogni file che le referenzia
- [ ] Verifica: `npm run tauri dev` - ricaricare e controllare a vista tutte le schermate (Anagrafica, le 5 entità, Tabella orario compresa la griglia e i menu contestuali) - colori, icone e che nessuna icona sia rimasta rotta/mancante

**Chiarito come si aggiungono icone da qui in avanti**: la chiave `icons` di `app.config.ts` è riservata al set *fisso* di icone interne di Nuxt UI (ruoli come `chevronDown`, `close`, `loading` - una lista chiusa della libreria) - non è un posto dove registrare le icone che usiamo nei nostri componenti. Per una nuova icona nostra: si cerca con lo strumento di ricerca icone e si scrive `i-ph-nome` direttamente dove serve (`icon="..."` su un componente, o dentro un item di menu) - nessun passaggio intermedio.

**Consolidamento CSS: main.scss eliminato, tutto in main.css.** `main.scss` conteneva un'unica regola (`button:not(:disabled) { cursor: pointer }`) senza nessuna sintassi Sass vera - CSS puro travestito da SCSS. `main.css` invece contiene la configurazione del tema di Tailwind v4 (`@theme`, le custom property `--ui-*`) che **deve** stare in un file `.css` nativo processato dalla pipeline di Tailwind, farla passare da Sass non avrebbe senso. Dato che il resto del progetto è quasi interamente Tailwind utility-first (mai usato un blocco `<style>` in nessun componente in questa sessione), tenere un secondo file più un compilatore Sass (`sass-embedded`) per una riga di CSS puro non si giustificava.
- [x] Spostata la regola del cursore in `main.css`, eliminato `app/assets/scss/main.scss`, tolto il riferimento in `nuxt.config.ts` (`css: [...]`), disinstallato `sass-embedded` da `package.json`
- [x] Aggiornato CLAUDE.md (riga "Linguaggio" nello Stack: via SCSS, CSS puro con Tailwind v4)
- [ ] Verifica: `npm run tauri dev` - i bottoni mostrano ancora il cursore a manina, nessun errore di build legato allo stile

## Versionamento: 0.1.0 → 0.2.0

Richiesta: numero di versione in `package.json`, in vista di eventuali rilasci futuri degli `.exe` su GitHub. `package.json` da solo non basta per quello scopo specifico: Tauri legge la versione da `src-tauri/tauri.conf.json` (con `Cargo.toml` come fallback se `tauri.conf.json` non la specifica) per i metadati dell'eseguibile/installer, non da `package.json` - i due file erano già allineati a `0.1.0` prima di questa richiesta, `package.json` invece non aveva mai avuto un campo `version`. Allineati tutti e tre a `0.2.0`.

- [x] `package.json` - aggiunto `"version": "0.2.0"` (non c'era prima)
- [x] `src-tauri/tauri.conf.json` - `0.1.0` → `0.2.0`
- [x] `src-tauri/Cargo.toml` - `0.1.0` → `0.2.0` (verificato con `cargo clippy` che `Cargo.lock` si è risincronizzato da solo, `app v0.2.0`)
- [x] Autore: `package.json` (`"author": "Filippo Caneo <filippo.caneo@gmail.com>"`, non c'era) e `Cargo.toml` (`authors`, prima il placeholder `["you"]` mai sistemato dalla creazione del progetto Tauri) allineati entrambi

## Salvataggi multipli (un anno scolastico per file) - IN CODA, verso la fine

Bisogno: poter tenere dati separati per anno scolastico (es. AS2026/2027, poi AS2027/2028) senza perdere quelli precedenti - "salvataggi" come in un videogioco: crea, duplica, elimina, cambia.

Decisione: **un file `.db` per salvataggio**, non un'unica tabella con colonna "anno scolastico". Verificato nel sorgente di `tauri-plugin-sql` (comando `load` in `commands.rs`) che il plugin accetta *qualsiasi* percorso a runtime via `Database.load('sqlite:...')`, non solo quello fisso registrato in `add_migrations` all'avvio - quindi cambiare file a runtime è già supportato dal plugin che usiamo, nessuna dipendenza nuova.

Perché file separati e non una colonna `school_year_id` ovunque: quest'ultima richiederebbe aggiungere la colonna e filtrare per l'anno corrente in *ogni* tabella e *ogni* query esistente (teacher, school_class, section, study_track, assignment, preference, schedule_entry) - riscrittura pervasiva per un beneficio che non serve (non c'è bisogno di confrontare anni diversi nella stessa vista). Con un file per salvataggio, tutto il codice attuale resta identico: lavora sempre su "il DB correntemente caricato", qualunque esso sia.

Punti da risolvere quando ci si arriva:
- Cartella `saves/` (dentro l'app data dir) con un file `.db` per salvataggio
- Un nuovo salvataggio vuoto si crea copiando un file "modello" già migrato (creato una volta alla prima installazione, o generato al volo) - non registrando dinamicamente `add_migrations` per ogni nome futuro, che il plugin non supporta per percorsi decisi a runtime
- Duplica = copia file (`tauri-plugin-fs`), Elimina = cancella file, Cambia = `Database.load()` sul nuovo percorso + richiamare tutti i `fetch*()` per aggiornare le liste in pagina
- UI di gestione salvataggi (lista/crea/duplica/elimina/cambia) - da disegnare quando ci si arriva, non ancora deciso dove viva nella navigazione
- [ ] (non ancora iniziato - deliberatamente rimandato a dopo griglia orario + esportazione PDF)
