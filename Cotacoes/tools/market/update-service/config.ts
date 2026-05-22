import path from 'node:path'

import { normalizeHttpUrl, parseList } from '../lib/update-service/config-helpers.js'
import { defaultAutomationDir, requireInsideWorkspace, resolveFromProject, resolveFromWorkspace, WORKSPACE_ROOT } from './paths.js'

export type MarketServiceConfig = {
  host: string
  port: number
  intervalMinutes: number
  intervalMs: number
  manualCooldownMinutes: number
  manualCooldownMs: number
  updateMode: string
  baseDir: string
  logsDir: string
  marketUpdateLogRetentionDays: number
  gitSync: {
    enabled: boolean
    push: boolean
    remote: string
    remoteUrl?: string
    branch?: string
    repoDir?: string
    targetDir: string
  }
  sourceDataDir: string
  validate: {
    beforeGitSync: boolean
    strict: boolean
  }
  updateTimeoutMinutes: number
  optionsDashboardDir: string
  news: {
    financialJuiceUrl: string
    maxItems: number
    cacheSeconds: number
    headlinesRetentionDays: number
    headlinesStoreEnabled: boolean
    headlinesStoreFile: string
    webEnabled: boolean
    webWindowHours: number
    webMaxItems: number
    webCacheSeconds: number
    webRssUrls: string[]
  }
  telegram: {
    enabled: boolean
    botToken: string
    chatId: string
    operationalEnabled: boolean
    operationalSendOn: string
    operationalCooldownMinutes: number
    operationalThreadId: number | null
    financialJuicePollSeconds: number
  }
  scheduler: {
    scheduleMode: string
    enabled: boolean
    runOnStart: boolean
  }
}

export function loadMarketServiceConfig(deps: {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
  envIntOrNull: (name: string) => number | null
}) {
  const base = buildBaseConfig(deps)
  return {
    ...base,
    gitSync: buildGitSyncConfig(deps),
    news: buildNewsConfig(deps),
    telegram: buildTelegramConfig(deps),
    scheduler: buildSchedulerConfig(deps),
  }
}

function lower(v: string) {
  return v.toLowerCase()
}

function clampMin(min: number, v: number) {
  return Math.max(min, v)
}

function buildBaseConfig(deps: {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
}) {
  const host = deps.env('MARKET_SERVICE_HOST', '127.0.0.1') || '127.0.0.1'
  const port = deps.envNumber('MARKET_SERVICE_PORT', 3033)

  const intervalMinutes = deps.envNumber('MARKET_INTERVAL_MINUTES', 15)
  const intervalMs = clampMin(5, intervalMinutes) * 60 * 1000

  const manualCooldownMinutes = deps.envNumber('MARKET_MANUAL_COOLDOWN_MINUTES', intervalMinutes)
  const manualCooldownMs = clampMin(1, manualCooldownMinutes) * 60 * 1000

  const updateMode = lower(String(deps.env('MARKET_UPDATE_MODE', 'once') || 'once'))

  const baseDir = requireInsideWorkspace('MARKET_AUTOMATION_DIR', resolveFromProject(deps.env('MARKET_AUTOMATION_DIR', defaultAutomationDir())))
  const logsDir = path.join(baseDir, 'logs')

  const marketUpdateLogRetentionDays = clampMin(1, deps.envNumber('MARKET_UPDATE_LOG_RETENTION_DAYS', 10))
  const updateTimeoutMinutes = clampMin(3, deps.envNumber('MARKET_UPDATE_TIMEOUT_MINUTES', 25))

  const sourceDataDir = deps.env('MARKET_SOURCE_DATA_DIR', 'dashboard/MERCADO/assets/data') || 'dashboard/MERCADO/assets/data'
  requireInsideWorkspace('MARKET_SOURCE_DATA_DIR', resolveFromProject(sourceDataDir))

  const validateBeforeGitSync = deps.envBool('MARKET_VALIDATE_BEFORE_GIT_SYNC', true)
  const validateStrict = deps.envBool('MARKET_VALIDATE_STRICT', false)

  const optionsDashboardDir = requireInsideWorkspace(
    'OPTIONS_UNIFIED_DASHBOARD_DIR',
    resolveFromProject(deps.env('OPTIONS_UNIFIED_DASHBOARD_DIR', path.resolve(WORKSPACE_ROOT, 'dashboard_unificado'))),
  )

  return {
    host,
    port,
    intervalMinutes,
    intervalMs,
    manualCooldownMinutes,
    manualCooldownMs,
    updateMode,
    baseDir,
    logsDir,
    marketUpdateLogRetentionDays,
    sourceDataDir,
    validate: { beforeGitSync: validateBeforeGitSync, strict: validateStrict },
    updateTimeoutMinutes,
    optionsDashboardDir,
  } satisfies Omit<MarketServiceConfig, 'gitSync' | 'news' | 'telegram' | 'scheduler'>
}

