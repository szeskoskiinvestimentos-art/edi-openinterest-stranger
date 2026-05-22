import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
export const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..')

export function resolveFromProject(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p)
}

export function env(key: string, fallback = '') {
  const v = process.env[key]
  if (typeof v === 'string' && v.trim()) return v.trim()
  return fallback
}

export function envBool(key: string, fallback: boolean) {
  const v = process.env[key]
  if (v === undefined || v === null || v === '') return fallback
  const s = String(v).trim().toLowerCase()
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false
  return fallback
}

