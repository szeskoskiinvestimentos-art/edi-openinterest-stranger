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
    params.env('OPTIONS_UNIFIED_DASHBOARD_DIR', path.resolve(params.projectRoot, '..', 'dashboard_unificado')),
  )
  let optionsDashboardDir = optionsFallback
  try {
    optionsDashboardDir = requireInsideWorkspace('OPTIONS_UNIFIED_DASHBOARD_DIR', optionsCandidate)
  } catch {
    optionsDashboardDir = optionsFallback
  }
  const outDirWdo = path.join(optionsDashboardDir, 'WDO', 'assets', 'data')
  const outDirWin = path.join(optionsDashboardDir, 'WIN', 'assets', 'data')
  await mkdir(outDirWdo, { recursive: true })
  await mkdir(outDirWin, { recursive: true })

  const today = ymdUtc(new Date())
  const force = params.envBool('YAHOO_USD_OPTIONS_FORCE_REFRESH', false)
  const defaultMinOi = Math.max(0, Number(params.env('YAHOO_USD_OPTIONS_DEFAULT_MIN_OI', '0')) || 0)

  const items = [
    { ticker: 'USDU', baseName: 'yahoo_usdu_options', windowKey: 'yahooUsduOptionsData', targets: ['WDO'] },
    { ticker: 'UUP', baseName: 'yahoo_uup_options', windowKey: 'yahooUupOptionsData', targets: ['WDO'] },
    { ticker: 'EWZ', baseName: 'yahoo_ewz_options', windowKey: 'yahooEwzOptionsData', targets: ['WDO', 'WIN'] },
  ] as const

  for (const it of items) {
    const outDirs = it.targets.map(d => (d === 'WIN' ? outDirWin : outDirWdo))
    const jsonPaths = outDirs.map(d => path.join(d, `${it.baseName}.json`))
    const needsUpdate: boolean[] = []
    for (const jsonPath of jsonPaths) {
      if (force) {
        needsUpdate.push(true)
        continue
      }
      if (!(await fileExists(jsonPath))) {
        needsUpdate.push(true)
        continue
      }
      try {
        const existing = JSON.parse(await readFile(jsonPath, 'utf-8')) as any
        const cap = existing && typeof existing.captured_at_utc === 'string' ? existing.captured_at_utc : null
        if (!cap) {
          needsUpdate.push(true)
          continue
        }
        const day = ymdUtc(new Date(cap))
        needsUpdate.push(day !== today)
      } catch {
        needsUpdate.push(true)
      }
    }
    if (!needsUpdate.some(Boolean)) continue

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
      const beta =
        it.ticker === 'USDU' || it.ticker === 'UUP'
          ? await computeUsdBrlBeta({ fetchJsonWithTimeout: params.fetchJsonWithTimeout }, it.ticker).catch(() => null)
          : null
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
      for (let i = 0; i < outDirs.length; i++) {
        if (!needsUpdate[i]) continue
        await params.writeJsonAndJs(outDirs[i], it.baseName, it.windowKey, payload)
      }
      log(`OK • ${it.baseName}.json (vencimentos=${chain.expiries.length})`)
    } catch (e) {
      warn(`WARN • Falha ao atualizar ${it.baseName}: ${String(e instanceof Error ? e.message : e)}`)
    }
  }
}
