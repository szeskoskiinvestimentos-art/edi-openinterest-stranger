import { loadCalendarMatrixDbs } from '../lib/calendar-matrix-db.js'
import { fetchJsonPostWithTimeout, fetchJsonWithTimeout, fetchTextWithTimeout } from '../lib/net.js'
import { env, envBool, envNumber, parseList } from '../lib/investing-sync/env.js'
import { runCalendarStep } from '../lib/investing-sync/steps/calendar.js'
import { runDiStep } from '../lib/investing-sync/steps/di.js'
import { runPortfolioStep } from '../lib/investing-sync/steps/portfolio.js'
import { runSinaDceI0Step } from '../lib/investing-sync/steps/sina.js'
import { runYahooStep } from '../lib/investing-sync/steps/yahoo.js'
import type { CsvValidation, UpdateSummary } from '../lib/investing-sync/types.js'
import { investingBrowserConfig } from './browser.js'
import { logStdout, writeSummary } from './log.js'
import { PROJECT_ROOT } from './paths.js'
import { buildRunOnceConfig } from './run-once/config.js'

export async function runOnce(modeRaw: string) {
  const cfg = await buildRunOnceConfig(modeRaw)
  const mode = cfg.mode
  const startedAt = cfg.startedAt
  const baseDir = cfg.baseDir
  const userDataDir = cfg.userDataDir
  const downloadDir = cfg.downloadDir
  const debugDir = cfg.debugDir
  const outDir = cfg.outDir
  const intervalMinutes = cfg.intervalMinutes
  const retentionDays = cfg.retentionDays
  const enablePortfolio = cfg.enablePortfolio
  const enablePortfolioBase = cfg.enablePortfolioBase
  const exportRequired = cfg.exportRequired
  const headless = cfg.headless
  const enableDiBase = cfg.enableDiBase
  const enableDi = cfg.enableDi
  const enableCalendarBase = cfg.enableCalendarBase
  const enableCalendar = cfg.enableCalendar
  const url = cfg.portfolioUrl

  if (!env('INVESTING_PORTFOLIO_URL')) {
    process.stdout.write('WARN • INVESTING_PORTFOLIO_URL não configurada, usando fallback /portfolio/\n')
  }

  const summary: UpdateSummary = {
    startedAt,
    finishedAt: startedAt,
    mode,
    outDir,
    portfolio: { enabled: enablePortfolio, status: enablePortfolio ? 'fail' : 'skip', csvPath: null },
    di: { enabled: enableDi, status: enableDi ? 'fail' : 'skip', count: 0 },
    calendar: { enabled: enableCalendar, status: enableCalendar ? 'fail' : 'skip', count: 0 },
  }

  let csvPath: string | null = null
  let portfolioError: unknown = null
  const matrixDbs = await loadCalendarMatrixDbs().catch(() => null)

  const csvValidation: CsvValidation = cfg.csvValidation

  const browserCfg = investingBrowserConfig()

  {
    const envEnabled = envBool('INVESTING_PORTFOLIO_ENABLED', true)
    const seedDirs = cfg.seed.dirs
    const seedEnabled = cfg.seed.enabled
    const maxAgeHours = cfg.seed.maxAgeHours

    const res = await runPortfolioStep({
      enabled: enablePortfolio,
      envEnabled,
      mode,
      url,
      userDataDir,
      downloadDir,
      debugDir,
      headless,
      browser: browserCfg,
      outDir,
      intervalMinutes,
      retentionDays,
      csvValidation,
      seed: { enabled: seedEnabled, maxAgeHours, dirs: seedDirs },
      log: logStdout,
    })

    summary.portfolio = res.summary
    csvPath = res.csvPath
    portfolioError = res.error
  }

  await runYahooStep({
    enabled: envBool('MARKET_YAHOO_ENABLED', false),
    outDir,
    maxSymbols: envNumber('MARKET_YAHOO_MAX_SYMBOLS', 320),
    timeoutMs: envNumber('MARKET_YAHOO_TIMEOUT_MS', 8000),
    headless,
    investingUserDataDir: userDataDir,
    debugDir,
    browser: browserCfg,
    deps: {
      env,
      envBool,
      envNumber,
      parseList,
      fetchJsonWithTimeout,
      fetchJsonPostWithTimeout,
    },
    log: logStdout,
  })

  await runSinaDceI0Step({
    enabled: envBool('SINA_DCE_IO_ENABLED', true),
    code: env('SINA_DCE_IO_CODE', 'nf_I0'),
    outDir,
    fetchTextWithTimeout,
  })

  if (enableDi) {
    summary.di = await runDiStep({
      enabled: true,
      baseDir,
      outDir,
      debugDir,
      headless,
      browser: browserCfg,
      log: logStdout,
      warn: line => process.stderr.write(`${line}\n`),
    })
  } else {
    if (enableDiBase) {
      process.stdout.write('SKIP • DI InfoMoney (intervalo por agendamento)\n')
    } else if (!envBool('INFOMONEY_DI_ENABLED', true)) {
      process.stdout.write('SKIP • DI InfoMoney desativado (INFOMONEY_DI_ENABLED=false)\n')
    } else {
      process.stdout.write(`SKIP • DI InfoMoney (modo ${mode})\n`)
    }
    summary.di.status = 'skip'
  }

  if (enableCalendar) {
    const calUrl =
      env('INVESTING_ECONOMIC_CALENDAR_URL') ||
      'https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone,timeselector,filters&countries=110,32,6,37,5,39,35,7,72&calType=day&timeZone=12&lang=12'
    const keepLastOnEmpty = envBool('INVESTING_CALENDAR_KEEP_LAST_ON_EMPTY', true)
    summary.calendar = await runCalendarStep({
      enabled: true,
      outDir,
      url: calUrl,
      debugDir,
      headless,
      userDataDir,
      browser: browserCfg,
      matrixDbs,
      keepLastOnEmpty,
      fetchTextWithTimeout,
      log: logStdout,
      warn: line => process.stdout.write(`${line}\n`),
    })
  } else {
    summary.calendar.status = 'skip'
  }

  summary.finishedAt = new Date().toISOString()
  writeSummary(summary)

  if (portfolioError && exportRequired) throw portfolioError

  process.stdout.write(`OK • CSV=${csvPath} • OUT=${outDir}\n`)
}
