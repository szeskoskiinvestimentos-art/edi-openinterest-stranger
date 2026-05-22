import { mkdir } from 'node:fs/promises'
import { findLatestCsvInDirs, validateInvestingCsvOrThrow } from '../../investing/portfolio-csv.js'
import { clickExportAndDownloadCsv } from '../../investing/portfolio-export.js'
import { buildMarketHistory } from '../../../market-history.js'
import type { BrowserConfig, CsvValidation, PortfolioSummary } from '../types.js'

export async function runPortfolioStep(params: {
  enabled: boolean
  envEnabled: boolean
  mode: string
  url: string
  userDataDir: string
  downloadDir: string
  debugDir: string
  headless: boolean
  browser: BrowserConfig
  outDir: string
  intervalMinutes: number
  retentionDays: number
  csvValidation: CsvValidation
  seed: {
    enabled: boolean
    maxAgeHours: number
    dirs: string[]
  }
  log: (line: string) => void
}): Promise<{ summary: PortfolioSummary; csvPath: string | null; error: unknown | null }> {
  const summary: PortfolioSummary = {
    enabled: params.enabled,
    status: params.enabled ? 'fail' : 'skip',
    csvPath: null,
  }

  if (!params.enabled) {
    if (!params.envEnabled) {
      process.stdout.write('SKIP • Portfolio Investing desativado (INVESTING_PORTFOLIO_ENABLED=false)\n')
    } else {
      process.stdout.write(`SKIP • Portfolio Investing (modo ${params.mode})\n`)
    }
    summary.status = 'skip'
    return { summary, csvPath: null, error: null }
  }

  let csvPath: string | null = null
  let portfolioError: unknown = null

  try {
    await mkdir(params.downloadDir, { recursive: true })
    await mkdir(params.debugDir, { recursive: true })

    csvPath = await clickExportAndDownloadCsv({
      url: params.url,
      userDataDir: params.userDataDir,
      downloadDir: params.downloadDir,
      debugDir: params.debugDir,
      headless: params.headless,
      browser: params.browser,
      log: params.log,
    })

    await validateInvestingCsvOrThrow(csvPath, params.csvValidation)
    await buildMarketHistory({
      csvPath,
      outDir: params.outDir,
      intervalMinutes: params.intervalMinutes,
      retentionDays: params.retentionDays,
      timestamp: new Date().toISOString(),
    })

    summary.status = 'ok'
    summary.csvPath = csvPath
    summary.method = 'investing'
    return { summary, csvPath, error: null }
  } catch (e) {
    portfolioError = e
    summary.status = 'fail'
    summary.error = String(e instanceof Error ? e.message : e)
    process.stderr.write(`WARN • Falha ao exportar CSV do Investing: ${summary.error}\n`)
  }

  if (!params.seed.enabled) {
    return { summary, csvPath: null, error: portfolioError }
  }

  const maxAgeHours = Math.max(1, params.seed.maxAgeHours)
  const now = Date.now()
  const latest = await findLatestCsvInDirs(params.seed.dirs)
  const ageMs = latest ? now - latest.mtimeMs : null
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000

  if (!(latest && ageMs !== null && ageMs >= 0 && ageMs <= maxAgeMs)) {
    const hint = latest ? `${latest.path}` : '(nenhum CSV encontrado)'
    process.stderr.write(`WARN • Seed indisponível (maxAgeHours=${maxAgeHours}) • ${hint}\n`)
    return { summary, csvPath: null, error: portfolioError }
  }

  try {
    await validateInvestingCsvOrThrow(latest.path, params.csvValidation)
    await buildMarketHistory({
      csvPath: latest.path,
      outDir: params.outDir,
      intervalMinutes: params.intervalMinutes,
      retentionDays: params.retentionDays,
      timestamp: new Date().toISOString(),
    })
    summary.status = 'ok'
    summary.csvPath = latest.path
    summary.method = 'seed'
    summary.seedAgeMinutes = Math.round(ageMs / (60 * 1000))
    portfolioError = null
    process.stdout.write(`OK • Seed CSV=${latest.path}\n`)
    return { summary, csvPath: latest.path, error: null }
  } catch (seedErr) {
    process.stderr.write(`WARN • Seed falhou (CSV local): ${String(seedErr instanceof Error ? seedErr.message : seedErr)}\n`)
    return { summary, csvPath: null, error: portfolioError }
  }
}
