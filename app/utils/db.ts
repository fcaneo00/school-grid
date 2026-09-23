import Database from '@tauri-apps/plugin-sql'

export function getDb() {
  return Database.load('sqlite:school-grid.db')
}
