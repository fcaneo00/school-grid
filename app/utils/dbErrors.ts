export function isForeignKeyError(error: unknown): boolean {
  return String(error).includes('FOREIGN KEY constraint failed')
}
