import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileExists } from './io.js'
import type { YahooCrumbSession } from './yahoo-usd-options/crumb.js'
import { getYahooCrumbSession, isLikelyInvalidCrumbError } from './yahoo-usd-options/crumb.js'
import { computeUsdBrlBeta, fetchYahooOptionsAllExpiries } from './yahoo-usd-options/fetch.js'
import { ymdUtc } from './yahoo-usd-options/utils.js'
import { requireInsideWorkspace } from '../update-service/paths.js'

export async function updateYahooUsdOptionsCaches(params: {
  projectRoot: string
  resolveFromProject: (p: string) => string
  env: (key: string, fallback?: string) => string
  envBool: (key: string, fallback: boolean) => boolean
  fetchJsonWithTimeout: <T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
  writeJsonAndJs: (outDir: string, baseName: string, windowKey: string, payload: unknown) => Promise<void>
  log?: (line: string) => void
  warn?: (line: string) => void
}) {
  const log = params.log || (() => void 0)
  const warn = params.warn || (() => void 0)

  const enabled = params.envBool('YAHOO_USD_OPTIONS_ENABLED', true)
  if (!enabled) return

  const optionsFallback = params.resolveFromProject(path.resolve(params.projectRoot, '..', 'dashboard_unificado'))
  const optionsCandidate = params.resolveFromProject(
    params.env('OPTIONS_UNIFIED_DASHBOARD_DIR', path.resolve(params.projectRoot, '..', 'B3_System', 'dashboard_unificado')),
  )
  let optionsDashboardDir = optionsFallback
  try {
    optionsDashboardDir = requireInsideWorkspace('OPTIONS_UNIFIED_DASHBOARD_DIR', optionsCandidate)
  } catch {
    optionsDashboardDir = optionsFallback
  }
  const outDir = path.join(optionsDashboardDir, 'WDO', 'assets', 'data')
  await mkdir(outDir, { recursive: true })

  const today = ymdUtc(new Date())
  const force = params.envBool('YAHOO_USD_OPTIONS_FORCE_REFRESH', false)
  const defaultMinOi = Math.max(0, Number(params.env('YAHOO_USD_OPTIONS_DEFAULT_MIN_OI', '0')) || 0)

  const items = [
    { ticker: 'USDU', baseName: 'yahoo_usdu_options', windowKey: 'yahooUsduOptionsData' },
    { ticker: 'UUP', baseName: 'yahoo_uup_options', windowKey: 'yahooUupOptionsData' },
  ] as const

  for (const it of items) {
    const jsonPath = path.join(outDir, `${it.baseName}.json`)
    if (!force && (await fileExists(jsonPath))) {
      try {
        const existing = JSON.parse(await readFile(jsonPath, 'utf-8')) as any
        const cap = existing && typeof existing.captured_at_utc === 'string' ? existing.captured_at_utc : null
        if (cap) {
          const day = ymdUtc(new Date(cap))
          if (day === today) continue
        }
      } catch {
        void 0
      }
    }

    try {
      let auth: YahooCrumbSession | null = null
      const tryChain = async () =>
        await fetchYahooOptionsAllExpiries({ fetchJsonWithTimeout: params.fetchJsonWithTimeout, env: params.env }, it.ticker, auth)
      let chain: Awaited<ReturnType<typeof fetchYahooOptionsAllExpiries>>
      try {
        chain = await tryChain()
      } catch (e) {
        if (isLikelyInvalidCrumbError(e)) {
          auth = await getYahooCrumbSession(12000)
          chain = await tryChain()
        } else {
          throw e
        }
      }
      const beta = await computeUsdBrlBeta({ fetchJsonWithTimeout: params.fetchJsonWithTimeout }, it.ticker).catch(() => null)
      const payload = {
        source: 'yahoo_finance',
        ticker_used: it.ticker,
        ticker_label: it.ticker,
        captured_at_utc: new Date().toISOString(),
        spot: chain.spot,
        min_open_interest: defaultMinOi,
        expiries: chain.expiries,
        by_expiry: chain.by_expiry,
        raw_rows_count: chain.raw_rows_count,
        usdbrl_beta: beta,
      }
      await params.writeJsonAndJs(outDir, it.baseName, it.windowKey, payload)
      log(`OK • ${it.baseName}.json (vencimentos=${chain.expiries.length})`)
    } catch (e) {
      warn(`WARN • Falha ao atualizar ${it.baseName}: ${String(e instanceof Error ? e.message : e)}`)
    }
  }
}
