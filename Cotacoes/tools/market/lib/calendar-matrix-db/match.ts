import { calendarCountryFromCurrency } from './countries.js'
import { matchRegex, scoreIncludes } from './matchers.js'
import { pickReportRequest } from './reports.js'
import type { CalendarMatrixDbs, CalendarMatrixDbEvent, CalendarMatrixMatch } from './types.js'

export function matchCalendarMatrix(dbs: CalendarMatrixDbs | null | undefined, currency: string, eventName: string): CalendarMatrixMatch | null {
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
    const regexOk = ev.match && Array.isArray(ev.match.regex) && ev.match.regex.length ? matchRegex(raw, ev.match.regex) : false
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
