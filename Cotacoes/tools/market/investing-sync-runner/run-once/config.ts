import path from 'node:path'

import { fileExists } from '../../lib/io.js'
import { env, envBool, envNumber, parseList } from '../../lib/investing-sync/env.js'
import { diScheduleIntervalMinutes, shouldRunDiCatchUpAfterClose } from '../../lib/investing-sync/schedule.js'
import { getLastCalendarAttempt, getLastDiUpdatedAt, getLastPortfolioUpdatedAt } from '../../lib/investing-sync/state.js'
import type { CsvValidation } from '../../lib/investing-sync/types.js'
import { defaultAutomationDir, PROJECT_ROOT, requireInsideWorkspace, resolveFromBase, resolveFromProject } from '../paths.js'

export async function buildRunOnceConfig(modeRaw: string) {
  const mode = String(modeRaw || 'once').toLowerCase()
  const startedAt = new Date().toISOString()
  const baseDir = requireInsideWorkspace('MARKET_AUTOMATION_DIR', resolveFromProject(env('MARKET_AUTOMATION_DIR', defaultAutomationDir())))
  const userDataDir = requireInsideWorkspace(
    'INVESTING_USER_DATA_DIR',
    resolveFromBase(baseDir, env('INVESTING_USER_DATA_DIR', path.join(baseDir, 'investing-profile'))),
  )
  const downloadDir = requireInsideWorkspace(
    'INVESTING_DOWNLOAD_DIR',
    resolveFromBase(baseDir, env('INVESTING_DOWNLOAD_DIR', path.join(baseDir, 'downloads'))),
  )
  const debugDir = path.join(baseDir, 'logs')

  const outDir = requireInsideWorkspace(
    'MARKET_OUT_DIR',
    resolveFromProject(env('MARKET_OUT_DIR', path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'assets', 'data'))),
  )
  const intervalMinutes = envNumber('MARKET_INTERVAL_MINUTES', 15)
  const retentionDays = envNumber('MARKET_RETENTION_DAYS', 5)

  const enableDiBase = envBool('INFOMONEY_DI_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'di')
  const enableCalendarBase =
    envBool('INVESTING_CALENDAR_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'calendar')
  const enablePortfolioBase =
    envBool('INVESTING_PORTFOLIO_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'portfolio')
  let enablePortfolio = enablePortfolioBase
  const exportRequired = envBool('INVESTING_EXPORT_REQUIRED', true)
  const headless = envBool('INVESTING_HEADLESS', true)
  const updateReason = String(env('MARKET_UPDATE_REASON', '') || '').toLowerCase()

  const applySchedule = (mode === 'once' || mode === 'all') && updateReason === 'schedule'
  const now = new Date()
  const nowMs = now.getTime()

  if (applySchedule && enablePortfolioBase) {
    const portfolioIntervalMinutes = envNumber('INVESTING_PORTFOLIO_INTERVAL_MINUTES', intervalMinutes)
    const portfolioIntervalMs = Math.max(5, portfolioIntervalMinutes) * 60 * 1000
    const hasQuotesFile = await fileExists(path.join(outDir, 'market_quotes.json'))
    const lastPortfolioUpdatedAt = hasQuotesFile ? await getLastPortfolioUpdatedAt(outDir) : null
    if (hasQuotesFile && lastPortfolioUpdatedAt && nowMs - lastPortfolioUpdatedAt < portfolioIntervalMs) {
      enablePortfolio = false
    }
  }

  let enableDi = enableDiBase
  if (applySchedule && enableDiBase) {
    const diInterval = diScheduleIntervalMinutes(now)
    if (!diInterval) {
      const lastDiUpdatedAt = await getLastDiUpdatedAt(outDir)
      enableDi = shouldRunDiCatchUpAfterClose(now, lastDiUpdatedAt)
    } else {
      const lastDiUpdatedAt = await getLastDiUpdatedAt(outDir)
      if (lastDiUpdatedAt && nowMs - lastDiUpdatedAt < diInterval * 60 * 1000) enableDi = false
    }
  }

  let enableCalendar = enableCalendarBase
  if (applySchedule && enableCalendarBase) {
    const last = await getLastCalendarAttempt(outDir)
    const interval = last.status && last.status !== 'ok' ? 360 : last.unchanged ? 360 : 60
    if (last.attemptedAt && nowMs - last.attemptedAt < interval * 60 * 1000) enableCalendar = false
  }

  const portfolioUrl =
    env('INVESTING_PORTFOLIO_URL') || 'https://br.investing.com/portfolio/?portfolioID=ZWY2YGY0Mmo3YWFsZjc1NA%3D%3D'

  const csvValidation: CsvValidation = {
    enabled: envBool('INVESTING_CSV_VALIDATE', true),
    minBytes: Math.max(256, envNumber('INVESTING_CSV_MIN_BYTES', 2048)),
    minRows: Math.max(5, envNumber('INVESTING_CSV_MIN_ROWS', 50)),
  }

  const seedEnabled = envBool('INVESTING_SEED_FROM_LAST_CSV', true)
  const maxAgeHours = Math.max(1, envNumber('INVESTING_SEED_MAX_AGE_HOURS', 72))
  const searchDirs = parseList(env('INVESTING_SEED_SEARCH_DIRS'))
  const seedDirs = (searchDirs.length ? searchDirs : [downloadDir, PROJECT_ROOT])
    .map(d => {
      try {
        const candidate = path.isAbsolute(d) ? d : resolveFromProject(d)
        return requireInsideWorkspace('INVESTING_SEED_DIR', candidate)
      } catch {
        return null
      }
    })
    .filter(Boolean) as string[]

  return {
    mode,
    startedAt,
    baseDir,
    userDataDir,
    downloadDir,
    debugDir,
    outDir,
    intervalMinutes,
    retentionDays,
    exportRequired,
    headless,
    enablePortfolioBase,
    enablePortfolio,
    enableDiBase,
    enableDi,
    enableCalendarBase,
    enableCalendar,
    applySchedule,
    now,
    nowMs,
    portfolioUrl,
    csvValidation,
    seed: { enabled: seedEnabled, maxAgeHours, dirs: seedDirs },
  }
}