function buildGitSyncConfig(deps: {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
}) {
  const enabled = deps.envBool('MARKET_GIT_SYNC_ENABLED', true)
  const push = deps.envBool('MARKET_GIT_SYNC_PUSH', true)
  const remote = deps.env('MARKET_GIT_SYNC_REMOTE', 'origin') || 'origin'
  const remoteUrl = deps.env('MARKET_GIT_SYNC_REMOTE_URL')
  const branch = deps.env('MARKET_GIT_SYNC_BRANCH')
  const repoDir = deps.env('MARKET_GIT_SYNC_REPO_DIR')
  const targetDir = deps.env('MARKET_GIT_SYNC_TARGET_DIR', '') || ''
  if (repoDir) requireInsideWorkspace('MARKET_GIT_SYNC_REPO_DIR', resolveFromWorkspace(repoDir))
  if (targetDir) requireInsideWorkspace('MARKET_GIT_SYNC_TARGET_DIR', resolveFromWorkspace(targetDir))

  return {
    enabled,
    push,
    remote,
    remoteUrl,
    branch,
    repoDir,
    targetDir,
  } satisfies MarketServiceConfig['gitSync']
}

const defaultWebRssUrls = [
  'https://news.google.com/rss/search?q=Fed%20inflation%20Treasury%20yields%20Dollar%20DXY&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=global%20markets%20risk%20on%20risk%20off%20credit%20spreads&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=Brazil%20fiscal%20Congress%20Haddad%20Lula%20Copom%20BCB&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  'https://news.google.com/rss/search?q=oil%20OPEC%20Brent%20WTI%20supply%20geopolitics&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=iron%20ore%20China%20steel%20property&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=soybeans%20corn%20coffee%20sugar%20weather%20South%20America&hl=en-US&gl=US&ceid=US:en',
]

function buildNewsConfig(deps: {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
}) {
  const financialJuiceUrl = normalizeHttpUrl(
    deps.env('NEWS_FINANCIALJUICE_URL', 'https://www.financialjuice.com/home'),
    'https://www.financialjuice.com/home',
  )
  const maxItems = deps.envNumber('NEWS_MAX_ITEMS', 25)
  const cacheSeconds = deps.envNumber('NEWS_CACHE_SECONDS', 15)
  const headlinesRetentionDays = clampMin(1, deps.envNumber('NEWS_HEADLINES_RETENTION_DAYS', 2))
  const headlinesStoreEnabled = deps.envBool('NEWS_HEADLINES_STORE_ENABLED', true)
  const headlinesStoreFile = deps.env('NEWS_HEADLINES_STORE_FILE', '') || ''
  if (headlinesStoreFile) requireInsideWorkspace('NEWS_HEADLINES_STORE_FILE', resolveFromWorkspace(headlinesStoreFile))

  const webEnabled = deps.envBool('NEWS_WEB_ENABLED', true)
  const webWindowHours = clampMin(6, deps.envNumber('NEWS_WEB_WINDOW_HOURS', 24))
  const webMaxItems = clampMin(5, deps.envNumber('NEWS_WEB_MAX_ITEMS', 40))
  const webCacheSeconds = clampMin(15, deps.envNumber('NEWS_WEB_CACHE_SECONDS', 900))
  const webRssUrlsRaw = deps.env('NEWS_WEB_RSS_URLS', '') || ''
  const parsedWebRss = parseList(webRssUrlsRaw)
  const webRssUrls = parsedWebRss.length ? parsedWebRss : defaultWebRssUrls

  return {
    financialJuiceUrl,
    maxItems,
    cacheSeconds,
    headlinesRetentionDays,
    headlinesStoreEnabled,
    headlinesStoreFile,
    webEnabled,
    webWindowHours,
    webMaxItems,
    webCacheSeconds,
    webRssUrls,
  } satisfies MarketServiceConfig['news']
}

function buildTelegramConfig(deps: {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
  envIntOrNull: (name: string) => number | null
}) {
  const enabled = deps.envBool('TELEGRAM_ENABLED', true)
  const botToken = deps.env('TELEGRAM_BOT_TOKEN', '') || ''
  const chatId = deps.env('TELEGRAM_CHAT_ID', '') || ''
  const operationalEnabled = deps.envBool('TELEGRAM_OPERATIONAL_ENABLED', false)
  const operationalSendOn = lower(String(deps.env('TELEGRAM_OPERATIONAL_SEND_ON', 'manual') || 'manual'))
  const operationalCooldownMinutes = clampMin(1, deps.envNumber('TELEGRAM_OPERATIONAL_COOLDOWN_MINUTES', 45))
  const operationalThreadId = deps.envIntOrNull('TELEGRAM_OPERATIONAL_THREAD_ID')
  const financialJuicePollSeconds = clampMin(15, deps.envNumber('TELEGRAM_FINANCIALJUICE_POLL_SECONDS', 120))

  return {
    enabled,
    botToken,
    chatId,
    operationalEnabled,
    operationalSendOn,
    operationalCooldownMinutes,
    operationalThreadId,
    financialJuicePollSeconds,
  } satisfies MarketServiceConfig['telegram']
}

function buildSchedulerConfig(deps: {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
}) {
  const scheduleMode = lower(String(deps.env('MARKET_SCHEDULE_MODE', 'interval') || 'interval'))
  const enabled = deps.envBool('MARKET_SCHEDULER_ENABLED', true)
  const runOnStart = deps.envBool('MARKET_RUN_ON_START', enabled)
  return { scheduleMode, enabled, runOnStart } satisfies MarketServiceConfig['scheduler']
}
