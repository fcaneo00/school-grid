export function isForeignKeyError(error: unknown): boolean {
  return String(error).includes('FOREIGN KEY constraint failed')
}

export function isUniqueConstraintError(error: unknown): boolean {
  return String(error).includes('UNIQUE constraint failed')
}
