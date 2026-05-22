import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
export const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..')

export function resolveFromProject(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p)
}

export function resolveFromBase(baseDir: string, p: string) {
  return path.isAbsolute(p) ? p : path.resolve(baseDir, p)
}

export function defaultAutomationDir() {
  return path.resolve(PROJECT_ROOT, '.edi-market-guardin')
}

