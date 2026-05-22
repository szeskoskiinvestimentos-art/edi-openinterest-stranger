import { deriveForeignFlow } from './foreign-flow/derive.js'
import { readForeignFlowCache, localYmd } from './foreign-flow/cache.js'
import { extractDadosDeMercadoUpdatedAt, extractForeignFlowRowsFromHtml } from './foreign-flow/parse.js'
import type { ForeignFlowPayload } from './foreign-flow/types.js'

export async function buildForeignFlowFromScrape(params: {
  outDir: string
  env: (key: string, fallback?: string) => string
  envBool: (key: string, fallback: boolean) => boolean
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}): Promise<ForeignFlowPayload> {
  const enabled = params.envBool('DADOS_DE_MERCADO_FLOW_SCRAPE_ENABLED', true)
  const url = params.env('DADOS_DE_MERCADO_FLOW_URL', 'https://www.dadosdemercado.com.br/fluxo')
  const refreshHourRaw = Number(params.env('DADOS_DE_MERCADO_FLOW_REFRESH_HOUR', '6'))
  const refreshHour = Number.isFinite(refreshHourRaw) ? Math.max(0, Math.min(23, Math.floor(refreshHourRaw))) : 6
  const refreshMinuteRaw = Number(params.env('DADOS_DE_MERCADO_FLOW_REFRESH_MINUTE', '20'))
  const refreshMinute = Number.isFinite(refreshMinuteRaw) ? Math.max(0, Math.min(59, Math.floor(refreshMinuteRaw))) : 20
  const now = new Date()
  const generatedAt = now.toISOString()
  if (!enabled) {
    return { ok: false, generatedAt, provider: 'dadosdemercado_fluxo_scrape', message: 'Desabilitado', source: { url } }
  }

  const cached = await readForeignFlowCache(params.outDir)
  const nowYmd = localYmd(now)
  if (cached) {
    const beforeRefresh = now.getHours() < refreshHour || (now.getHours() === refreshHour && now.getMinutes() < refreshMinute)
    if (beforeRefresh) return cached.payload
    if (cached.ymd === nowYmd) {
      const cachedBeforeRefresh =
        cached.dt.getHours() < refreshHour || (cached.dt.getHours() === refreshHour && cached.dt.getMinutes() < refreshMinute)
      if (!cachedBeforeRefresh) {
        const hasUpdatedAt =
          cached.payload &&
          typeof cached.payload === 'object' &&
          (cached.payload as { ok?: unknown }).ok === true &&
          (cached.payload as { source?: unknown }).source &&
          typeof (cached.payload as { source?: { updatedAt?: unknown } }).source?.updatedAt === 'string'
        if (hasUpdatedAt) return cached.payload
      }
    }
  }

  try {
    const html = await params.fetchTextWithTimeout(url, 8000, { 'User-Agent': 'Mozilla/5.0' })
    const sourceUpdated = extractDadosDeMercadoUpdatedAt(html)
    const series = extractForeignFlowRowsFromHtml(html).slice(-420)
    if (!series.length) throw new Error('Tabela não encontrada ou vazia')
    const derived = deriveForeignFlow(series)
    if (!derived) throw new Error('Falha ao derivar série')

    return {
      ok: true,
      generatedAt,
      provider: 'dadosdemercado_fluxo_scrape',
      source: { url, updatedAt: sourceUpdated.updatedAt, updatedAtText: sourceUpdated.updatedAtText },
      latest: derived.latest,
      derived: derived.derived,
      signal: derived.signal,
      series,
    }
  } catch (e) {
    if (cached) return cached.payload
    return {
      ok: false,
      generatedAt,
      provider: 'dadosdemercado_fluxo_scrape',
      message: `Falha no scraping: ${String(e instanceof Error ? e.message : e)}`,
      source: { url },
    }
  }
}

