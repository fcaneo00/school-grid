import Database from '@tauri-apps/plugin-sql'
import { BaseDirectory, exists, readTextFile } from '@tauri-apps/plugin-fs'
import { ACTIVE_SAVE_FILE, saveFilePath } from '~/utils/saves'

export async function getActiveSave() {
  const pointerExists = await exists(ACTIVE_SAVE_FILE, { baseDir: BaseDirectory.AppConfig })
  const activeSave = pointerExists ? (await readTextFile(ACTIVE_SAVE_FILE, { baseDir: BaseDirectory.AppConfig })).trim() : ''
  if (!activeSave) {
    throw new Error('Nessun salvataggio attivo')
  }
  return activeSave
}

const ADDITIVE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS teacher_time_constraint (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL REFERENCES teacher(id),
    day TEXT NOT NULL,
    not_before INTEGER,
    not_after INTEGER,
    CHECK (not_before IS NOT NULL OR not_after IS NOT NULL)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_teacher_time_constraint_teacher ON teacher_time_constraint(teacher_id)'
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

async function ensureAdditiveSchema(db: Database, activeSave: string) {
  if (schemaEnsuredForSave.has(activeSave)) return
  for (const statement of ADDITIVE_SCHEMA_STATEMENTS) {
    await db.execute(statement)
  }
  await ensureAdditiveColumns(db)
  schemaEnsuredForSave.add(activeSave)
}

export async function getDb() {
  const activeSave = await getActiveSave()
  const db = await Database.load(`sqlite:${saveFilePath(activeSave)}`)
  await ensureAdditiveSchema(db, activeSave)
  return db
}
