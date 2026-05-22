import path from 'node:path'
import {
  scrapeEconomicCalendarFromInvestingWidget,
  writeEconomicCalendar,
  type EconomicCalendarItem,
  type EconomicCalendarPayload,
} from '../../investing/economic-calendar.js'
import type { BrowserConfig, CalendarSummary } from '../types.js'
import { readJsonSafe } from '../state.js'

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
    summary.status = 'fail'
    summary.error = summary.error || 'Calendário Investing: lista vazia'
    await writeEconomicCalendar({
      outDir: params.outDir,
      items: [],
      keepLastOnEmpty: params.keepLastOnEmpty,
      meta: { status: 'fail', error: summary.error },
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
