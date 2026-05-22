import { mkdir, readFile, writeFile } from 'node:fs/promises'
import express from 'express'
import { fetchRawWithTimeout, fetchTextWithTimeout } from '../lib/net.ts'
import { readGitSyncStatusFromLog } from '../lib/update-service/controle-de-dados.ts'
import { parseLimit } from '../lib/update-service/limits.ts'
import { normalizeDiscordChannelId } from '../lib/update-service/discord.ts'
import {
  classifyWebNewsItem,
  hostnameOf,
  normalizeWebItemId,
  parseRssItems,
  sanitizeNoNumbers,
  summarizeWebNews,
} from '../lib/update-service/web-news.ts'
import { buildStoredHeadlinesFromDiscordMessages, fetchDiscordMessages } from '../lib/update-service/financialjuice-discord.ts'
import { registerOptionsRoutes } from '../lib/update-service/options-routes.ts'
import { spawnCapture } from '../lib/update-service/spawn.ts'
import { env, envBool, envNumber, nowISO } from './env.ts'
import { appendLog, fileExists, readJsonFile } from './fs.ts'
import { createNewsRoutesDeps } from './news-deps.ts'
import { registerNewsRoutes } from './news-routes.ts'
import { registerMarketServiceHttpRoutes } from './http-routes.ts'
import { startMarketServiceRuntime } from './runtime.ts'
import { createMarketServiceStatus } from './status.ts'
import { PROJECT_ROOT, WORKSPACE_ROOT } from './paths.ts'
import type { MarketServiceConfig } from './config.ts'
import type { UpdateServiceWiring } from './main-wiring.ts'

export async function startUpdateServiceServer(params: { cfg: MarketServiceConfig; wiring: UpdateServiceWiring }) {
  const { cfg, wiring } = params

  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  const status = createMarketServiceStatus({
    env,
    envBool,
    envNumber,
    normalizeDiscordChannelId,
    marketScheduleMode: cfg.scheduler.scheduleMode,
    intervalMinutes: cfg.intervalMinutes,
    intervalMs: cfg.intervalMs,
    getSchedulePending: () => wiring.stores.schedulePending.get(),
    getLastUpdateStartMs: () => wiring.stores.lastUpdateStartMs.get(),
    nextCronRun: wiring.nextCronRun,
    telegramOperationalCooldownMinutes: cfg.telegram.operationalCooldownMinutes,
    getLastTelegramOperationalSentMs: () => wiring.stores.lastTelegramOperationalSentMs.get(),
    telegramWiring: { telegramFinancialJuiceConfigured: wiring.telegramWiring.telegramFinancialJuiceConfigured },
  })

  await registerMarketServiceHttpRoutes({
    app,
    workspaceRoot: WORKSPACE_ROOT,
    projectRoot: PROJECT_ROOT,
    platform: process.platform,
    processEnv: process.env,
    nowISO,
    fileExists,
    readFileText: p => readFile(p, 'utf8'),
    appendLog,
    spawnCapture,
    reloadDotenvIfChanged: wiring.reloadDotenvIfChanged,
    env,
    envBool,
    envNumber,
    parseLimit,
    normalizeDiscordChannelId,
    state: wiring.stores.state,
    getCurrentChild: () => wiring.stores.child.get(),
    manualCooldownInfo: wiring.manualCooldownInfo,
    buildSchedule: status.buildSchedule,
    telegramStatus: status.telegramStatus,
    newsStatus: status.newsStatus,
    readGitSyncStatusFromLog,
    sendTelegramOperationalOnce: wiring.telegramWiring.sendTelegramOperationalOnce,
    forwardFinancialJuiceToTelegram: wiring.telegramWiring.forwardFinancialJuiceToTelegram,
    optionsRoutes: { register: registerOptionsRoutes, optionsDashboardDir: cfg.optionsDashboardDir, readJsonFile },
    newsRoutes: {
      register: registerNewsRoutes,
      deps: createNewsRoutesDeps({
        baseDir: cfg.baseDir,
        fileExists,
        readFile: (p, opts) => readFile(p, opts.encoding),
        mkdir: (p, opts) => mkdir(p, opts),
        writeFile: (p, content, opts) => writeFile(p, content, opts.encoding),
        register: {
          app,
          reloadDotenvIfChanged: wiring.reloadDotenvIfChanged,
          env,
          envBool,
          envNumber,
          nowISO,
          parseLimit,
          normalizeDiscordChannelId,
          financialJuiceUrl: cfg.news.financialJuiceUrl,
          newsMaxItems: cfg.news.maxItems,
          newsCacheSeconds: cfg.news.cacheSeconds,
          newsHeadlinesRetentionDays: cfg.news.headlinesRetentionDays,
          newsHeadlinesStoreEnabled: cfg.news.headlinesStoreEnabled,
          newsWebEnabled: cfg.news.webEnabled,
          newsWebWindowHours: cfg.news.webWindowHours,
          newsWebMaxItems: cfg.news.webMaxItems,
          newsWebCacheSeconds: cfg.news.webCacheSeconds,
          newsWebRssUrls: cfg.news.webRssUrls,
          fetchRawWithTimeout,
          fetchTextWithTimeout,
          fetchDiscordMessages,
          buildStoredHeadlinesFromDiscordMessages,
          hostnameOf,
          parseRssItems,
          sanitizeNoNumbers,
          classifyWebNewsItem,
          normalizeWebItemId,
          summarizeWebNews,
        },
        headlinesStore: {
          enabled: cfg.news.headlinesStoreEnabled,
          storeFile: cfg.news.headlinesStoreFile,
          retentionDays: cfg.news.headlinesRetentionDays,
        },
      }),
    },
    runUpdate: wiring.runUpdate,
    setLastManualStartMs: ms => {
      wiring.stores.lastManualStartMs.set(ms)
    },
    shutdown: wiring.shutdown,
  })

  const runtime = startMarketServiceRuntime({
    app,
    host: cfg.host,
    port: cfg.port,
    intervalMinutes: cfg.intervalMinutes,
    intervalMs: cfg.intervalMs,
    logsDir: cfg.logsDir,
    schedulerEnabled: cfg.scheduler.enabled,
    marketScheduleMode: cfg.scheduler.scheduleMode,
    runOnStart: cfg.scheduler.runOnStart,
    telegramFinancialJuiceConfigured: wiring.telegramWiring.telegramFinancialJuiceConfigured,
    telegramFinancialJuicePollSeconds: cfg.telegram.financialJuicePollSeconds,
    forwardFinancialJuiceToTelegram: () => wiring.telegramWiring.forwardFinancialJuiceToTelegram(),
    schedule: {
      getPending: () => wiring.stores.schedulePending.get(),
      setPending: next => {
        wiring.stores.schedulePending.set(next)
      },
    },
    runScheduledIfDue: wiring.runScheduledIfDue,
  })

  wiring.shutdown.setServer(runtime.server)
  return runtime.server
}
