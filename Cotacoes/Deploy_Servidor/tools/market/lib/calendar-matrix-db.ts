import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type CalendarMatrixCountry = 'BR' | 'EUA' | 'CHINA/HK'

export type CalendarMatrixReactions = {
  wdo: string
  win: string
  matrixKey?: string
}

export type CalendarMatrixReportRequest = {
  key: string
  country: CalendarMatrixCountry
  query: string
}

type CalendarMatrixMatch = {
  wdo: string
  win: string
  matrixKey?: string
  canonicalKey: string
  source: 'event' | 'rule'
  reportRequest?: CalendarMatrixReportRequest
}

type CalendarMatrixDbEvent = {
  key: string
  title: string
  aliases?: string[]
  match?: { includes?: string[]; regex?: string[] }
  reactions: CalendarMatrixReactions
  report?: { fetchOnCalendar?: boolean; query?: string }
}

type CalendarMatrixDbRule = {
  key: string
  match: { includes?: string[]; regex?: string[] }
  reactions: CalendarMatrixReactions
  report?: { fetchOnCalendar?: boolean; query?: string }
}

export type CalendarMatrixDb = {
  meta: { country: CalendarMatrixCountry; version: number }
  defaults?: CalendarMatrixReactions
  events: CalendarMatrixDbEvent[]
  rules: CalendarMatrixDbRule[]
}

export type CalendarMatrixDbs = Partial<Record<CalendarMatrixCountry, CalendarMatrixDb>>

function normalize(s: string) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokensOf(s: string) {
  const n = normalize(s)
  return n ? n.split(' ').filter(Boolean) : []
}

function scoreIncludes(haystack: string, includes: string[]) {
  const h = normalize(haystack)
  if (!h) return 0
  let score = 0
  for (const inc of includes) {
    const tks = tokensOf(inc)
    if (!tks.length) continue
    const ok = tks.every(t => h.includes(t))
    if (!ok) return 0
    score += tks.length
  }
  return score
}

function matchRegex(haystack: string, patterns: string[]) {
  const h = normalize(haystack)
  for (const p of patterns) {
    try {
      if (new RegExp(p, 'i').test(h)) return true
    } catch {
      continue
    }
  }
  return false
}

export function calendarCountryFromCurrency(currency: string): CalendarMatrixCountry | null {
  const c = String(currency || '').toUpperCase().trim()
  if (c === 'BRL') return 'BR'
  if (c === 'USD') return 'EUA'
  if (c === 'CNY' || c === 'CNH' || c === 'HKD') return 'CHINA/HK'
  return null
}

function pickReportRequest(country: CalendarMatrixCountry, def: { key: string; report?: { fetchOnCalendar?: boolean; query?: string } }) {
  if (!def.report || !def.report.fetchOnCalendar) return undefined
  const query = String(def.report.query || '').trim()
  if (!query) return undefined
  return { key: def.key, country, query }
}

export async function loadCalendarMatrixDbs(): Promise<CalendarMatrixDbs> {
  const baseDir = path.resolve(process.cwd(), 'tools', 'market', 'data', 'calendar-matrix')
  const files: Array<{ country: CalendarMatrixCountry; filename: string }> = [
    { country: 'BR', filename: 'br.json' },
    { country: 'EUA', filename: 'us.json' },
    { country: 'CHINA/HK', filename: 'cn.json' },
  ]

  const out: CalendarMatrixDbs = {}
  await Promise.all(
    files.map(async f => {
      const abs = path.join(baseDir, f.filename)
      const raw = await readFile(abs, 'utf-8')
      const parsed = JSON.parse(raw) as CalendarMatrixDb
      if (!parsed || !parsed.meta || parsed.meta.country !== f.country) {
        throw new Error(`calendar_matrix_db_invalid:${f.filename}`)
      }
      out[f.country] = parsed
    }),
  )
  return out
}

export function matchCalendarMatrix(
  dbs: CalendarMatrixDbs | null | undefined,
  currency: string,
  eventName: string,
): CalendarMatrixMatch | null {
  const country = calendarCountryFromCurrency(currency)
  if (!country) return null
  const db = dbs && dbs[country] ? dbs[country] : null
  if (!db) return null

  const raw = String(eventName || '').trim()
  if (!raw) return null

  const candidates: Array<{ score: number; def: CalendarMatrixDbEvent; source: 'event' }> = []
  for (const ev of db.events || []) {
    const includes = [
      ...(Array.isArray(ev.aliases) ? ev.aliases : []),
      ...(ev.match && Array.isArray(ev.match.includes) ? ev.match.includes : []),
    ]
    const score = includes.length ? scoreIncludes(raw, includes) : 0
    const regexOk =
      ev.match && Array.isArray(ev.match.regex) && ev.match.regex.length ? matchRegex(raw, ev.match.regex) : false
    const finalScore = Math.max(score, regexOk ? 2 : 0)
    if (finalScore > 0) candidates.push({ score: finalScore, def: ev, source: 'event' })
  }

  candidates.sort((a, b) => b.score - a.score)
  const best = candidates.length ? candidates[0] : null
  if (best) {
    return {
      wdo: best.def.reactions.wdo,
      win: best.def.reactions.win,
      matrixKey: best.def.reactions.matrixKey || best.def.key,
      canonicalKey: best.def.key,
      source: 'event',
      reportRequest: pickReportRequest(country, best.def),
    }
  }

  for (const rule of db.rules || []) {
    const inc = rule.match && Array.isArray(rule.match.includes) ? rule.match.includes : []
    const rx = rule.match && Array.isArray(rule.match.regex) ? rule.match.regex : []
    const score = inc.length ? scoreIncludes(raw, inc) : 0
    const ok = score > 0 || (rx.length ? matchRegex(raw, rx) : false)
    if (!ok) continue
    return {
      wdo: rule.reactions.wdo,
      win: rule.reactions.win,
      matrixKey: rule.reactions.matrixKey || rule.key,
      canonicalKey: rule.key,
      source: 'rule',
      reportRequest: pickReportRequest(country, rule),
    }
  }

  if (db.defaults && db.defaults.wdo && db.defaults.win) {
    return {
      wdo: db.defaults.wdo,
      win: db.defaults.win,
      matrixKey: db.defaults.matrixKey || 'DEFAULT',
      canonicalKey: 'DEFAULT',
      source: 'rule',
    }
  }

  return null
}
