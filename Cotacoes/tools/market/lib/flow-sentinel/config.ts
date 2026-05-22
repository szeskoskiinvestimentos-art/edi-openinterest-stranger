export function envNumber(key: string, fallback: number) {
  const raw = process.env[key]
  if (raw === undefined || raw === null) return fallback
  const n = Number(String(raw).trim())
  return Number.isFinite(n) ? n : fallback
}

export function utcHourOf(iso: string | undefined) {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return null
  try {
    return new Date(ms).getUTCHours()
  } catch {
    return null
  }
}

export function sessionFromUtcHour(utcHour: number | null) {
  if (utcHour === null) return 'unknown' as const
  if (utcHour >= 22 || utcHour < 8) return 'asia' as const
  if (utcHour >= 12 && utcHour < 21) return 'us' as const
  return 'eu' as const
}

