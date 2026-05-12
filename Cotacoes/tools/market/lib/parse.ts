function normalizeNumeric(raw: string) {
  const s = (raw || '')
    .trim()
    .replaceAll('−', '-')
    .replaceAll(' ', '')
    .replaceAll('\u00A0', '')

  if (!s || s === '-' || s === '--') return null

  const hasDot = s.includes('.')
  const hasComma = s.includes(',')

  if (hasDot && hasComma) {
    const lastDot = s.lastIndexOf('.')
    const lastComma = s.lastIndexOf(',')
    if (lastDot > lastComma) {
      return s.replaceAll(',', '')
    }
    return s.replaceAll('.', '').replaceAll(',', '.')
  }

  if (hasComma && !hasDot) {
    const commas = (s.match(/,/g) || []).length
    if (commas > 1) return s.replaceAll(',', '')
    const lastComma = s.lastIndexOf(',')
    const decimals = s.length - lastComma - 1
    if (decimals >= 1 && decimals <= 6) return s.replaceAll(',', '.')
    return s.replaceAll(',', '')
  }

  if (hasDot && !hasComma) {
    const lastDot = s.lastIndexOf('.')
    const decimals = s.length - lastDot - 1
    if (decimals === 3 && s.replaceAll('.', '').match(/^-?\d+$/)) {
      return s.replaceAll('.', '')
    }
    return s
  }

  return s
}

export function parseNumber(raw: string) {
  const normalized = normalizeNumeric(raw)
  if (normalized === null) return null
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function parsePercent(raw: string) {
  const cleaned = (raw || '').replaceAll('%', '')
  const normalized = normalizeNumeric(cleaned)
  if (normalized === null) return null
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function toISO(input: string | undefined, fallback: Date) {
  const v = (input || '').trim()
  if (!v) return fallback.toISOString()
  const d = new Date(v)
  if (!Number.isFinite(d.getTime())) return fallback.toISOString()
  return d.toISOString()
}
