export function normalizeHttpUrl(raw: string, fallback: string) {
  const s = String(raw || '').trim().replace(/[`'"]/g, '')
  return s && /^https?:\/\//i.test(s) ? s : fallback
}

export function parseList(raw: string) {
  const parts = String(raw || '')
    .split(/[\n,;]+/g)
    .map(x => x.trim())
    .filter(Boolean)
  return Array.from(new Set(parts))
}

export function envIntOrNull(env: (key: string, fallback?: string) => string, name: string) {
  const raw = env(name)
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

