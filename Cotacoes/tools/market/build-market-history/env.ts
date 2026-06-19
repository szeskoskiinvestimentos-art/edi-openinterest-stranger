export { PROJECT_ROOT, resolveFromProject } from '../update-service/paths.js'

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
