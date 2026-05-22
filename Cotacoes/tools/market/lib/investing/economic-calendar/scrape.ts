import { matchCalendarMatrix, type CalendarMatrixDbs, type CalendarMatrixReportRequest } from '../../calendar-matrix-db.js'
import { scrapeCalendarWidget, type InvestingBrowserConfig } from '../calendar-widget.js'
import type { EconomicCalendarItem, EconomicCalendarPayload } from './types.js'
import { buildMacroReactions, impactFromImportance } from './reactions.js'

export async function scrapeEconomicCalendarFromInvestingWidget(params: {
  url: string
  debugDir: string
  headless: boolean
  userDataDir?: string
  browser: InvestingBrowserConfig
  matrixDbs?: CalendarMatrixDbs | null
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
    warn(`WARN • Calendário Investing indisponível: ${String(e instanceof Error ? e.message : e)}`)
    return { cloudflare: false, items: [] }
  }

  if (!extracted.length) {
    warn('WARN • Calendário Investing: não consegui extrair linhas.')
    return { cloudflare: false, items: [] }
  }

  const requestedReports: CalendarMatrixReportRequest[] = []
  let mapped = 0

  const items: EconomicCalendarItem[] = extracted
    .map(x => {
      const importance = Number.isFinite(x.importance) ? x.importance : 0
      const impact = impactFromImportance(importance)
      const fromDb = matchCalendarMatrix(params.matrixDbs, x.currency, x.event)
      const reactions = fromDb ? { wdo: fromDb.wdo, win: fromDb.win } : buildMacroReactions(x.currency, x.event)
      const id = `${x.currency}_${x.time}_${x.event}`.replace(/[^\w.-]+/g, '_').slice(0, 140)
      if (fromDb) {
        mapped++
        if (fromDb.reportRequest) requestedReports.push(fromDb.reportRequest)
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

  const matrixMeta = { mapped, total: extracted.length, requestedReports }
  return { cloudflare: false, items, matrixMeta }
}

