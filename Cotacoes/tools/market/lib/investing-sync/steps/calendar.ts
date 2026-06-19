import path from 'node:path'
import {
  scrapeEconomicCalendarFromInvestingWidget,
  writeEconomicCalendar,
  type EconomicCalendarItem,
  type EconomicCalendarPayload,
} from '../../investing/economic-calendar.js'
import {
  calendarCountryFromCurrency,
  matchCalendarMatrix,
  type CalendarMatrixDbs,
  type CalendarMatrixReportRequest,
} from '../../calendar-matrix-db.js'
import type { BrowserConfig, CalendarSummary } from '../types.js'
import { readJsonSafe } from '../state.js'

function remapWithMatrixDbs(items: EconomicCalendarItem[], matrixDbs: CalendarMatrixDbs | null | undefined) {
  const requestedReports: CalendarMatrixReportRequest[] = []
  const seenReq = new Set<string>()
  let mapped = 0
  const unmappedCount: Record<string, number> = {}
  const unmappedSample: Record<string, string> = {}

  const norm = (s: string) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const stop = new Set([
    'a',
    'anual',
    'ano',
    'anos',
    'ao',
    'aos',
    'as',
    'ata',
    'atas',
    'atual',
    'banco',
    'basico',
    'basica',
    'boletim',
    'cambio',
    'com',
    'confianca',
    'consumo',
    'da',
    'das',
    'de',
    'del',
    'des',
    'do',
    'dos',
    'e',
    'economic',
    'economica',
    'economico',
    'economy',
    'em',
    'estimativa',
    'final',
    'forecast',
    'fonte',
    'for',
    'from',
    'indice',
    'inventories',
    'inventario',
    'inventarios',
    'investment',
    'investing',
    'mensal',
    'mes',
    'meses',
    'no',
    'nos',
    'na',
    'nas',
    'of',
    'on',
    'para',
    'preliminar',
    'previous',
    'previa',
    'revisado',
    'revisao',
    'revision',
    'semanal',
    'semana',
    'semestre',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
    'janeiro',
    'fevereiro',
    'marco',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'the',
    'to',
    'trimestral',
    'trim',
    'uma',
    'um',
    'var',
    'variacao',
    'yoy',
    'mom',
  ])

  const escapeRx = (s: string) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pickTokens = (normalizedEvent: string) => {
    const parts = String(normalizedEvent || '').split(' ').filter(Boolean)
    const out: string[] = []
    for (const t of parts) {
      if (stop.has(t)) continue
      if (t.length >= 3 || /\d/.test(t)) out.push(t)
    }
    const uniq = Array.from(new Set(out))
    const score = (t: string) => {
      const digit = /\d/.test(t) ? 2 : 0
      const lettersDigits = /[a-z]+\d+/.test(t) ? 1 : 0
      return digit + lettersDigits + Math.min(10, t.length / 3)
    }
    uniq.sort((a, b) => score(b) - score(a) || b.length - a.length || a.localeCompare(b))
    return uniq.slice(0, 4)
  }
  const tokenToRegex = (t: string) => {
    const s = String(t || '')
    const m = s.match(/^([a-z]+)(\d+)$/)
    if (m) {
      const a = escapeRx(m[1])
      const d = escapeRx(m[2])
      return `\\b${a}\\s*-?\\s*${d}\\b`
    }
    return `\\b${escapeRx(s)}\\b`
  }
  const buildSuggestion = (normalizedEvent: string) => {
    const tokens = pickTokens(normalizedEvent)
    const suggestIncludes = tokens.join(' ')
    const suggestRegex = tokens.length ? tokens.map(tokenToRegex).join('.*') : ''
    return { suggestTokens: tokens, suggestIncludes, suggestRegex }
  }

  const remapped = items.map(it => {
    const cur = String(it && it.currency ? it.currency : '').toUpperCase()
    const full = String(it && it.event ? it.event : '')
    const rawEvent = full.includes(' • ') ? full.split(' • ').slice(1).join(' • ') : full
    const m = matchCalendarMatrix(matrixDbs, cur, rawEvent)
    if (!m) {
      const country = calendarCountryFromCurrency(cur)
      if (country && matrixDbs && matrixDbs[country]) {
        const n = norm(rawEvent)
        const k = `${country}::${n}`
        unmappedCount[k] = (unmappedCount[k] || 0) + 1
        if (!unmappedSample[k]) unmappedSample[k] = rawEvent
      }
      return { ...it, mappedBy: it.mappedBy || 'fallback' }
    }
    mapped += 1
    if (m.reportRequest) {
      const k = `${m.reportRequest.country}::${m.reportRequest.key}`
      if (!seenReq.has(k)) {
        seenReq.add(k)
        requestedReports.push(m.reportRequest)
      }
    }
    return {
      ...it,
      wdo: m.wdo,
      win: m.win,
      matrixKey: m.matrixKey,
      canonicalKey: m.canonicalKey,
      mappedBy: m.source,
    }
  })

  const unmappedTop = Object.entries(unmappedCount)
    .map(([k, count]) => {
      const [country] = k.split('::')
      const normalizedEvent = k.split('::').slice(1).join('::')
      const sug = buildSuggestion(normalizedEvent)
      return { country, sampleEvent: unmappedSample[k] || '', count, ...sug }
    })
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country) || a.sampleEvent.localeCompare(b.sampleEvent))
    .slice(0, 12)

  return {
    items: remapped,
    matrixMeta: { mapped, total: items.length, requestedReports, ...(unmappedTop.length ? { unmappedTop } : {}) },
  }
}

