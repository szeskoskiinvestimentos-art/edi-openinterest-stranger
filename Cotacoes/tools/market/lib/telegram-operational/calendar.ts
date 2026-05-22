export type EconomicCalendarItem = {
  id: string
  time: string
  currency: string
  impact: 'ALTO' | 'MÉDIO' | 'BAIXO'
  event: string
  wdo?: string
  win?: string
}

export type EconomicCalendarPayload = {
  meta?: { generatedAt?: string; attemptedAt?: string; status?: string }
  items?: EconomicCalendarItem[]
}

export type CalendarCountryKey = 'BR' | 'EUA' | 'CHINA/HK'

export function pickCalendarDayByCountry(payload: EconomicCalendarPayload | null, perCountryLimit = 10) {
  const items = payload && Array.isArray(payload.items) ? payload.items : []
  const parseTime = (t: string) => {
    const m = String(t || '').match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return 9999
    return Number(m[1]) * 60 + Number(m[2])
  }
  const keyOf = (currency: string): CalendarCountryKey | null => {
    const c = String(currency || '').toUpperCase().trim()
    if (c === 'BRL') return 'BR'
    if (c === 'USD') return 'EUA'
    if (c === 'CNY' || c === 'CNH' || c === 'HKD') return 'CHINA/HK'
    return null
  }

  const groups: Record<CalendarCountryKey, EconomicCalendarItem[]> = { BR: [], EUA: [], 'CHINA/HK': [] }
  for (const it of items) {
    if (!it) continue
    if (it.impact === 'BAIXO') continue
    const k = keyOf(it.currency)
    if (!k) continue
    groups[k].push(it)
  }

  const sortAndLimit = (xs: EconomicCalendarItem[]) =>
    xs
      .slice()
      .sort((a, b) => parseTime(a.time) - parseTime(b.time))
      .slice(0, Math.max(1, Math.min(30, Math.floor(perCountryLimit))))

  return {
    BR: sortAndLimit(groups.BR),
    EUA: sortAndLimit(groups.EUA),
    'CHINA/HK': sortAndLimit(groups['CHINA/HK']),
  }
}

export function calendarSummaryLine(groups: Record<CalendarCountryKey, EconomicCalendarItem[]>, perCountry = 2) {
  const cut = (xs: EconomicCalendarItem[]) => xs.slice(0, Math.max(0, Math.min(6, Math.floor(perCountry))))
  const fmt = (k: CalendarCountryKey) =>
    `${k}: ${cut(groups[k]).map(x => `${x.time}`).join(' • ') || 'n/d'}`
  return `${fmt('BR')} | ${fmt('EUA')} | ${fmt('CHINA/HK')}`
}
