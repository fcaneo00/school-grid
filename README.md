<p align="center">
  <img src="src-tauri/icons/128x128.png" width="72" alt="School Grid" />
</p>

<h1 align="center">School Grid</h1>

<p align="center">
  L'orario scolastico settimanale, costruito a mano - ma senza doverlo tenere tutto in testa.
</p>

---

**School Grid** è un'app desktop pensata per chi costruisce davvero l'orario di una scuola: un dirigente scolastico, o chi ne fa le veci (un docente delegato, di solito quello con più pazienza). Gestisce classi, docenti e cattedre, mette tutto in griglia trascinando - per classe o per docente, a scelta - e lo esporta in un PDF pronto da stampare e affiggere.

Gira in locale, dati su SQLite sul tuo computer: nessun account, nessun cloud, nessun abbonamento. Un solo utilizzatore, un solo file `.db`, punto.

## Non è un generatore automatico

> L'app segnala i conflitti - docente doppio, classe doppia, giorno libero non rispettato - ma la decisione di dove mettere ogni ora resta **sempre** a chi costruisce l'orario.

Non è un capriccio filosofico: è la scelta di design che guida tutto il resto. Esistono strumenti che "generano" l'orario in automatico e ti restituiscono qualcosa che nessuno ha davvero deciso, difficile da giustificare quando arriva la prima richiesta di modifica. School Grid fa il contrario: costruisci tu, casella per casella, e l'app ti dice quando stai per combinare un pasticcio.

## Cosa c'è oggi

La parte anagrafica è pronta e sensata, non solo funzionante:

| Sezione | Cosa gestisce |
|---|---|
| **Docenti** | Nome, cognome, e le cattedre a cui sono assegnati |
| **Classi** | Anno (1-5) + Sezione + Corso di studio - così una 1A Scientifico non si confonde mai con una 1A Linguistico |
| **Sezioni** | "A", "B", "C"... come entità propria, non testo libero - niente più "a" vs "A" a spezzare i raggruppamenti |
| **Corsi di studio** | Scientifico, Linguistico, Classico... stessa logica delle Sezioni |
| **Materie** | Il minimo indispensabile: un nome |
| **Cattedre** | Chi insegna cosa, a quale classe, per quante ore a settimana |

Ogni cancellazione controlla se il record è ancora agganciato a qualcos'altro (una materia usata in una cattedra non si cancella per sbaglio) e te lo dice per nome, non con un codice errore SQL. Tabelle filtrabili, form validati, tutto in italiano e pronto per altre lingue il giorno in cui servissero.

## Il flusso, in breve

```mermaid
flowchart TD
    Home["Home"] --> Anagrafica["Anagrafica"]
    Home --> Orario["Tabella orario"]
    Home --> PDF["Esporta PDF"]
    Home --> Impostazioni["Impostazioni"]

    Anagrafica --> Docenti["Docenti"]
    Anagrafica --> Classi["Classi"]
    Anagrafica --> Sezioni["Sezioni"]
    Anagrafica --> Corsi["Corsi di studio"]
    Anagrafica --> Cattedre["Cattedre"]

    Impostazioni -.->|regola ore/giorni attivi| Orario

    Orario --> Modalita{"Classe o Docente?"}
    Modalita -->|Classe| GrigliaClasse["Trascina le cattedre della classe negli slot"]
    Modalita -->|Docente| GrigliaDocente["Trascina le classi del docente negli slot"]
    GrigliaClasse --> Bozza["Bozza - modifiche non salvate"]
    GrigliaDocente --> Bozza
    Bozza --> Salva["Salva su DB"]

    Salva --> PDF
    PDF --> Anteprima["Anteprima + resoconto ore"]
    Anteprima -->|cattedra da correggere| Orario
    Anteprima --> Genera["Genera PDF"]
```

Le due modalità della Tabella orario (per classe o per docente) guardano gli stessi dati da due lenti diverse - una modifica fatta nell'una compare subito nell'altra. L'Anteprima PDF segnala anche le cattedre con ore in difetto o in eccesso rispetto al monte ore: da lì si torna con un clic direttamente alla classe da correggere.

## Cosa manca

Il grosso - griglia orario trascinabile, doppia modalità, validazione dei conflitti in tempo reale, esportazione PDF - è già costruito ed è la ragione per cui il progetto esiste. Quello che resta in coda: la possibilità di tenere più orari separati (un "salvataggio" per anno scolastico) invece di un unico database sempre attivo.

## Lo stack, in breve

Nuxt 4 (Vue) per l'interfaccia, [Tauri 2](https://tauri.app) per impacchettarla come app desktop nativa (Rust sotto il cofano), SQLite locale per i dati, [Nuxt UI](https://ui.nuxt.com) + Tailwind per non reinventare i componenti. Niente backend, niente server: l'eseguibile e il suo database vivono sul tuo computer.

Per i dettagli tecnici - modello dati, convenzioni di codice, principi di lavoro - la fonte di verità è [`CLAUDE.md`](CLAUDE.md).

## Si parte così

```bash
npm install

# finestra nativa, con SQLite/dialog/filesystem funzionanti
npm run tauri dev
# oppure
npm run dev:tauri

# eseguibile finale
npm run tauri build
# oppure
npm run build:tauri
```

Il solo `npm run dev` apre l'app nel browser, ma senza i plugin Tauri (SQLite incluso) - utile per lavorare rapidamente sull'interfaccia, non per testare nulla che tocchi il database.