export async function runCalendarStep(params: {
  enabled: boolean
  outDir: string
  url: string
  debugDir: string
  headless: boolean
  userDataDir: string
  browser: BrowserConfig
  matrixDbs: unknown
  keepLastOnEmpty: boolean
  fetchTextWithTimeout?: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
  log: (line: string) => void
  warn: (line: string) => void
}): Promise<CalendarSummary> {
  const summary: CalendarSummary = { enabled: params.enabled, status: params.enabled ? 'fail' : 'skip', count: 0 }
  if (!params.enabled) return summary

  const calendarStatus: { cloudflare?: boolean; matrix?: EconomicCalendarPayload['meta']['matrix'] } = {}
  let calendar: EconomicCalendarItem[] = []

  try {
    const calRes = await scrapeEconomicCalendarFromInvestingWidget({
      url: params.url,
      debugDir: params.debugDir,
      headless: params.headless,
      userDataDir: params.userDataDir,
      browser: params.browser,
      matrixDbs: params.matrixDbs,
      fetchTextWithTimeout: params.fetchTextWithTimeout,
      log: params.log,
      warn: params.warn,
    })
    calendarStatus.cloudflare = calRes.cloudflare
    if (calRes.matrixMeta) calendarStatus.matrix = calRes.matrixMeta
    calendar = calRes.items
  } catch (e) {
    summary.status = 'fail'
    summary.error = String(e instanceof Error ? e.message : e)
    process.stderr.write(`WARN • Calendário Investing indisponível: ${summary.error}\n`)
  }

  summary.count = calendar.length

  if (calendarStatus.cloudflare) {
    summary.status = 'blocked'
    await writeEconomicCalendar({
      outDir: params.outDir,
      items: [],
      keepLastOnEmpty: params.keepLastOnEmpty,
      meta: { status: 'blocked' },
      warn: params.warn,
    })
    return summary
  }

  if (!calendar.length) {
    summary.error = summary.error || 'Calendário Investing: lista vazia'
    const prevPath = path.join(params.outDir, 'economic_calendar.json')
    const prev = await readJsonSafe<Partial<EconomicCalendarPayload>>(prevPath)
    const prevItems = prev && Array.isArray(prev.items) ? prev.items : []
    if (params.keepLastOnEmpty && prevItems.length) {
      summary.status = 'warn'
      summary.count = prevItems.length
      const remap = remapWithMatrixDbs(prevItems as EconomicCalendarItem[], params.matrixDbs as CalendarMatrixDbs | null)
      await writeEconomicCalendar({
        outDir: params.outDir,
        items: remap.items,
        keepLastOnEmpty: params.keepLastOnEmpty,
        meta: { status: summary.status, error: summary.error, matrix: remap.matrixMeta },
        warn: params.warn,
      })
      return summary
    } else {
      summary.status = 'fail'
    }
    await writeEconomicCalendar({
      outDir: params.outDir,
      items: [],
      keepLastOnEmpty: params.keepLastOnEmpty,
      meta: { status: summary.status, error: summary.error },
      warn: params.warn,
    })
    return summary
  }

  const prevPath = path.join(params.outDir, 'economic_calendar.json')
  const prev = await readJsonSafe<Partial<EconomicCalendarPayload>>(prevPath)
  const prevItems = prev && Array.isArray(prev.items) ? prev.items : []
  const normalize = (items: EconomicCalendarItem[]) => items.slice().sort((a, b) => a.id.localeCompare(b.id))
  const unchanged = prevItems.length
    ? JSON.stringify(normalize(prevItems as EconomicCalendarItem[])) === JSON.stringify(normalize(calendar))
    : false

  await writeEconomicCalendar({
    outDir: params.outDir,
    items: calendar,
    keepLastOnEmpty: params.keepLastOnEmpty,
    meta: { status: 'ok', unchanged, ...(calendarStatus.matrix ? { matrix: calendarStatus.matrix } : {}) },
    warn: params.warn,
  })

  summary.status = 'ok'
  process.stdout.write(`OK • CAL=${calendar.length} eventos (Investing)\n`)
  return summary
}
