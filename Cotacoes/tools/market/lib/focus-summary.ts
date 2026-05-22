import type { FocusSummaryPayload, FocusYearPack } from './focus-summary/types.js'
import { readFocusCache, cachedPublishedYmd } from './focus-summary/cache.js'
import { canAttemptAfterRelease, isPrimaryUpdateWindow, lastPublishedMondayYmd, tzParts } from './focus-summary/time.js'
import { buildDerived } from './focus-summary/derive.js'
import { buildYearPack, fetchFocusReportMeta, normalizeReportMetaFallback } from './focus-summary/bcb.js'

export async function buildFocusSummaryFromBcb(params: {
  outDir: string
  fetchJsonWithTimeout: <T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}): Promise<FocusSummaryPayload> {
  const baseUrl = 'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais'
  const focusPageUrl = 'https://www.bcb.gov.br/publicacoes/focus'
  const generatedAt = new Date().toISOString()
  const now = new Date()
  const years = [now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + 2, now.getFullYear() + 3].map(y => String(y))
  const spNow = tzParts(now)
  const cached = await readFocusCache(params.outDir)
  const lastMonday = lastPublishedMondayYmd({ now, spNow })
  const cachedPub = cachedPublishedYmd(cached)
  const hasCurrentWeek = Boolean(cachedPub && cachedPub === lastMonday)
  const hasAllYearsInCache =
    !!cached &&
    cached.ok === true &&
    typeof cached.years === 'object' &&
    cached.years !== null &&
    years.every(y => Object.prototype.hasOwnProperty.call(cached.years, y))
  const mustCatchUp = canAttemptAfterRelease(spNow) && (!hasCurrentWeek || !hasAllYearsInCache)
  if (!isPrimaryUpdateWindow(spNow) && !mustCatchUp) {
    if (cached) return cached
    return {
      ok: false,
      generatedAt,
      provider: 'bcb_olinda_expectativas',
      message: 'Fora da janela de atualização do Focus (seg 08:30-09:00) e sem coleta pendente na semana.',
      source: { pageUrl: focusPageUrl, pdfUrl: null, datasetUrl: baseUrl, cutoffDate: null, publishedAt: null },
    }
  }

  const reportBase = await fetchFocusReportMeta({ focusPageUrl, fetchTextWithTimeout: params.fetchTextWithTimeout })
  const report = normalizeReportMetaFallback(now, reportBase)

  try {
    const entries = await Promise.all(
      years.map(async y => [
        y,
        await buildYearPack({ baseUrl, year: y, cutoffDate: report.cutoffDate, fetchJsonWithTimeout: params.fetchJsonWithTimeout }),
      ] as const),
    )
    const yearsObj = Object.fromEntries(entries) as Record<string, FocusYearPack>
    const derived = buildDerived({ years: yearsObj, yearsList: years })

    return {
      ok: true,
      generatedAt,
      provider: 'bcb_olinda_expectativas',
      source: { pageUrl: report.pageUrl, pdfUrl: report.pdfUrl, datasetUrl: baseUrl, cutoffDate: report.cutoffDate, publishedAt: report.publishedAt },
      years: yearsObj,
      derived,
    }
  } catch (e) {
    if (cached && cached.ok === true) return cached
    return {
      ok: false,
      generatedAt,
      provider: 'bcb_olinda_expectativas',
      message: `Falha ao buscar Boletim Focus (Olinda): ${String(e instanceof Error ? e.message : e)}`,
      source: { pageUrl: report.pageUrl, pdfUrl: report.pdfUrl, datasetUrl: baseUrl, cutoffDate: report.cutoffDate, publishedAt: report.publishedAt },
    }
  }
}
