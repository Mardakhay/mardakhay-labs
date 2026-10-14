export const MAX_PROMPT_IMPORT_COUNT = 500

export const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024

export function validatePromptImportFileSize(fileSize: number) {
  if (!Number.isFinite(fileSize) || fileSize < 0) {
    throw new Error('Import file size is invalid.')
  }

  if (fileSize > MAX_IMPORT_FILE_SIZE_BYTES) {
    throw new Error('Import file is too large. Choose a JSON file no larger than 5 MiB.')
  }
}
