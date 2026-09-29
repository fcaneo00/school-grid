export const HISTORY_DIR = '.history'
export const MAX_HISTORY_VERSIONS = 20

export function historyDirPath(saveFileName: string) {
  return `${SAVES_DIR}/${HISTORY_DIR}/${saveFileName}`
}

export function historyFilePath(saveFileName: string, versionFileName: string) {
  return `${historyDirPath(saveFileName)}/${versionFileName}`
}

export function createVersionFileName(date: Date = new Date()) {
  const pad = (n: number, length = 2) => String(n).padStart(length, '0')
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + 'T' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad(date.getMilliseconds(), 3)
  ].join('-')
  return `${stamp}.db`
}

export function versionTimestamp(versionFileName: string) {
  const match = versionFileName.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})\.db$/)
  if (!match) {
    throw new Error(`Nome file versione non valido: ${versionFileName}`)
  }
  const [, year, month, day, hours, minutes, seconds, ms] = match.map(Number)
  return new Date(year!, month! - 1, day!, hours!, minutes!, seconds!, ms!)
}
