import {
  calendarCountryFromCurrency,
  matchCalendarMatrix,
  type CalendarMatrixDbs,
  type CalendarMatrixReportRequest,
} from '../../calendar-matrix-db.js'
import { scrapeCalendarWidget, type InvestingBrowserConfig } from '../calendar-widget.js'
import { extractCalendarWidgetRowsFromHtml } from '../calendar-widget/html-extract.js'
import type { EconomicCalendarItem, EconomicCalendarPayload } from './types.js'
import { buildMacroReactions, impactFromImportance } from './reactions.js'

export async function scrapeEconomicCalendarFromInvestingWidget(params: {
  url: string
  debugDir: string
  headless: boolean
  userDataDir?: string
  browser: InvestingBrowserConfig
  matrixDbs?: CalendarMatrixDbs | null
  fetchTextWithTimeout?: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
  log?: (line: string) => void
  warn?: (line: string) => void
}): Promise<{ cloudflare: boolean; items: EconomicCalendarItem[]; matrixMeta?: EconomicCalendarPayload['meta']['matrix'] }> {
  const warn = params.warn || (() => void 0)
  const log = params.log || (() => void 0)

  let extracted: Array<{ time: string; currency: string; importance: number; event: string; actual: string; forecast: string; previous: string }> =
    []
  try {
    const result = await scrapeCalendarWidget({
      url: params.url,
      debugDir: params.debugDir,
      headless: params.headless,
      userDataDir: params.userDataDir,
      browser: params.browser,
      log,
    })
    if (result.cloudflare) {
      warn(
        'WARN • Calendário Investing bloqueado por challenge (Cloudflare). Rode "npm run market:calendar-login" para liberar o profile e depois atualize novamente.',
      )
      return { cloudflare: true, items: [] }
    }
    extracted = result.rows
  } catch (e) {
    warn(`WARN • Calendário Investing indisponível (browser): ${String(e instanceof Error ? e.message : e)}`)
  }

  if (!extracted.length) {
    if (typeof params.fetchTextWithTimeout === 'function') {
      try {
        const html = await params.fetchTextWithTimeout(params.url, 12000, {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.6,en;q=0.4',
        })
        extracted = extractCalendarWidgetRowsFromHtml(html)
        if (extracted.length) {
          warn('WARN • Calendário Investing: fallback via fetch HTML (sem browser).')
        }
      } catch (e) {
        warn(`WARN • Calendário Investing indisponível (fetch): ${String(e instanceof Error ? e.message : e)}`)
      }
    }
  }

  if (!extracted.length) {
    warn('WARN • Calendário Investing: não consegui extrair linhas.')
    return { cloudflare: false, items: [] }
  }

  const requestedReports: CalendarMatrixReportRequest[] = []
  const requestedSeen = new Set<string>()
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

  const items: EconomicCalendarItem[] = extracted
    .map(x => {
      const importance = Number.isFinite(x.importance) ? x.importance : 0
      const impact = impactFromImportance(importance)
      const fromDb = matchCalendarMatrix(params.matrixDbs, x.currency, x.event)
      const reactions = fromDb ? { wdo: fromDb.wdo, win: fromDb.win } : buildMacroReactions(x.currency, x.event)
      const id = `${x.currency}_${x.time}_${x.event}`.replace(/[^\w.-]+/g, '_').slice(0, 140)
      if (fromDb) {
        mapped++
        if (fromDb.reportRequest) {
          const k = `${fromDb.reportRequest.country}::${fromDb.reportRequest.key}`
          if (!requestedSeen.has(k)) {
            requestedSeen.add(k)
            requestedReports.push(fromDb.reportRequest)
          }
        }
      } else {
        const country = calendarCountryFromCurrency(x.currency)
        if (country && params.matrixDbs && (params.matrixDbs as CalendarMatrixDbs)[country]) {
          const n = norm(x.event)
          const k = `${country}::${n}`
          unmappedCount[k] = (unmappedCount[k] || 0) + 1
          if (!unmappedSample[k]) unmappedSample[k] = x.event
        }
      }
      const mappedBy: EconomicCalendarItem['mappedBy'] = fromDb ? fromDb.source : 'fallback'
      return {
        id,
        time: x.time,
        currency: x.currency,
        impact,
        event: `${x.currency} • ${x.event}`,
        actual: x.actual || undefined,
        forecast: x.forecast || undefined,
        previous: x.previous || undefined,
        wdo: reactions.wdo,
        win: reactions.win,
        ...(fromDb ? { matrixKey: fromDb.matrixKey, canonicalKey: fromDb.canonicalKey } : {}),
        mappedBy,
      }
    })
    .filter(x => x.event && x.time)

  const unmappedTop = Object.entries(unmappedCount)
    .map(([k, count]) => {
      const [country] = k.split('::')
      const normalizedEvent = k.split('::').slice(1).join('::')
      const sug = buildSuggestion(normalizedEvent)
      return { country, sampleEvent: unmappedSample[k] || '', count, ...sug }
    })
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country) || a.sampleEvent.localeCompare(b.sampleEvent))
    .slice(0, 12)

  const matrixMeta = { mapped, total: extracted.length, requestedReports, ...(unmappedTop.length ? { unmappedTop } : {}) }
  return { cloudflare: false, items, matrixMeta }
}
