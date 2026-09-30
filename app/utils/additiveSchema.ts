import type Database from '@tauri-apps/plugin-sql'

// tauri-plugin-sql applica le migration Rust (src-tauri/src/lib.rs) solo al percorso esatto
// registrato in add_migrations ("sqlite:_template.db") - mai ai singoli file .db sotto saves/,
// che sono copie del template fatte al momento della creazione. Una tabella/colonna aggiunta
// solo lato Rust non arriverebbe mai ai salvataggi già esistenti. getDb() esegue quindi anche
// queste istruzioni DDL idempotenti sul salvataggio attivo, una volta per sessione - qualunque
// nuova tabella/colonna additiva va aggiunta qui.

const ADDITIVE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS teacher_unavailable_hour (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL REFERENCES teacher(id),
    day TEXT NOT NULL,
    hour_slot INTEGER NOT NULL,
    UNIQUE(teacher_id, day, hour_slot)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_teacher_unavailable_hour_teacher ON teacher_unavailable_hour(teacher_id)'
]

// SQLite non supporta "ALTER TABLE ... ADD COLUMN IF NOT EXISTS" (solo CREATE TABLE/INDEX lo
// supportano) - per le colonne serve controllare prima via PRAGMA table_info se esiste già.
const ADDITIVE_COLUMNS = [
  { table: 'teacher', column: 'max_consecutive_hours', definition: 'INTEGER' }
]

const schemaEnsuredForSave = new Set<string>()

async function ensureAdditiveColumns(db: Database) {
  for (const { table, column, definition } of ADDITIVE_COLUMNS) {
    const columns = await db.select<{ name: string }[]>(`PRAGMA table_info(${table})`)
    if (columns.some((existing) => existing.name === column)) continue
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

export async function ensureAdditiveSchema(db: Database, activeSave: string) {
  if (schemaEnsuredForSave.has(activeSave)) return
  for (const statement of ADDITIVE_SCHEMA_STATEMENTS) {
    await db.execute(statement)
  }
  await ensureAdditiveColumns(db)
  schemaEnsuredForSave.add(activeSave)
}
