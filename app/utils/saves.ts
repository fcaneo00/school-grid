export const SAVES_DIR = 'saves'
export const TEMPLATE_DB = '_template.db'
export const ACTIVE_SAVE_FILE = 'active-save.txt'
export const DEFAULT_SAVE_NAME = 'Salvataggio principale'
export const DEMO_RESOURCE_FILE = 'demo.db'
export const DEMO_SAVE_NAME = 'Demo'
const SAVE_FILE_EXTENSION = '.db'
const SLASH = '/'
const FULLWIDTH_SLASH = '／'

export function saveFilePath(fileName: string) {
  return `${SAVES_DIR}/${fileName}`
}

export function isSaveFile(fileName: string) {
  return fileName.endsWith(SAVE_FILE_EXTENSION)
}

export function saveDisplayName(fileName: string) {
  const withoutExtension = fileName.endsWith(SAVE_FILE_EXTENSION) ? fileName.slice(0, -SAVE_FILE_EXTENSION.length) : fileName
  return withoutExtension.replaceAll(FULLWIDTH_SLASH, SLASH)
}

export function saveFileName(displayName: string) {
  return `${displayName.replaceAll(SLASH, FULLWIDTH_SLASH)}${SAVE_FILE_EXTENSION}`
}
