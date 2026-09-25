export function resolveReturnTo(value: unknown, fallback: string) {
  return typeof value === 'string' && value.startsWith('/') ? value : fallback
}
