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
