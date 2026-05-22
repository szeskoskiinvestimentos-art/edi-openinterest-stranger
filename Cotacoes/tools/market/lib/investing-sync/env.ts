export function env(name: string): string | undefined
export function env(name: string, fallback: string): string
export function env(name: string, fallback?: string) {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : fallback
}

export function envBool(name: string, fallback: boolean) {
  const v = env(name)
  if (!v) return fallback
  const s = v.toLowerCase()
  if (s === '1' || s === 'true' || s === 'yes') return true
  if (s === '0' || s === 'false' || s === 'no') return false
  return fallback
}

export function envNumber(name: string, fallback: number) {
  const v = Number(env(name))
  return Number.isFinite(v) ? v : fallback
}

export function parseList(raw?: string | null) {
  const parts = String(raw || '')
    .split(/[\n,;]+/g)
    .map(s => s.trim())
    .filter(Boolean)
  return Array.from(new Set(parts))
}
