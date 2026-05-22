import { envIntOrNull as envIntOrNullFromEnv } from '../lib/update-service/config-helpers.ts'

export function env(name: string): string | undefined
export function env(name: string, fallback: string): string
export function env(name: string, fallback?: string) {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : fallback
}

export function envNumber(name: string, fallback: number) {
  const v = Number(env(name))
  return Number.isFinite(v) ? v : fallback
}

export function envBool(name: string, fallback: boolean) {
  const raw = env(name)
  if (!raw) return fallback
  const v = raw.toLowerCase()
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false
  return fallback
}

export function envIntOrNull(name: string) {
  return envIntOrNullFromEnv(env, name)
}

export function nowISO() {
  return new Date().toISOString()
}

export function safeFileStamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

