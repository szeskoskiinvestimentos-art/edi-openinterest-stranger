import type { ForeignFlowRow } from './types.js'

function ddmmyyyyToYmd(s: string) {
  const raw = String(s || '').trim()
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const dd = m[1]
  const mm = m[2]
  const yyyy = m[3]
  return `${yyyy}-${mm}-${dd}`
}

function parsePtBrNumber(raw: string) {
  const s = String(raw || '').trim()
  if (!s) return null
  const cleaned = s.replace(/\s+/g, ' ').trim()
  if (cleaned === '—' || cleaned === '-' || cleaned === '--') return null
  const m = cleaned.match(/-?\s*[\d.]+(?:,\d+)?/)
  if (!m) return null
  const num = m[0].replace(/\s+/g, '').replace(/\./g, '').replace(',', '.')
  const v = Number(num)
  return Number.isFinite(v) ? v : null
}

function parsePtBrCompactMoney(raw: string) {
  const s = String(raw || '').trim().toLowerCase()
  const base = parsePtBrNumber(s)
  if (base === null) return null
  if (/\bbi\b/.test(s)) return base * 1e9
  if (/\bmi\b/.test(s)) return base * 1e6
  if (/\bmil\b/.test(s)) return base * 1e3
  return base
}

export function extractDadosDeMercadoUpdatedAt(html: string) {
  const m = String(html || '').match(/Atualizado em\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]{3}),?\s+(\d{4})\s+(\d{2}):(\d{2})/i)
  if (!m) return { updatedAt: null as string | null, updatedAtText: null as string | null }
  const day = Number(m[1])
  const monRaw = String(m[2] || '').toLowerCase()
  const year = Number(m[3])
  const hh = Number(m[4])
  const mm = Number(m[5])
  const monthMap: Record<string, number> = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
  }
  const mon = monthMap[monRaw]
  if (![day, year, hh, mm].every(Number.isFinite) || mon === undefined) {
    return { updatedAt: null as string | null, updatedAtText: m[0] || null }
  }
  const dt = new Date(year, mon, day, hh, mm, 0, 0)
  if (Number.isNaN(dt.getTime())) return { updatedAt: null as string | null, updatedAtText: m[0] || null }
  return { updatedAt: dt.toISOString(), updatedAtText: m[0] || null }
}

export function extractForeignFlowRowsFromHtml(html: string) {
  const out: ForeignFlowRow[] = []
  const re =
    /<tr[^>]*>\s*<td[^>]*>\s*(\d{2}\/\d{2}\/\d{4})\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>[\s\S]*?<\/tr>/gi
  let m: RegExpExecArray | null = null
  while ((m = re.exec(html))) {
    const date = ddmmyyyyToYmd(m[1])
    if (!date) continue
    const foreigners = parsePtBrCompactMoney(m[2]) ?? 0
    const institutional = parsePtBrCompactMoney(m[3]) ?? 0
    const individuals = parsePtBrCompactMoney(m[4]) ?? 0
    const financial_institutions = parsePtBrCompactMoney(m[5]) ?? 0
    const other = parsePtBrCompactMoney(m[6]) ?? 0
    out.push({ date, foreigners, institutional, individuals, financial_institutions, other })
  }
  out.sort((a, b) => a.date.localeCompare(b.date))
  return out
}

