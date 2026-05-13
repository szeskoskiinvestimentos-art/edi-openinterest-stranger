import 'dotenv/config'
import dotenv from 'dotenv'
import { spawn } from 'node:child_process'
import { copyFile, mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import express from 'express'
import {
  buildOperationalTelegramCards,
  renderTelegramCardsToPng,
  sendTelegramPhotos,
  sendTelegramMessages,
} from './telegram-operational.ts'

type UpdateState =
  | {
      running: false
      last?: {
        startedAt: string
        finishedAt: string
        exitCode: number
        logPath: string
        reason: string
        mode?: string
        summary?: unknown
      }
    }
  | {
      running: true
      current: {
        startedAt: string
        logPath: string
        reason: string
        mode?: string
        summary?: unknown
      }
      last?: {
        startedAt: string
        finishedAt: string
        exitCode: number
        logPath: string
        reason: string
        mode?: string
        summary?: unknown
      }
    }

function env(name: string): string | undefined
function env(name: string, fallback: string): string
function env(name: string, fallback?: string) {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : fallback
}

function envNumber(name: string, fallback: number) {
  const v = Number(env(name))
  return Number.isFinite(v) ? v : fallback
}

function envBool(name: string, fallback: boolean) {
  const raw = env(name)
  if (!raw) return fallback
  const v = raw.toLowerCase()
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false
  return fallback
}

async function readGitSyncStatusFromLog(logPath: string) {
  try {
    const raw = await readFile(logPath, 'utf8')
    const re = /^GIT_SYNC status=([a-z_]+)(?:\s*•\s*(.*))?$/gim
    let last: { status: string; detail?: string } | null = null
    for (const m of raw.matchAll(re)) {
      const status = String(m[1] || '').trim()
      const detail = String(m[2] || '').trim()
      if (status) last = detail ? { status, detail } : { status }
    }
    if (last) return last
    return null
  } catch {
    return null
  }
}

type ControleDeDadosSnapshot = {
  generated_at: string
  root_dir: string
  state: {
    last_cotacoes_finished_iso?: string | null
    last_cotacoes_log_path?: string | null
    last_cotacoes_git_status?: string | null
    last_options_wdo_last_updated?: string | null
    last_options_win_last_updated?: string | null
  }
  cotacoes?: {
    market_status?: unknown
    last_log_hint?: string | null
    log_tail?: string[] | null
    downloads?: {
      yahoo?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      portfolio?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      di?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      calendar?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      pdf?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      tradingview?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
      git_sync?: { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }
    } | null
  }
  options?: {
    dashboard_unificado?: {
      wdo_last_updated?: string | null
      win_last_updated?: string | null
      wdo_volume_total?: number | null
      win_volume_total?: number | null
      wdo_open_interest_total?: number | null
      win_open_interest_total?: number | null
    }
  }
}

type LogSignal = { status: 'ok' | 'fail' | 'skip' | 'warn' | 'unknown'; detail?: string | null }

async function readLogTail(logPath: string, maxLines = 80) {
  try {
    const raw = await readFile(logPath, 'utf8')
    const lines = raw
      .split(/\r?\n/g)
      .map(s => s.trim())
      .filter(Boolean)
    return lines.slice(Math.max(0, lines.length - maxLines))
  } catch {
    return null
  }
}

async function readMarketDownloadSignalsFromLog(logPath: string) {
  try {
    const raw = await readFile(logPath, 'utf8')
    const lines = raw.split(/\r?\n/g).map(s => s.trim())

    const out: NonNullable<ControleDeDadosSnapshot['cotacoes']>['downloads'] = {}

    for (const line of lines) {
      if (!line) continue

      const yahooOk = line.match(/^OK\s+•\s+Yahoo quotes:\s*(.*)$/i)
      const yahooFail = line.match(/^(FAIL|ERROR)\s+•\s+Yahoo quotes:\s*(.*)$/i)
      if (yahooOk) out.yahoo = { status: 'ok', detail: yahooOk[1] ? yahooOk[1].trim() : null }
      if (yahooFail) out.yahoo = { status: 'fail', detail: yahooFail[2] ? yahooFail[2].trim() : null }

      const pf = line.match(/^(OK|SKIP|FAIL|ERROR)\s+•\s+Portfolio Investing(?:\s*\((.*)\))?$/i)
      if (pf) {
        const status = pf[1].toLowerCase()
        out.portfolio = { status: status === 'error' ? 'fail' : (status as LogSignal['status']), detail: pf[2] ? pf[2].trim() : null }
      }

      const di = line.match(/^(OK|SKIP|FAIL|ERROR)\s+•\s+DI\b.*$/i)
      if (di) {
        const status = di[1].toLowerCase()
        out.di = { status: status === 'error' ? 'fail' : (status as LogSignal['status']), detail: line.replace(/^(OK|SKIP|FAIL|ERROR)\s+•\s+/i, '') }
      }

      const cal = line.match(/^(OK|SKIP|FAIL|ERROR)\s+•\s+Calendar\b.*$/i)
      if (cal) {
        const status = cal[1].toLowerCase()
        out.calendar = { status: status === 'error' ? 'fail' : (status as LogSignal['status']), detail: line.replace(/^(OK|SKIP|FAIL|ERROR)\s+•\s+/i, '') }
      }

      const pdf = line.match(/^OK\s+•\s+dashboard PDF\b.*$/i)
      if (pdf) out.pdf = { status: 'ok', detail: line.replace(/^OK\s+•\s+/i, '') }

      const tv = line.match(/^SUGGEST\s+•\s+MARKET_TRADINGVIEW_SYMBOL_OVERRIDES\b.*$/i)
      if (tv) out.tradingview = { status: 'warn', detail: line.replace(/^SUGGEST\s+•\s+/i, '') }

      const git = line.match(/^GIT_SYNC status=([a-z_]+)(?:\s*•\s*(.*))?$/i)
      if (git) {
        const s = String(git[1] || '').trim().toLowerCase()
        const detail = git[2] ? String(git[2]).trim() : null
        const status: LogSignal['status'] = s === 'pushed' || s === 'committed' ? 'ok' : s === 'failed' ? 'fail' : 'warn'
        out.git_sync = { status, detail: detail || s }
      }
    }

    const hasAny = Object.keys(out).length > 0
    return hasAny ? out : null
  } catch {
    return null
  }
}

async function tryReadMarketDataSummary(absJsonPath: string) {
  try {
    const raw = await readJsonFile<unknown>(absJsonPath)
    if (!raw || typeof raw !== 'object') return null
    const obj = raw as Record<string, unknown>

    const overviewRaw = obj.overview
    const overview = overviewRaw && typeof overviewRaw === 'object' ? (overviewRaw as Record<string, unknown>) : null

    const lastUpdatedRaw = obj.last_updated ?? overview?.last_update ?? obj.updatedAt
    const lastUpdated = lastUpdatedRaw !== undefined && lastUpdatedRaw !== null ? String(lastUpdatedRaw) : null

    const volumeRaw =
      overview && overview.volume_total !== undefined
        ? overview.volume_total
        : overview && overview.total_volume !== undefined
          ? overview.total_volume
          : overview && overview.total_trades !== undefined
            ? overview.total_trades
            : obj.volume_total !== undefined
              ? obj.volume_total
              : obj.total_volume !== undefined
                ? obj.total_volume
                : null

    const oiRaw =
      overview && overview.open_interest_total !== undefined
        ? overview.open_interest_total
        : overview && overview.oi_total !== undefined
          ? overview.oi_total
          : overview && overview.open_interest !== undefined
            ? overview.open_interest
            : obj.open_interest_total !== undefined
              ? obj.open_interest_total
              : null

    const volumeTotalRaw = volumeRaw !== null && volumeRaw !== undefined ? Number(volumeRaw) : null
    const oiTotalRaw = oiRaw !== null && oiRaw !== undefined ? Number(oiRaw) : null

    const volumeTotal = Number.isFinite(volumeTotalRaw ?? NaN) ? volumeTotalRaw : null
    const oiTotal = Number.isFinite(oiTotalRaw ?? NaN) ? oiTotalRaw : null
    return { lastUpdated, volumeTotal, oiTotal }
  } catch {
    return null
  }
}

async function buildControleDeDadosSnapshot(input: {
  marketStatus?: unknown
  logPath?: string | null
  gitSyncStatus?: string | null
}): Promise<ControleDeDadosSnapshot> {
  const wdoJson = path.resolve(WORKSPACE_ROOT, 'dashboard_unificado', 'WDO', 'assets', 'data', 'market_data.json')
  const winJson = path.resolve(WORKSPACE_ROOT, 'dashboard_unificado', 'WIN', 'assets', 'data', 'market_data.json')
  const [wdo, win, downloads, logTail] = await Promise.all([
    tryReadMarketDataSummary(wdoJson),
    tryReadMarketDataSummary(winJson),
    input.logPath ? readMarketDownloadSignalsFromLog(input.logPath) : Promise.resolve(null),
    input.logPath ? readLogTail(input.logPath, 80) : Promise.resolve(null),
  ])
  const gitFromLog = downloads?.git_sync?.detail ? String(downloads.git_sync.detail) : null
  return {
    generated_at: nowISO(),
    root_dir: WORKSPACE_ROOT,
    state: {
      last_cotacoes_finished_iso: null,
      last_cotacoes_log_path: input.logPath ?? null,
      last_cotacoes_git_status: input.gitSyncStatus ?? gitFromLog ?? null,
      last_options_wdo_last_updated: wdo?.lastUpdated ?? null,
      last_options_win_last_updated: win?.lastUpdated ?? null,
    },
    cotacoes: {
      market_status: input.marketStatus,
      last_log_hint: null,
      log_tail: logTail,
      downloads,
    },
    options: {
      dashboard_unificado: {
        wdo_last_updated: wdo?.lastUpdated ?? null,
        win_last_updated: win?.lastUpdated ?? null,
        wdo_volume_total: wdo?.volumeTotal ?? null,
        win_volume_total: win?.volumeTotal ?? null,
        wdo_open_interest_total: wdo?.oiTotal ?? null,
        win_open_interest_total: win?.oiTotal ?? null,
      },
    },
  }
}

async function writeControleDeDadosHtml(snapshot: ControleDeDadosSnapshot, baseDir = WORKSPACE_ROOT) {
  const htmlPath = path.resolve(baseDir, 'controle_de_dados.html')
  const markerStart = '<script id="data" type="application/json">'
  const markerEnd = '</script>'
  const payload = JSON.stringify(snapshot)
  const fallbackHtml = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Controle de Dados</title></head><body><script id="data" type="application/json">${payload}</script><pre style="white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace">controle_de_dados.html foi regenerado automaticamente.\nAbra via HTTP para modo ao vivo: http://127.0.0.1:3033/controle_de_dados.html</pre></body></html>`
  if (!(await fileExists(htmlPath))) {
    await writeFile(htmlPath, fallbackHtml, 'utf8')
    return true
  }
  const raw = await readFile(htmlPath, 'utf8')
  const i = raw.indexOf(markerStart)
  if (i < 0) {
    await writeFile(htmlPath, fallbackHtml, 'utf8')
    return true
  }
  const j = raw.indexOf(markerEnd, i + markerStart.length)
  if (j < 0) {
    await writeFile(htmlPath, fallbackHtml, 'utf8')
    return true
  }
  const next = raw.slice(0, i + markerStart.length) + payload + raw.slice(j)
  if (next === raw) return false
  await writeFile(htmlPath, next, 'utf8')
  return true
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const WORKSPACE_ROOT = path.resolve(PROJECT_ROOT, '..')

function resolveFromProject(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p)
}

function resolveFromBase(baseDir: string, p: string) {
  return path.isAbsolute(p) ? p : path.resolve(baseDir, p)
}

function resolveFromWorkspace(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(WORKSPACE_ROOT, p)
}

function isOneDrivePath(p: string) {
  const s = path.resolve(String(p || ''))
  return /\\OneDrive(\\|$)/i.test(s) || /\/OneDrive(\/|$)/i.test(s)
}

function isPathInside(baseDir: string, targetPath: string) {
  const base = path.resolve(baseDir)
  const target = path.resolve(targetPath)
  const normBase = process.platform === 'win32' ? base.toLowerCase() : base
  const normTarget = process.platform === 'win32' ? target.toLowerCase() : target
  const baseWithSep = normBase.endsWith(path.sep) ? normBase : normBase + path.sep
  return normTarget === normBase || normTarget.startsWith(baseWithSep)
}

function requireInsideWorkspace(label: string, p: string) {
  const abs = path.resolve(p)
  if (isOneDrivePath(abs)) {
    throw new Error(`${label}_blocked_onedrive:${abs}`)
  }
  if (!isPathInside(WORKSPACE_ROOT, abs)) {
    throw new Error(`${label}_outside_workspace_root:${abs}`)
  }
  return abs
}

function defaultAutomationDir() {
  return path.resolve(PROJECT_ROOT, '.edi-market-guardin')
}

function envIntOrNull(name: string) {
  const raw = env(name)
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  const i = Math.trunc(n)
  return i
}

function nowISO() {
  return new Date().toISOString()
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, { encoding: 'utf-8' })
  return JSON.parse(raw) as T
}

function safeFileStamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

async function appendLog(logPath: string, chunk: string) {
  await mkdir(path.dirname(logPath), { recursive: true })
  await writeFile(logPath, chunk, { encoding: 'utf-8', flag: 'a' })
}

async function fileExists(p: string) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

type SpawnResult = {
  exitCode: number
  stdout: string
  stderr: string
}

function platformCmd(cmd: string) {
  if (process.platform !== 'win32') return cmd
  const c = String(cmd || '').trim().toLowerCase()
  if (c === 'npm') return 'npm.cmd'
  if (c === 'npx') return 'npx.cmd'
  return cmd
}

function spawnCapture(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) {
  return new Promise<SpawnResult>(resolve => {
    const child = spawn(platformCmd(cmd), args, {
      cwd: opts.cwd,
      env: opts.env,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', d => {
      stdout += String(d)
    })
    child.stderr.on('data', d => {
      stderr += String(d)
    })

    child.on('close', code => {
      resolve({
        exitCode: typeof code === 'number' ? code : -1,
        stdout,
        stderr,
      })
    })
  })
}

function spawnCaptureWithTimeout(
  cmd: string,
  args: string[],
  opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
  timeoutMs: number,
) {
  return new Promise<SpawnResult>(resolve => {
    const child = spawn(platformCmd(cmd), args, {
      cwd: opts.cwd,
      env: opts.env,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''
    let timeoutFired = false

    const timeout = setTimeout(() => {
      if (timeoutFired) return
      timeoutFired = true
      const pid = child && typeof child.pid === 'number' ? child.pid : null
      stderr += `TIMEOUT • ${cmd} ${args.join(' ')} • ${timeoutMs}ms\n`
      if (!pid) return
      if (process.platform === 'win32') {
        void spawnCapture('taskkill', ['/PID', String(pid), '/T', '/F'], { cwd: opts.cwd, env: opts.env })
        return
      }
      try {
        child.kill('SIGKILL')
      } catch {
        void 0
      }
    }, Math.max(250, timeoutMs)).unref()

    child.stdout.on('data', d => {
      stdout += String(d)
    })
    child.stderr.on('data', d => {
      stderr += String(d)
    })

    child.on('close', code => {
      clearTimeout(timeout)
      resolve({
        exitCode: typeof code === 'number' ? code : timeoutFired ? 124 : -1,
        stdout,
        stderr,
      })
    })
  })
}

async function main() {
  const host = env('MARKET_SERVICE_HOST', '127.0.0.1')
  const port = envNumber('MARKET_SERVICE_PORT', 3033)
  const intervalMinutes = envNumber('MARKET_INTERVAL_MINUTES', 15)
  const intervalMs = Math.max(5, intervalMinutes) * 60 * 1000
  const manualCooldownMinutes = envNumber('MARKET_MANUAL_COOLDOWN_MINUTES', intervalMinutes)
  const manualCooldownMs = Math.max(1, manualCooldownMinutes) * 60 * 1000
  const updateMode = String(env('MARKET_UPDATE_MODE', 'once') || 'once').toLowerCase()

  const baseDir = resolveFromProject(env('MARKET_AUTOMATION_DIR', defaultAutomationDir()))
  const logsDir = path.join(baseDir, 'logs')
  let httpServer: ReturnType<express.Express['listen']> | null = null

  const marketUpdateLogRetentionDays = Math.max(1, envNumber('MARKET_UPDATE_LOG_RETENTION_DAYS', 10))

  const gitSyncEnabled = envBool('MARKET_GIT_SYNC_ENABLED', true)
  const gitSyncPush = envBool('MARKET_GIT_SYNC_PUSH', true)
  const gitSyncRemote = env('MARKET_GIT_SYNC_REMOTE', 'origin')
  const gitSyncRemoteUrl = env('MARKET_GIT_SYNC_REMOTE_URL')
  const gitSyncBranch = env('MARKET_GIT_SYNC_BRANCH')
  const gitSyncRepoDir = env('MARKET_GIT_SYNC_REPO_DIR')
  const gitSyncTargetDir = env('MARKET_GIT_SYNC_TARGET_DIR', '')
  const sourceDataDir = env('MARKET_SOURCE_DATA_DIR', 'dashboard/MERCADO/assets/data')

  const marketUpdateTimeoutMinutes = Math.max(3, envNumber('MARKET_UPDATE_TIMEOUT_MINUTES', 25))

  const optionsDashboardDir = resolveFromProject(
    env('OPTIONS_UNIFIED_DASHBOARD_DIR', path.resolve(WORKSPACE_ROOT, 'B3_System', 'dashboard_unificado')),
  )

  function normalizeHttpUrl(raw: string, fallback: string) {
    const s = String(raw || '').trim().replace(/[`'"]/g, '')
    return s && /^https?:\/\//i.test(s) ? s : fallback
  }

  const financialJuiceUrl = normalizeHttpUrl(env('NEWS_FINANCIALJUICE_URL', 'https://www.financialjuice.com/home'), 'https://www.financialjuice.com/home')
  const newsMaxItems = envNumber('NEWS_MAX_ITEMS', 25)
  const newsCacheSeconds = envNumber('NEWS_CACHE_SECONDS', 15)
  const newsHeadlinesRetentionDays = Math.max(1, envNumber('NEWS_HEADLINES_RETENTION_DAYS', 2))
  const newsHeadlinesStoreEnabled = envBool('NEWS_HEADLINES_STORE_ENABLED', true)
  const newsHeadlinesStoreFile = env('NEWS_HEADLINES_STORE_FILE', '')
  const newsWebEnabled = envBool('NEWS_WEB_ENABLED', true)
  const newsWebWindowHours = Math.max(6, envNumber('NEWS_WEB_WINDOW_HOURS', 24))
  const newsWebMaxItems = Math.max(5, envNumber('NEWS_WEB_MAX_ITEMS', 40))
  const newsWebCacheSeconds = Math.max(15, envNumber('NEWS_WEB_CACHE_SECONDS', 900))
  const newsWebRssUrlsRaw = env('NEWS_WEB_RSS_URLS', '')

  const telegramEnabled = envBool('TELEGRAM_ENABLED', true)
  const telegramBotToken = env('TELEGRAM_BOT_TOKEN', '')
  const telegramChatId = env('TELEGRAM_CHAT_ID', '')
  const telegramOperationalEnabled = envBool('TELEGRAM_OPERATIONAL_ENABLED', false)
  const telegramOperationalSendOn = String(env('TELEGRAM_OPERATIONAL_SEND_ON', 'manual') || 'manual').toLowerCase()
  const telegramOperationalCooldownMinutes = Math.max(1, envNumber('TELEGRAM_OPERATIONAL_COOLDOWN_MINUTES', 45))
  const telegramOperationalThreadId = envIntOrNull('TELEGRAM_OPERATIONAL_THREAD_ID')

  const telegramFinancialJuicePollSeconds = Math.max(15, envNumber('TELEGRAM_FINANCIALJUICE_POLL_SECONDS', 120))

  const marketScheduleMode = String(env('MARKET_SCHEDULE_MODE', 'interval') || 'interval').toLowerCase()

  let state: UpdateState = { running: false }
  let lastManualStartMs: number | null = null
  let lastUpdateStartMs: number | null = null
  let currentSummary: unknown = null
  let schedulePending = false
  let lastTelegramOperationalSentMs: number | null = null

  let cachedHeadlines: { atMs: number; payload: unknown } | null = null
  let cachedWebNews: { atMs: number; payload: unknown } | null = null

  const fjSentIds = new Set<string>()
  const fjSentFifo: string[] = []
  let fjSentDirty = false
  let lastDotenvMtimeMs = 0
  const dotenvPath = path.join(PROJECT_ROOT, '.env')
  async function reloadDotenvIfChanged() {
    try {
      const st = await stat(dotenvPath)
      if (!st || typeof st.mtimeMs !== 'number' || !Number.isFinite(st.mtimeMs)) return
      if (st.mtimeMs <= lastDotenvMtimeMs) return
      dotenv.config({ path: dotenvPath, override: true })
      lastDotenvMtimeMs = st.mtimeMs
    } catch {
      void 0
    }
  }

  async function pruneMarketUpdateLogs() {
    try {
      const keep = new Set<string>()
      try {
        if (state.running) keep.add(path.resolve(state.current.logPath))
      } catch {
        void 0
      }
      try {
        if (state.last) keep.add(path.resolve(state.last.logPath))
      } catch {
        void 0
      }

      const cutoffMs = Date.now() - marketUpdateLogRetentionDays * 86400 * 1000
      const items = await readdir(logsDir)
      for (const name of items) {
        if (!name.startsWith('market_update_') || !name.endsWith('.log')) continue
        const p = path.join(logsDir, name)
        let rp = p
        try {
          rp = path.resolve(p)
        } catch {
          void 0
        }
        if (keep.has(rp)) continue
        try {
          const st = await stat(p)
          if (st.mtimeMs > cutoffMs) continue
          await unlink(p)
        } catch {
          void 0
        }
      }
    } catch {
      void 0
    }
  }

  const fjSentStorePath = () => {
    const configured = env('TELEGRAM_FINANCIALJUICE_SENT_STORE_FILE', '')
    return configured && String(configured).trim()
      ? resolveFromBase(baseDir, String(configured).trim())
      : path.join(baseDir, 'telegram_financialjuice_sent.json')
  }
  function rememberFjSent(id: string) {
    const key = String(id || '').trim()
    if (!key || fjSentIds.has(key)) return
    fjSentIds.add(key)
    fjSentFifo.push(key)
    fjSentDirty = true
    while (fjSentFifo.length > 800) {
      const old = fjSentFifo.shift()
      if (old) fjSentIds.delete(old)
    }
  }

  async function loadFjSentStore(nowMs: number) {
    await reloadDotenvIfChanged()
    if (!envBool('TELEGRAM_FINANCIALJUICE_SENT_STORE_ENABLED', true)) return
    const retentionDays = Math.max(1, envNumber('TELEGRAM_FINANCIALJUICE_SENT_RETENTION_DAYS', 7))
    try {
      const storePath = fjSentStorePath()
      if (!(await fileExists(storePath))) return
      const raw = await readFile(storePath, { encoding: 'utf-8' })
      const parsed: unknown = raw ? JSON.parse(raw) : null
      const list =
        parsed && typeof parsed === 'object' && 'items' in parsed && Array.isArray((parsed as Record<string, unknown>).items)
          ? ((parsed as Record<string, unknown>).items as unknown[])
          : Array.isArray(parsed)
            ? (parsed as unknown[])
            : []
      const cutoff = nowMs - retentionDays * 24 * 60 * 60 * 1000
      for (const x of list) {
        if (!x || typeof x !== 'object') continue
        const o = x as Record<string, unknown>
        const id = typeof o.id === 'string' ? o.id.trim() : ''
        const createdAt = typeof o.createdAt === 'string' ? o.createdAt : null
        const ms = createdAt ? Date.parse(createdAt) : NaN
        if (!id) continue
        if (Number.isFinite(ms) && ms < cutoff) continue
        if (fjSentIds.has(id)) continue
        fjSentIds.add(id)
        fjSentFifo.push(id)
      }
      while (fjSentFifo.length > 800) {
        const old = fjSentFifo.shift()
        if (old) fjSentIds.delete(old)
      }
      fjSentDirty = false
    } catch {
      fjSentDirty = false
    }
  }

  async function flushFjSentStore(nowMs: number) {
    await reloadDotenvIfChanged()
    if (!envBool('TELEGRAM_FINANCIALJUICE_SENT_STORE_ENABLED', true)) return
    if (!fjSentDirty) return
    try {
      const retentionDays = Math.max(1, envNumber('TELEGRAM_FINANCIALJUICE_SENT_RETENTION_DAYS', 7))
      const storePath = fjSentStorePath()
      const items = fjSentFifo
        .slice(-800)
        .map(id => ({ id, createdAt: new Date(nowMs).toISOString() }))
      const payload = {
        updatedAt: nowISO(),
        retentionDays,
        items,
      }
      await mkdir(path.dirname(storePath), { recursive: true })
      await writeFile(storePath, JSON.stringify(payload, null, 2), { encoding: 'utf-8' })
      fjSentDirty = false
    } catch {
      void 0
    }
  }

  await loadFjSentStore(Date.now())

  function parseList(raw: string) {
    const parts = String(raw || '')
      .split(/[\n,;]+/g)
      .map(x => x.trim())
      .filter(Boolean)
    return Array.from(new Set(parts))
  }

  const defaultWebRssUrls = [
    'https://news.google.com/rss/search?q=Fed%20inflation%20Treasury%20yields%20Dollar%20DXY&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=global%20markets%20risk%20on%20risk%20off%20credit%20spreads&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=Brazil%20fiscal%20Congress%20Haddad%20Lula%20Copom%20BCB&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    'https://news.google.com/rss/search?q=oil%20OPEC%20Brent%20WTI%20supply%20geopolitics&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=iron%20ore%20China%20steel%20property&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=soybeans%20corn%20coffee%20sugar%20weather%20South%20America&hl=en-US&gl=US&ceid=US:en',
  ]

  const newsWebRssUrls = parseList(newsWebRssUrlsRaw).length ? parseList(newsWebRssUrlsRaw) : defaultWebRssUrls

  function normalizeDiscordChannelId(raw: string) {
    const s = String(raw || '').trim()
    if (!s) return ''
    if (/^\d{17,20}$/.test(s)) return s
    const matches = s.match(/\d{17,20}/g)
    if (!matches || !matches.length) return ''
    return matches[matches.length - 1]
  }

  function serviceBaseUrl() {
    return `http://${host}:${port}`
  }

  function brtMinutesOfDayNow() {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date())
      const h = Number(parts.find(p => p.type === 'hour')?.value || '0')
      const m = Number(parts.find(p => p.type === 'minute')?.value || '0')
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null
      return h * 60 + m
    } catch {
      return null
    }
  }

  function operationalSessionLabelForNow() {
    const min = brtMinutesOfDayNow()
    if (typeof min !== 'number') return 'Pré-mercado'
    if (min >= 18 * 60) return 'Pós-mercado'
    if (min < 9 * 60) return 'Pré-mercado'
    return 'Pregão aberto'
  }

  function telegramOperationalGate(reason: string) {
    if (!telegramEnabled || !telegramOperationalEnabled) {
      return {
        ok: false as const,
        error: 'disabled',
        enabled: { telegramEnabled, telegramOperationalEnabled },
      }
    }

    const missing = []
    if (!telegramBotToken) missing.push('TELEGRAM_BOT_TOKEN')
    if (!telegramChatId) missing.push('TELEGRAM_CHAT_ID')
    if (missing.length) {
      return {
        ok: false as const,
        error: 'not_configured',
        missing,
      }
    }

    if (telegramOperationalSendOn === 'schedule' && reason !== 'schedule') {
      return { ok: false as const, error: 'send_on_blocked', sendOn: telegramOperationalSendOn, reason }
    }
    if (telegramOperationalSendOn !== 'both' && telegramOperationalSendOn !== 'schedule' && reason === 'schedule') {
      return { ok: false as const, error: 'send_on_blocked', sendOn: telegramOperationalSendOn, reason }
    }

    return { ok: true as const }
  }

  function telegramOperationalCooldownOk() {
    const last = lastTelegramOperationalSentMs
    if (!last) return true
    return Date.now() - last >= telegramOperationalCooldownMinutes * 60 * 1000
  }

  async function sendTelegramOperationalOnce(opts: { reason: string; logPath?: string; force?: boolean }) {
    const gate = telegramOperationalGate(opts.reason)
    if (!gate.ok) return gate

    if (!opts.force && !telegramOperationalCooldownOk()) {
      return {
        ok: false as const,
        error: 'cooldown',
        cooldownMinutes: telegramOperationalCooldownMinutes,
      }
    }

    const payload = await buildOperationalTelegramCards({
      baseUrl: serviceBaseUrl(),
      sourceDataDir: resolveFromProject(String(sourceDataDir)),
      sessionLabel: operationalSessionLabelForNow(),
    })

    if (!payload || !payload.ok) {
      return { ok: false as const, error: 'build_failed' }
    }

    const rendered = await renderTelegramCardsToPng(payload.cards)
    if (!rendered.ok) {
      return { ok: false as const, error: 'render_failed' }
    }

    const send = await sendTelegramPhotos({
      botToken: telegramBotToken,
      chatId: telegramChatId,
      messageThreadId: telegramOperationalThreadId,
      items: rendered.images.map(x => ({ filename: x.filename, caption: x.caption, png: x.png })),
    })

    if (!send.ok) {
      return { ok: false as const, error: send.error }
    }

    lastTelegramOperationalSentMs = Date.now()
    if (opts.logPath) {
      const failed = send.results.filter(x => !x.ok)
      const summary =
        `TELEGRAM operational\n` +
        `- ok=${send.results.length - failed.length}/${send.results.length}\n` +
        (failed.length ? `- failed=${failed.map(x => `${x.filename}: ${x.error || 'error'}`).join(' | ')}\n` : '')
      await appendLog(opts.logPath, `${summary}\n`)
    }

    return { ok: true as const, generatedAt: payload.generatedAt, results: send.results }
  }

  async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), Math.max(250, timeoutMs))
    try {
      const r = await fetch(url, { method: 'GET', signal: ctl.signal })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return (await r.json()) as T
    } finally {
      clearTimeout(t)
    }
  }

  type FinancialJuiceHeadlinesPayload = {
    ok: boolean
    items?: Array<{ id: string; createdAt?: string | null; original: string; url?: string | null }>
  }

  function telegramFinancialJuiceConfigured() {
    if (!envBool('TELEGRAM_ENABLED', true)) return false
    if (!envBool('TELEGRAM_FINANCIALJUICE_ENABLED', true)) return false
    if (!env('TELEGRAM_BOT_TOKEN', '')) return false
    if (!env('TELEGRAM_FINANCIALJUICE_CHAT_ID', '')) return false
    return true
  }

  async function forwardFinancialJuiceToTelegram(opts?: { bootstrap?: boolean; dryRun?: boolean; maxItems?: number }) {
    await reloadDotenvIfChanged()
    if (!telegramFinancialJuiceConfigured()) {
      return { ok: false as const, error: 'disabled_or_not_configured' }
    }

    const payload = await fetchJsonWithTimeout<FinancialJuiceHeadlinesPayload>(
      `${serviceBaseUrl()}/api/news/financialjuice/headlines?limit=40&onlyFj=0&t=${Date.now()}`,
      4500,
    )

    if (!payload || !payload.ok) return { ok: false as const, error: 'no_headlines' }
    const items = Array.isArray(payload.items) ? payload.items : []
    if (!items.length) return { ok: false as const, error: 'no_items' }

    const maxPerPoll = Math.max(1, Math.min(30, envNumber('TELEGRAM_FINANCIALJUICE_MAX_PER_POLL', 10)))
    const bootstrapMax = Math.max(0, Math.min(50, envNumber('TELEGRAM_FINANCIALJUICE_BOOTSTRAP_MAX_ITEMS', 6)))
    const rawOverride = opts && typeof opts.maxItems === 'number' && Number.isFinite(opts.maxItems) ? Math.floor(opts.maxItems) : null
    const maxOverride = rawOverride !== null ? Math.max(1, Math.min(30, rawOverride)) : null
    const baseMax = opts && opts.bootstrap ? (bootstrapMax || maxPerPoll) : maxPerPoll
    const max = maxOverride !== null ? Math.min(baseMax, maxOverride) : baseMax

    const toSend: Array<{ id: string; text: string }> = []
    for (const it of items.slice().reverse()) {
      const id = String(it && it.id ? it.id : '').trim()
      if (!id) continue
      if (fjSentIds.has(id)) continue
      const text = String(it && it.original ? it.original : '').trim()
      if (!text) continue
      const url = it && it.url ? String(it.url) : ''
      const line = url ? `${text}\n${url}` : text
      toSend.push({ id, text: line })
      if (toSend.length >= max) break
    }

    if (!toSend.length) return { ok: true as const, sent: 0 }
    if (opts && opts.dryRun) {
      return { ok: true as const, sent: 0, dryRun: true as const, wouldSend: toSend.slice(0, 10).map(x => ({ id: x.id, text: x.text })) }
    }

    const safeText = (s: string) => {
      const t = String(s || '').trim()
      if (t.length <= 3600) return t
      return `${t.slice(0, 3580).trim()}…`
    }
    const send = await sendTelegramMessages({
      botToken: env('TELEGRAM_BOT_TOKEN', ''),
      chatId: env('TELEGRAM_FINANCIALJUICE_CHAT_ID', ''),
      messageThreadId: envIntOrNull('TELEGRAM_FINANCIALJUICE_THREAD_ID'),
      items: toSend.map(x => ({ text: safeText(x.text), disablePreview: true })),
    })

    if (!send.ok) {
      return { ok: false as const, error: send.error }
    }

    for (let i = 0; i < toSend.length; i++) {
      const r = send.results[i]
      if (r && r.ok) rememberFjSent(toSend[i].id)
    }
    await flushFjSentStore(Date.now())
    const sent = send.results.filter(x => x.ok).length
    return { ok: true as const, sent, results: send.results }
  }

  type DiscordMessage = {
    id: string
    content?: string
    timestamp?: string
    author?: { bot?: boolean; username?: string }
    embeds?: Array<{
      title?: string
      description?: string
      url?: string
    }>
  }

  async function fetchDiscordMessages(channelId: string, limit: number) {
    await reloadDotenvIfChanged()
    const token = env('NEWS_DISCORD_BOT_TOKEN', '')
    if (!token) return []
    const url = `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages?limit=${encodeURIComponent(String(limit))}`
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bot ${token}`,
        },
      })
      if (r.status === 429) {
        const retryAfterHeader = r.headers.get('retry-after')
        let retryMs = retryAfterHeader ? Math.max(250, Math.floor(Number(retryAfterHeader) * 1000)) : 1500
        try {
          const j = (await r.json()) as { retry_after?: number }
          if (j && typeof j.retry_after === 'number' && Number.isFinite(j.retry_after)) retryMs = Math.max(250, Math.floor(j.retry_after * 1000))
        } catch {
          void 0
        }
        await new Promise(resolve => setTimeout(resolve, Math.min(15000, retryMs)))
        continue
      }
      if (!r.ok) throw new Error(`Discord HTTP ${r.status}`)
      return (await r.json()) as DiscordMessage[]
    }
    throw new Error('Discord rate limited')
  }

  async function fetchTextWithTimeout(url: string, timeoutMs: number) {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), Math.max(250, timeoutMs))
    try {
      const r = await fetch(url, { method: 'GET', signal: ctl.signal })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.text()
    } finally {
      clearTimeout(t)
    }
  }

  function normalizeLine(text: string) {
    const t = String(text || '').replace(/\s+/g, ' ').trim()
    if (!t) return null
    if (t.length < 6) return null
    return t
  }

  function extractTextsFromMessage(m: DiscordMessage) {
    const out: Array<{ text: string; url?: string | null }> = []

    const content = normalizeLine(m && m.content ? m.content : '')
    if (content) out.push({ text: content, url: null })

    const embeds = Array.isArray(m && m.embeds ? m.embeds : []) ? (m.embeds as NonNullable<DiscordMessage['embeds']>) : []
    for (const e of embeds) {
      const title = normalizeLine(e && e.title ? e.title : '')
      const desc = normalizeLine(e && e.description ? e.description : '')
      const url = e && e.url ? String(e.url) : null
      if (title) out.push({ text: title, url })
      if (desc && (!title || desc !== title)) out.push({ text: desc, url })
    }

    return out
  }

  type StoredHeadline = {
    id: string
    createdAt: string | null
    original: string
    url: string | null
    author: { bot: boolean; username: string | null } | null
  }

  function parseCreatedAtMs(createdAt: string | null) {
    if (!createdAt) return null
    const t = Date.parse(createdAt)
    return Number.isFinite(t) ? t : null
  }

  function pruneStoredHeadlines(items: StoredHeadline[], nowMs: number) {
    const cutoff = nowMs - newsHeadlinesRetentionDays * 24 * 60 * 60 * 1000
    return items.filter(it => {
      const ms = parseCreatedAtMs(it.createdAt)
      if (ms === null) return true
      return ms >= cutoff
    })
  }

  async function loadStoredHeadlines(nowMs: number) {
    if (!newsHeadlinesStoreEnabled) return []
    const filePath = (newsHeadlinesStoreFile && String(newsHeadlinesStoreFile).trim())
      ? String(newsHeadlinesStoreFile).trim()
      : path.join(baseDir, 'news_financialjuice_headlines.json')
    try {
      if (!(await fileExists(filePath))) return []
      const raw = await readFile(filePath, { encoding: 'utf-8' })
      const parsed: unknown = raw ? JSON.parse(raw) : null
      const list = parsed && typeof parsed === 'object' && 'items' in parsed && Array.isArray((parsed as Record<string, unknown>).items)
        ? ((parsed as Record<string, unknown>).items as unknown[])
        : Array.isArray(parsed)
          ? (parsed as unknown[])
          : []
      const mapped: StoredHeadline[] = []
      for (const x of list) {
        if (!x || typeof x !== 'object') continue
        const o = x as Record<string, unknown>
        const id = typeof o.id === 'string' ? o.id : ''
        const original = typeof o.original === 'string' ? o.original : ''
        if (!id || !original) continue
        mapped.push({
          id,
          createdAt: typeof o.createdAt === 'string' ? o.createdAt : null,
          original,
          url: typeof o.url === 'string' ? o.url : null,
          author:
            o.author && typeof o.author === 'object'
              ? {
                  bot: !!(o.author as Record<string, unknown>).bot,
                  username: typeof (o.author as Record<string, unknown>).username === 'string' ? String((o.author as Record<string, unknown>).username) : null,
                }
              : null,
        })
      }
      return pruneStoredHeadlines(mapped, nowMs)
    } catch {
      return []
    }
  }

  async function saveStoredHeadlines(items: StoredHeadline[]) {
    if (!newsHeadlinesStoreEnabled) return
    const filePath = (newsHeadlinesStoreFile && String(newsHeadlinesStoreFile).trim())
      ? String(newsHeadlinesStoreFile).trim()
      : path.join(baseDir, 'news_financialjuice_headlines.json')
    await mkdir(path.dirname(filePath), { recursive: true })
    const payload = { updatedAt: nowISO(), retentionDays: newsHeadlinesRetentionDays, items }
    await writeFile(filePath, JSON.stringify(payload, null, 2), { encoding: 'utf-8' })
  }

  function decodeXmlEntities(s: string) {
    return String(s || '')
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#(\d+);/g, (_m, n) => {
        const code = Number(n)
        return Number.isFinite(code) ? String.fromCharCode(code) : ''
      })
  }

  function sanitizeNoNumbers(text: string) {
    const t = String(text || '')
      .replace(/[0-9][0-9.,:%]*/g, '—')
      .replace(/\s+/g, ' ')
      .trim()
    return t
  }

  function hostnameOf(u: string) {
    try {
      return new URL(u).hostname
    } catch {
      return ''
    }
  }

  type WebNewsItem = {
    id: string
    title: string
    url: string
    publishedAt: string | null
    source: string | null
    bucket: 'GLOBAL' | 'BRASIL' | 'COMMODITIES'
    driver: string
    impact: { wdo: '↑' | '↓' | '≈'; win: '↑' | '↓' | '≈' }
    confidence: 'alta' | 'média' | 'baixa'
  }

  function classifyWebNewsItem(rawTitle: string, url: string) {
    const t = String(rawTitle || '').toLowerCase()

    const isBrazil = /\bbrazil\b|\bbrasil\b|\blula\b|\bhaddad\b|\bcongress\b|\bcongresso\b|\bfiscal\b|\bcopom\b|\bbcb\b|\bbanco central\b/.test(t)
    const isCommod =
      /\boil\b|\bbrent\b|\bwti\b|\bgas\b|\bopec\b|\biron ore\b|\bmin[eé]rio\b|\bsteel\b|\bsoy\b|\bsoybean\b|\bmilho\b|\bcorn\b|\bcaf[eé]\b|\bcoffee\b|\ba[cç][uú]car\b|\bsugar\b/.test(
        t,
      )

    const bucket: WebNewsItem['bucket'] = isBrazil ? 'BRASIL' : isCommod ? 'COMMODITIES' : 'GLOBAL'

    const driver =
      /\bfed\b|\bpowell\b|\binflation\b|\bcpi\b|\bppi\b|\btreasury\b|\byield\b|\brates?\b|\bjobs\b|\bnfp\b/.test(t)
        ? 'Juros EUA'
        : /\bdollar\b|\bdxy\b|\busd\b|\bgreenback\b/.test(t)
          ? 'Dólar'
          : /\bcredit\b|\bspread\b|\bdefaults?\b|\bbank\b|\bliquidity\b|\bstress\b/.test(t)
            ? 'Crédito/Stress'
            : /\bopec\b|\boil\b|\bbrent\b|\bwti\b|\bgas\b/.test(t)
              ? 'Energia'
              : /\biron ore\b|\bsteel\b|\bchina\b|\bproperty\b|\bdeveloper\b|\bp(b|)oc\b/.test(t)
                ? 'China/Minério'
                : /\bsoy\b|\bsoybean\b|\bcorn\b|\bmilho\b|\bcoffee\b|\bcaf[eé]\b|\bsugar\b|\ba[cç][uú]car\b/.test(t)
                  ? 'Agro'
                  : isBrazil
                    ? 'Brasil (Fiscal/BC)'
                    : /\bwar\b|\bsanctions\b|\bgeopolitics\b|\btariffs?\b|\belection\b/.test(t)
                      ? 'Geopolítica'
                      : 'Macro (Outros)'

    const hawkish = /\bhawkish\b|\bsticky inflation\b|\bhigher for longer\b|\brate hikes?\b|\binflation rises\b|\byields? rise\b/.test(t)
    const dovish = /\bdovish\b|\brates? cuts?\b|\binflation cools\b|\byields? fall\b/.test(t)
    const riskOff = /\brisk[- ]off\b|\bstress\b|\brecession\b|\bsell[- ]off\b|\bpanic\b/.test(t)
    const riskOn = /\brisk[- ]on\b|\brally\b|\bsoft landing\b|\brelief\b/.test(t)
    const brFiscalBad = /\bfiscal\b|\bdebt\b|\bdeficit\b|\bspending\b|\brisk\b/.test(t) && isBrazil
    const brFiscalGood = /\breform\b|\bapproval\b|\bconvergence\b/.test(t) && isBrazil
    const chinaBad = /\bchina\b/.test(t) && (/\bslump\b|\bweak\b|\bcrisis\b|\bproperty\b|\bdefaults?\b/.test(t) || /\bdown\b|\bfall\b/.test(t))
    const chinaGood = /\bchina\b/.test(t) && (/\bstimulus\b|\brebound\b|\bstrong\b|\bup\b|\brise\b/.test(t))

    let wdo: WebNewsItem['impact']['wdo'] = '≈'
    let win: WebNewsItem['impact']['win'] = '≈'

    if (riskOff || hawkish) {
      wdo = '↑'
      win = '↓'
    } else if (riskOn || dovish) {
      wdo = '↓'
      win = '↑'
    }
    if (brFiscalBad) {
      wdo = '↑'
      win = '↓'
    } else if (brFiscalGood) {
      wdo = '↓'
      win = win === '↓' ? '≈' : '↑'
    }
    if (chinaBad) {
      wdo = '↑'
      win = win === '↑' ? '≈' : '↓'
    } else if (chinaGood) {
      wdo = '↓'
      win = win === '↓' ? '≈' : '↑'
    }

    const confidence: WebNewsItem['confidence'] =
      hostnameOf(url) && rawTitle && rawTitle.length >= 18 ? 'média' : 'baixa'

    return { bucket, driver, impact: { wdo, win }, confidence }
  }

  function parseRssItems(xml: string) {
    const items = String(xml || '').match(/<item\b[\s\S]*?<\/item>/gi) || []
    const out: Array<{ title: string; link: string; pubDate: string | null; source: string | null }> = []

    const tag = (block: string, name: string) => {
      const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i')
      const m = block.match(re)
      return m ? decodeXmlEntities(m[1]).trim() : ''
    }

    for (const it of items) {
      const title = tag(it, 'title')
      const link = tag(it, 'link')
      const pubDate = tag(it, 'pubDate') || null
      const source = tag(it, 'source') || null
      if (!title || !link) continue
      out.push({ title, link, pubDate, source })
    }
    return out
  }

  function normalizeWebItemId(url: string, title: string) {
    const key = `${String(url || '').trim()}|${String(title || '').trim()}`
    let h = 0
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
    return `web_${h}`
  }

  function summarizeWebNews(items: WebNewsItem[]) {
    const byBucket = {
      GLOBAL: items.filter(x => x.bucket === 'GLOBAL'),
      BRASIL: items.filter(x => x.bucket === 'BRASIL'),
      COMMODITIES: items.filter(x => x.bucket === 'COMMODITIES'),
    }

    const topDrivers = (xs: WebNewsItem[], n: number) => {
      const m = new Map<string, number>()
      for (const x of xs) m.set(x.driver, (m.get(x.driver) || 0) + 1)
      return Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k]) => k)
    }

    const factorLabel = (x: WebNewsItem) => {
      if (!x) return ''
      const prefix = x.bucket === 'BRASIL' ? 'Brasil' : x.bucket === 'COMMODITIES' ? 'Commodities' : 'Global'
      return `${prefix} • ${x.driver}`
    }

    const topFactors = (xs: WebNewsItem[], n: number) => {
      const m = new Map<string, number>()
      for (const x of xs) {
        const k = factorLabel(x)
        if (!k) continue
        m.set(k, (m.get(k) || 0) + 1)
      }
      return Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k]) => k)
    }

    const scoreRisk = (xs: WebNewsItem[]) => {
      let s = 0
      for (const x of xs) {
        if (x.impact.win === '↑' && x.impact.wdo === '↓') s += 1
        if (x.impact.win === '↓' && x.impact.wdo === '↑') s -= 1
      }
      return s
    }

    const risk = scoreRisk(items)
    const sentiment = risk >= 3 ? 'Muito Otimista' : risk >= 1 ? 'Otimista' : risk <= -3 ? 'Muito Pessimista' : risk <= -1 ? 'Pessimista' : 'Neutro'
    const regime = risk >= 2 ? 'risk-on' : risk <= -2 ? 'risk-off' : 'transição'

    const bullish = topFactors(items.filter(x => x.impact.win === '↑' && x.impact.wdo === '↓'), 3)
    const bearish = topFactors(items.filter(x => x.impact.win === '↓' && x.impact.wdo === '↑'), 3)

    const conflicts = []
    const hasUp = items.some(x => x.impact.win === '↑' && x.impact.wdo === '↓')
    const hasDown = items.some(x => x.impact.win === '↓' && x.impact.wdo === '↑')
    if (hasUp && hasDown) conflicts.push('CONFLITO DE NARRATIVA: sinais mistos (risk-on e risk-off) nas manchetes.')

    const thesis = {
      global: `GLOBAL: ${regime} com foco em ${topDrivers(byBucket.GLOBAL, 2).join(' / ') || 'macro'}; implicação: ativos de risco tendem a ${regime === 'risk-off' ? 'perder tração' : regime === 'risk-on' ? 'ganhar suporte' : 'ficar seletivos'}.`,
      brasil: `BRASIL: drivers dominantes ${topDrivers(byBucket.BRASIL, 2).join(' / ') || 'fiscal/BC'}; implicação provável: BRL/WDO e ativos locais tendem a responder por assimetria e ruído institucional.`,
      commodities: `COMMODITIES: foco em ${topDrivers(byBucket.COMMODITIES, 2).join(' / ') || 'energia/minério/agro'}; leitura: termos de troca podem amplificar ou amortecer fluxo para Brasil.`,
    }

    return {
      ok: true,
      summary: {
        globalTop: topDrivers(byBucket.GLOBAL, 5),
        brasilTop: topDrivers(byBucket.BRASIL, 3),
        commoditiesTop: topDrivers(byBucket.COMMODITIES, 3),
        sentiment,
        bullish,
        bearish,
        conflicts,
        thesis,
      },
    }
  }

  function scriptForMode(mode: string) {
    if (mode === 'calendar') return 'market:calendar'
    if (mode === 'portfolio') return 'market:portfolio'
    if (mode === 'di') return 'market:di'
    return 'market:once'
  }

  function tryCaptureSummary(chunk: string) {
    const lines = String(chunk || '').split(/\r?\n/g)
    for (const line of lines) {
      if (!line.startsWith('SUMMARY_JSON ')) continue
      const raw = line.slice('SUMMARY_JSON '.length).trim()
      if (!raw) continue
      try {
        currentSummary = JSON.parse(raw) as unknown
        if (state.running) {
          state = { ...state, current: { ...state.current, summary: currentSummary } }
        }
      } catch {
        void 0
      }
    }
  }

  function manualCooldownInfo() {
    const now = Date.now()
    const last = lastManualStartMs
    const remainingMs = last ? Math.max(0, manualCooldownMs - (now - last)) : 0
    const nextAllowedAt = remainingMs ? new Date(now + remainingMs).toISOString() : null
    return {
      cooldownMinutes: Math.max(1, manualCooldownMinutes),
      lastManualStartedAt: last ? new Date(last).toISOString() : null,
      nextAllowedAt,
      remainingSec: Math.ceil(remainingMs / 1000),
    }
  }

  async function resolveGitRepoDir() {
    const candidates = [
      gitSyncRepoDir ? resolveFromWorkspace(gitSyncRepoDir) : null,
      WORKSPACE_ROOT,
      PROJECT_ROOT,
    ].filter(Boolean) as string[]

    for (const dir of candidates) {
      try {
        requireInsideWorkspace('GIT_SYNC_REPO_DIR', dir)
      } catch {
        continue
      }
      const check = await spawnCapture('git', ['rev-parse', '--is-inside-work-tree'], { cwd: dir, env: process.env })
      if (check.exitCode === 0 && check.stdout.trim().toLowerCase() === 'true') return dir
    }
    return null
  }

  async function gitSyncAfterUpdate(meta: { logPath: string; finishedAt: string; exitCode: number; reason: string; mode?: string }) {
    const finish = async (status: string, detail?: string) => {
      await appendLog(meta.logPath, `GIT_SYNC status=${status}${detail ? ` • ${detail}` : ''}\n`)
    }

    if (!gitSyncEnabled) {
      await finish('disabled')
      return
    }
    if (meta.exitCode !== 0) {
      await finish('skip_exit_code')
      return
    }

    await appendLog(meta.logPath, `GIT_SYNC start • ${meta.finishedAt}\n`)

    const repoDir = await resolveGitRepoDir()
    if (!repoDir) {
      await appendLog(meta.logPath, `GIT_SYNC skip • repo not found (set MARKET_GIT_SYNC_REPO_DIR)\n`)
      await finish('repo_missing')
      return
    }

    const remoteName = String(gitSyncRemote || 'origin')
    const hasHttpCreds = (u: string) => /^https?:\/\/[^/]+@/i.test(String(u || '').trim())
    const remoteUrlSafe = (() => {
      const raw = String(gitSyncRemoteUrl || '').trim()
      if (!raw) return null
      if (hasHttpCreds(raw)) return '__blocked_http_credentials__'
      return raw
    })()
    const ensureRemote = async () => {
      const check = await spawnCapture('git', ['remote', 'get-url', remoteName], { cwd: repoDir, env: process.env })
      if (check.exitCode === 0 && check.stdout.trim()) return true
      if (!remoteUrlSafe) {
        await appendLog(meta.logPath, `GIT_SYNC skip • remote "${remoteName}" not configured (set MARKET_GIT_SYNC_REMOTE_URL)\n`)
        await finish('remote_missing')
        return false
      }
      if (remoteUrlSafe === '__blocked_http_credentials__') {
        await appendLog(meta.logPath, `GIT_SYNC skip • MARKET_GIT_SYNC_REMOTE_URL blocked (do not embed credentials in URL)\n`)
        await finish('remote_url_blocked')
        return false
      }
      await appendLog(meta.logPath, `GIT_SYNC remote bootstrap • ${remoteName} => ${remoteUrlSafe}\n`)
      const add = await spawnCapture('git', ['remote', 'add', remoteName, remoteUrlSafe], { cwd: repoDir, env: process.env })
      if (add.exitCode === 0) return true
      const out = `${add.stdout}\n${add.stderr}`.trim()
      const setUrl = await spawnCapture('git', ['remote', 'set-url', remoteName, remoteUrlSafe], { cwd: repoDir, env: process.env })
      if (setUrl.exitCode === 0) return true
      await appendLog(meta.logPath, `GIT_SYNC error • git remote add/set-url failed\n${out}\n${setUrl.stderr || setUrl.stdout}\n`)
      await finish('failed', 'git remote configure failed')
      return false
    }

    const repoAbs = requireInsideWorkspace('GIT_SYNC_REPO_DIR', repoDir)
    const sourceDirAbs = requireInsideWorkspace('GIT_SYNC_SOURCE_DATA_DIR', resolveFromProject(String(sourceDataDir)))
    const defaultTargetDirRel = path.relative(repoAbs, sourceDirAbs).replace(/\\/g, '/')
    const targetDirRel = String(gitSyncTargetDir || '').trim() ? String(gitSyncTargetDir || '').trim() : defaultTargetDirRel
    const targetDirAbs = requireInsideWorkspace('GIT_SYNC_TARGET_DIR', resolveFromBase(repoAbs, targetDirRel))
    await mkdir(targetDirAbs, { recursive: true })

    await appendLog(meta.logPath, `GIT_SYNC repo • ${repoDir}\n`)
    await appendLog(meta.logPath, `GIT_SYNC target • ${targetDirRel}\n`)
    await appendLog(meta.logPath, `GIT_SYNC source • ${sourceDataDir}\n`)
    const entries = await readdir(sourceDirAbs, { withFileTypes: true })
    const sourceFileNames = entries
      .filter(e => e.isFile())
      .map(e => e.name)
      .filter(name => /\.((json)|(js))$/i.test(name))
      .sort((a, b) => a.localeCompare(b))

    if (!sourceFileNames.length) {
      await appendLog(meta.logPath, `GIT_SYNC skip • no source files found in ${sourceDirAbs}\n`)
      await finish('no_targets')
      return
    }

    const targetRelFromRepo = path.relative(repoAbs, targetDirAbs).replace(/\\/g, '/')
    const targetFiles = sourceFileNames.map(name => path.posix.join(targetRelFromRepo, name))
    const controleRel = 'controle_de_dados.html'

    const sameDir =
      (process.platform === 'win32' ? sourceDirAbs.toLowerCase() : sourceDirAbs) ===
      (process.platform === 'win32' ? targetDirAbs.toLowerCase() : targetDirAbs)
    if (!sameDir) {
      for (const name of sourceFileNames) {
        const srcAbs = path.join(sourceDirAbs, name)
        const destAbs = path.join(targetDirAbs, name)
        await copyFile(srcAbs, destAbs)
      }
    }

    const cached = await spawnCapture('git', ['diff', '--cached', '--name-only'], { cwd: repoDir, env: process.env })
    if (cached.exitCode === 0 && cached.stdout.trim()) {
      await appendLog(meta.logPath, `GIT_SYNC skip • index has staged changes\n`)
      await finish('index_dirty')
      return
    }

    try {
      const gitSync = await readGitSyncStatusFromLog(meta.logPath)
      const snapshot = await buildControleDeDadosSnapshot({
        marketStatus: { ok: true, state },
        logPath: meta.logPath,
        gitSyncStatus: gitSync?.status ?? null,
      })
      snapshot.state.last_cotacoes_finished_iso = meta.finishedAt
      await writeControleDeDadosHtml(snapshot, repoAbs)
    } catch {
      void 0
    }

    const statusFiles = [...targetFiles, controleRel]
    const st2 = await spawnCapture('git', ['status', '--porcelain', '--', ...statusFiles], { cwd: repoDir, env: process.env })
    if (st2.exitCode !== 0) {
      await appendLog(meta.logPath, `GIT_SYNC error • git status failed\n${st2.stderr || st2.stdout}\n`)
      await finish('failed', 'git status failed')
      return
    }
    if (!st2.stdout.trim()) {
      await appendLog(meta.logPath, `GIT_SYNC skip • no changes\n`)
      await finish('no_changes')
      return
    }

    const add = await spawnCapture('git', ['add', '--', ...statusFiles], { cwd: repoDir, env: process.env })
    if (add.exitCode !== 0) {
      await appendLog(meta.logPath, `GIT_SYNC error • git add failed\n${add.stderr || add.stdout}\n`)
      await finish('failed', 'git add failed')
      return
    }

    const msg = `chore(cotacoes): market update ${meta.finishedAt} • ${meta.reason}${meta.mode ? ` • ${meta.mode}` : ''}`
    const commit = await spawnCapture('git', ['commit', '-m', msg], { cwd: repoDir, env: process.env })
    if (commit.exitCode !== 0) {
      const out = `${commit.stdout}\n${commit.stderr}`.trim()
      if (/nothing to commit/i.test(out)) {
        await appendLog(meta.logPath, `GIT_SYNC skip • nothing to commit\n`)
        await finish('no_changes')
        return
      }
      await appendLog(meta.logPath, `GIT_SYNC error • git commit failed\n${out}\n`)
      await finish('failed', 'git commit failed')
      return
    }

    await appendLog(meta.logPath, `GIT_SYNC committed\n${commit.stdout}\n`)

    if (gitSyncPush) {
      if (!(await ensureRemote())) return
      const branchName = String(gitSyncBranch || '').trim()
      const pushRef = branchName ? `HEAD:${branchName}` : 'HEAD'
      const pushArgs = ['push', remoteName, pushRef]
      const push = await spawnCapture('git', pushArgs, { cwd: repoDir, env: process.env })
      if (push.exitCode !== 0) {
        const out = String(push.stderr || push.stdout || '').trim()
        await appendLog(meta.logPath, `GIT_SYNC error • git push failed\n${out}\n`)

        const retriable = /non-fast-forward|fetch first|rejected/i.test(out)
        if (!retriable) {
          await finish('failed', 'git push failed')
          return
        }

        const push2 = await (branchName
          ? (async () => {
              await appendLog(meta.logPath, `GIT_SYNC retry • push --force-with-lease ${remoteName} ${pushRef}\n`)
              return await spawnCapture('git', ['push', '--force-with-lease', remoteName, pushRef], {
                cwd: repoDir,
                env: process.env,
              })
            })()
          : (async () => {
              const curBranch = await spawnCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoDir, env: process.env })
              const branch = (curBranch.stdout.trim() || 'main').trim()
              await appendLog(meta.logPath, `GIT_SYNC retry • pull --no-rebase -X ours ${remoteName} ${branch}\n`)
              const pull = await spawnCapture('git', ['pull', '--no-rebase', '--no-edit', '-X', 'ours', remoteName, branch], {
                cwd: repoDir,
                env: process.env,
              })
              if (pull.exitCode !== 0) {
                await appendLog(meta.logPath, `GIT_SYNC error • git pull failed\n${pull.stderr || pull.stdout}\n`)
                await finish('failed', 'git pull failed')
                return null
              }
              return await spawnCapture('git', pushArgs, { cwd: repoDir, env: process.env })
            })())

        if (!push2) return
        if (push2.exitCode !== 0) {
          await appendLog(meta.logPath, `GIT_SYNC error • git push retry failed\n${push2.stderr || push2.stdout}\n`)
          await finish('failed', 'git push retry failed')
          return
        }

        await appendLog(meta.logPath, `GIT_SYNC pushed (retry)\n${push2.stdout}\n`)
        await finish('pushed')
        return
      }
      await appendLog(meta.logPath, `GIT_SYNC pushed\n${push.stdout}\n`)
      await finish('pushed')
      return
    }
    await finish('committed')
  }

  async function runScheduledIfDue() {
    if (state.running) return false
    if (!schedulePending) return false

    const now = Date.now()
    const last = lastUpdateStartMs
    if (marketScheduleMode !== 'cron' && last && now - last < intervalMs) return false

    schedulePending = false
    return await runUpdate('schedule')
  }

  function isWeekday(d: Date) {
    const day = d.getDay()
    return day >= 1 && day <= 5
  }

  function computeCronSlotsMinutes() {
    const slots: number[] = []
    slots.push(8 * 60 + 30)
    const step = Math.max(5, Math.min(60, intervalMinutes))
    const start = 9 * 60
    const end = 17 * 60
    for (let m = start; m <= end; m += step) slots.push(m)
    if (slots[slots.length - 1] !== end) slots.push(end)
    slots.push(20 * 60)
    return slots
  }

  function nextCronRun(from: Date) {
    const slots = computeCronSlotsMinutes()
    for (let addDays = 0; addDays <= 10; addDays++) {
      const d = new Date(from.getTime())
      d.setDate(d.getDate() + addDays)
      if (!isWeekday(d)) continue

      const base = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
      const nowMin = addDays === 0 ? from.getHours() * 60 + from.getMinutes() : -1

      for (const m of slots) {
        if (addDays === 0 && m <= nowMin) continue
        const run = new Date(base.getTime() + m * 60 * 1000)
        if (run.getTime() > from.getTime()) return run
      }
    }
    return null
  }

  function startCronScheduler() {
    let timer: NodeJS.Timeout | null = null

    const scheduleNext = () => {
      if (timer) clearTimeout(timer)
      const next = nextCronRun(new Date())
      if (!next) return
      const waitMs = Math.max(250, next.getTime() - Date.now())
      timer = setTimeout(() => {
        schedulePending = true
        void runScheduledIfDue()
        void forwardFinancialJuiceToTelegram()
          .then(r => {
            if (!r.ok && r.error !== 'no_items') {
              process.stderr.write(`WARN • Telegram FinancialJuice: ${r.error}\n`)
            }
          })
          .catch(err => {
            process.stderr.write(`WARN • Telegram FinancialJuice: ${String(err instanceof Error ? err.message : err)}\n`)
          })
        scheduleNext()
      }, waitMs)
    }

    scheduleNext()

    return {
      stop: () => {
        if (timer) clearTimeout(timer)
        timer = null
      },
      reschedule: scheduleNext,
    }
  }

  function startFinancialJuicePoller() {
    const ms = telegramFinancialJuicePollSeconds * 1000
    const t = setInterval(() => {
      if (!telegramFinancialJuiceConfigured()) return
      void forwardFinancialJuiceToTelegram()
        .then(r => {
          if (!r.ok && r.error !== 'no_items' && r.error !== 'disabled_or_not_configured') {
            process.stderr.write(`WARN • Telegram FinancialJuice: ${r.error}\n`)
          }
        })
        .catch(err => {
          process.stderr.write(`WARN • Telegram FinancialJuice: ${String(err instanceof Error ? err.message : err)}\n`)
        })
    }, ms)
    return { stop: () => clearInterval(t) }
  }

  async function runConfiguredSubsystems(logPath: string) {
    const raw = env('MARKET_SUBSYSTEMS', 'market:addons') || 'market:addons'
    const list = String(raw)
      .split(/[\n,;]+/g)
      .map(s => s.trim())
      .filter(Boolean)
    if (!list.length) return true
    const timeoutMinutes = Math.max(1, envNumber('MARKET_SUBSYSTEM_TIMEOUT_MINUTES', 10))
    const timeoutMs = timeoutMinutes * 60 * 1000

    let ok = true
    for (const script of list) {
      const args = ['run', '-s', script]
      const res =
        process.platform === 'win32'
          ? await spawnCaptureWithTimeout(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...args], {
              cwd: PROJECT_ROOT,
              env: { ...process.env },
            }, timeoutMs)
          : await spawnCaptureWithTimeout('npm', args, { cwd: PROJECT_ROOT, env: { ...process.env } }, timeoutMs)
      if (res.stdout) await appendLog(logPath, res.stdout)
      if (res.stderr) await appendLog(logPath, res.stderr)
      if (res.exitCode !== 0) ok = false
    }
    return ok
  }

  async function runUpdate(reason: string) {
    if (state.running) return false

    await pruneMarketUpdateLogs()

    const startedAt = nowISO()
    lastUpdateStartMs = Date.now()
    const logPath = path.join(logsDir, `market_update_${safeFileStamp()}.log`)
    const mode = updateMode
    currentSummary = null
    state = { running: true, current: { startedAt, logPath, reason, mode, summary: null }, last: state.last }

    await appendLog(logPath, `START ${startedAt} • ${reason}\n`)
    await appendLog(logPath, `MODE ${mode}\n`)
    try {
      const snapshot = await buildControleDeDadosSnapshot({
        marketStatus: { ok: true, state },
        logPath,
        gitSyncStatus: null,
      })
      await writeControleDeDadosHtml(snapshot, WORKSPACE_ROOT)
    } catch {
      void 0
    }

    const script = scriptForMode(mode)
    const npmArgs = ['run', '-s', script]
    const child =
      process.platform === 'win32'
        ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...npmArgs], {
            cwd: PROJECT_ROOT,
            env: {
              ...process.env,
              MARKET_UPDATE_REASON: reason,
              INVESTING_EXPORT_REQUIRED: process.env.INVESTING_EXPORT_REQUIRED || 'false',
            },
            windowsHide: true,
          })
        : spawn('npm', npmArgs, {
            cwd: PROJECT_ROOT,
            env: {
              ...process.env,
              MARKET_UPDATE_REASON: reason,
              INVESTING_EXPORT_REQUIRED: process.env.INVESTING_EXPORT_REQUIRED || 'false',
            },
            windowsHide: true,
          })

    let timeoutFired = false
    const timeoutMs = marketUpdateTimeoutMinutes * 60 * 1000
    const timeoutTimer = setTimeout(() => {
      if (timeoutFired) return
      timeoutFired = true
      void (async () => {
        await appendLog(logPath, `TIMEOUT • update excedeu ${marketUpdateTimeoutMinutes}min\n`)
        const pid = child && typeof child.pid === 'number' ? child.pid : null
        if (!pid) {
          await appendLog(logPath, `TIMEOUT • sem PID para encerrar\n`)
          return
        }
        if (process.platform === 'win32') {
          const kill = await spawnCapture('taskkill', ['/PID', String(pid), '/T', '/F'], { cwd: PROJECT_ROOT, env: process.env })
          if (kill.exitCode !== 0) {
            await appendLog(logPath, `TIMEOUT • taskkill falhou\n${kill.stderr || kill.stdout}\n`)
          } else {
            await appendLog(logPath, `TIMEOUT • taskkill OK (pid=${pid})\n`)
          }
          return
        }
        try {
          child.kill('SIGKILL')
          await appendLog(logPath, `TIMEOUT • kill OK (pid=${pid})\n`)
        } catch (err) {
          await appendLog(logPath, `TIMEOUT • kill falhou (pid=${pid}) • ${String(err instanceof Error ? err.message : err)}\n`)
        }
      })()
    }, timeoutMs).unref()

    child.stdout.on('data', d => {
      const s = String(d)
      tryCaptureSummary(s)
      void appendLog(logPath, s)
    })
    child.stderr.on('data', d => {
      const s = String(d)
      tryCaptureSummary(s)
      void appendLog(logPath, s)
    })

    child.on('close', code => {
      clearTimeout(timeoutTimer)
      void (async () => {
        const finishedAt = nowISO()
        await appendLog(logPath, `END ${finishedAt} • exit=${code ?? -1}\n`)
        const exitCode = typeof code === 'number' ? code : -1
        const last = {
          startedAt,
          finishedAt,
          exitCode,
          logPath,
          reason,
          mode,
          summary: currentSummary,
        }

        try {
          const snapshot = await buildControleDeDadosSnapshot({
            marketStatus: { ok: true, state },
            logPath,
            gitSyncStatus: null,
          })
          snapshot.state.last_cotacoes_finished_iso = finishedAt
          await writeControleDeDadosHtml(snapshot, WORKSPACE_ROOT)
        } catch {
          void 0
        }

        if (exitCode === 0) {
          try {
            await runConfiguredSubsystems(logPath)
          } catch {
            void 0
          }
        }

        await gitSyncAfterUpdate({ logPath, finishedAt, exitCode, reason, mode })

        state = { running: false, last }

        if (exitCode === 0) {
          try {
            await sendTelegramOperationalOnce({ reason, logPath })
          } catch (err) {
            await appendLog(logPath, `TELEGRAM operational error • ${String(err instanceof Error ? err.message : err)}\n`)
          }
        }

        if (shutdownRequested) {
          if (state.running) return
          if (httpServer) httpServer.close(() => process.exit(0))
          setTimeout(() => process.exit(0), 2500).unref()
          return
        }
        await runScheduledIfDue()
      })()
    })

    return true
  }

  const app = express()
  let shutdownRequested = false
  app.use(express.json())
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  app.get('/controle_de_dados.html', async (_req, res) => {
    const htmlPath = path.resolve(WORKSPACE_ROOT, 'controle_de_dados.html')
    if (!(await fileExists(htmlPath))) return res.status(404).send('not_found')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(await readFile(htmlPath, 'utf8'))
  })

  app.get('/api/market/health', (_req, res) => {
    const now = Date.now()
    const nextDueAt =
      marketScheduleMode === 'cron'
        ? (() => {
            const next = nextCronRun(new Date())
            return next ? next.toISOString() : null
          })()
        : new Date((lastUpdateStartMs ?? now) + intervalMs).toISOString()
    res.json({
      ok: true,
      state,
      manualCooldown: manualCooldownInfo(),
      schedule: {
        mode: marketScheduleMode,
        intervalMinutes,
        pending: schedulePending,
        lastUpdateStartedAt: lastUpdateStartMs ? new Date(lastUpdateStartMs).toISOString() : null,
        nextDueAt,
      },
    })
  })

  app.get('/api/market/status', async (_req, res) => {
    await reloadDotenvIfChanged()
    const now = Date.now()
    const nextDueAt =
      marketScheduleMode === 'cron'
        ? (() => {
            const next = nextCronRun(new Date())
            return next ? next.toISOString() : null
          })()
        : new Date((lastUpdateStartMs ?? now) + intervalMs).toISOString()
    res.json({
      ok: true,
      state,
      manualCooldown: manualCooldownInfo(),
      schedule: {
        mode: marketScheduleMode,
        intervalMinutes,
        pending: schedulePending,
        lastUpdateStartedAt: lastUpdateStartMs ? new Date(lastUpdateStartMs).toISOString() : null,
        nextDueAt,
      },
      telegram: {
        enabled: envBool('TELEGRAM_ENABLED', true),
        operationalEnabled: envBool('TELEGRAM_OPERATIONAL_ENABLED', false),
        sendOn: String(env('TELEGRAM_OPERATIONAL_SEND_ON', 'manual') || 'manual').toLowerCase(),
        cooldownMinutes: telegramOperationalCooldownMinutes,
        lastSentAt: lastTelegramOperationalSentMs ? new Date(lastTelegramOperationalSentMs).toISOString() : null,
      },
      news: {
        financialjuice: {
          enabled: envBool('NEWS_FJ_DISCORD_ENABLED', false),
          channelId: normalizeDiscordChannelId(env('NEWS_DISCORD_CHANNEL_ID', '')),
        },
        telegramFinancialJuice: {
          enabled: envBool('TELEGRAM_FINANCIALJUICE_ENABLED', true),
          configured: telegramFinancialJuiceConfigured(),
          pollSeconds: Math.max(15, envNumber('TELEGRAM_FINANCIALJUICE_POLL_SECONDS', 120)),
        },
      },
    })
  })

  app.get('/api/market/git-sync', async (_req, res) => {
    const logPath = state.running ? state.current.logPath : state.last?.logPath
    if (!logPath) return res.json({ ok: false, error: 'no_log' })
    const gitSync = await readGitSyncStatusFromLog(logPath)
    res.json({ ok: true, logPath, gitSync })
  })

  app.post('/api/telegram/operational/send', async (req, res) => {
    const force = !!(req.body && (req.body.force === true || req.body.force === 1 || req.body.force === '1'))
    try {
      const result = await sendTelegramOperationalOnce({ reason: 'manual', force })
      if (!result.ok) return res.status(400).json(result)
      res.json(result)
    } catch (err) {
      res.status(500).json({ ok: false, error: 'telegram_operational_failed', message: String(err instanceof Error ? err.message : err) })
    }
  })

  app.post('/api/telegram/financialjuice/send', async (req, res) => {
    const bootstrap = !!(req.body && (req.body.bootstrap === true || req.body.bootstrap === 1 || req.body.bootstrap === '1'))
    try {
      const dryRun = !!(req.body && (req.body.dryRun === true || req.body.dryRun === 1 || req.body.dryRun === '1'))
      const maxItemsRaw =
        req.body && (req.body.maxItems !== undefined && req.body.maxItems !== null) ? Number(req.body.maxItems) : null
      const maxItems = maxItemsRaw !== null && Number.isFinite(maxItemsRaw) ? Math.floor(maxItemsRaw) : undefined
      const result = await forwardFinancialJuiceToTelegram({ bootstrap, dryRun, maxItems })
      if (!result.ok) return res.status(400).json(result)
      res.json(result)
    } catch (err) {
      res.status(500).json({ ok: false, error: 'telegram_financialjuice_failed', message: String(err instanceof Error ? err.message : err) })
    }
  })

  app.get('/api/options/summary', async (_req, res) => {
    type OptionsMarketData = {
      last_updated?: string
      spot_price?: number
      overview?: { last_update?: string; spot_price?: number; regime?: string }
      key_levels?: {
        gamma_flip?: number
        gamma_flip_hvl?: number
        gamma_flip_hvl_gaussian?: number
        call_wall?: number
        put_wall?: number
        effective_call_wall?: number
        effective_put_wall?: number
        max_pain?: number
        range_low?: number
        range_high?: number
        expected_moves?: unknown[]
      }
    }

    async function loadOne(symbol: 'WDO' | 'WIN') {
      const jsonPath = path.join(optionsDashboardDir, symbol, 'assets', 'data', 'market_data.json')
      const raw = await readJsonFile<OptionsMarketData>(jsonPath)

      const overviewSpot =
        raw && raw.overview && typeof raw.overview.spot_price === 'number' ? raw.overview.spot_price : null
      const topSpot = raw && typeof raw.spot_price === 'number' ? raw.spot_price : null

      const key = raw && raw.key_levels ? raw.key_levels : null

      const flipCandidate =
        key && typeof key.gamma_flip === 'number'
          ? key.gamma_flip
          : key && typeof key.gamma_flip_hvl === 'number'
            ? key.gamma_flip_hvl
            : key && typeof key.gamma_flip_hvl_gaussian === 'number'
              ? key.gamma_flip_hvl_gaussian
              : null

      const fileUrl = pathToFileURL(path.join(optionsDashboardDir, symbol, 'index.html')).toString()
      const dataUrl = pathToFileURL(jsonPath).toString()

      return {
        symbol,
        updatedAt: (raw && raw.overview && raw.overview.last_update) || raw.last_updated || null,
        spot: overviewSpot ?? topSpot,
        regime: (raw && raw.overview && raw.overview.regime) || null,
        keyLevels: {
          gammaFlip: flipCandidate,
          callWall: key && typeof key.call_wall === 'number' ? key.call_wall : null,
          putWall: key && typeof key.put_wall === 'number' ? key.put_wall : null,
          effectiveCallWall: key && typeof key.effective_call_wall === 'number' ? key.effective_call_wall : null,
          effectivePutWall: key && typeof key.effective_put_wall === 'number' ? key.effective_put_wall : null,
          maxPain: key && typeof key.max_pain === 'number' ? key.max_pain : null,
          rangeLow: key && typeof key.range_low === 'number' ? key.range_low : null,
          rangeHigh: key && typeof key.range_high === 'number' ? key.range_high : null,
        },
        links: { dashboard: fileUrl, data: dataUrl },
      }
    }

    try {
      const [wdo, win] = await Promise.all([loadOne('WDO'), loadOne('WIN')])
      res.json({
        ok: true,
        generatedAt: nowISO(),
        source: { kind: 'dashboard_unificado', dir: optionsDashboardDir },
        items: { WDO: wdo, WIN: win },
      })
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'options_summary_failed',
        generatedAt: nowISO(),
        source: { kind: 'dashboard_unificado', dir: optionsDashboardDir },
        message: String(err instanceof Error ? err.message : err),
      })
    }
  })

  app.get('/api/news/financialjuice', (_req, res) => {
    res.json({ ok: true, generatedAt: nowISO(), provider: 'financialjuice', url: financialJuiceUrl })
  })

  app.get('/api/news/financialjuice/headlines', async (req, res) => {
    function parseLimit(v: unknown) {
      const n = Number(v)
      const cap = Math.max(1, Math.min(80, Number.isFinite(n) ? Math.floor(n) : newsMaxItems))
      return cap
    }

    try {
      await reloadDotenvIfChanged()
      const limit = parseLimit((req.query && (req.query.limit as unknown)) || newsMaxItems)
      const onlyFj = false
      const debugMode = String((req.query && (req.query.debug as unknown)) || '0') === '1'

      const now = Date.now()
      if (cachedHeadlines && now - cachedHeadlines.atMs < newsCacheSeconds * 1000) {
        return res.json(cachedHeadlines.payload)
      }

      const newsFjDiscordEnabledNow = envBool('NEWS_FJ_DISCORD_ENABLED', false)
      if (!newsFjDiscordEnabledNow) {
        const payload = {
          ok: false,
          error: 'disabled',
          generatedAt: nowISO(),
          provider: 'financialjuice',
          mode: 'discord',
          url: financialJuiceUrl,
          message:
            'Ative NEWS_FJ_DISCORD_ENABLED=true e configure NEWS_DISCORD_BOT_TOKEN + NEWS_DISCORD_CHANNEL_ID para receber manchetes no dashboard.',
        }
        cachedHeadlines = { atMs: now, payload }
        return res.status(200).json(payload)
      }

      const newsDiscordBotTokenNow = env('NEWS_DISCORD_BOT_TOKEN', '')
      const newsDiscordChannelIdNow = normalizeDiscordChannelId(env('NEWS_DISCORD_CHANNEL_ID', ''))
      if (!newsDiscordBotTokenNow || !newsDiscordChannelIdNow) {
        const payload = {
          ok: false,
          error: 'not_configured',
          generatedAt: nowISO(),
          provider: 'financialjuice',
          mode: 'discord',
          url: financialJuiceUrl,
          message: 'Faltam variáveis: NEWS_DISCORD_BOT_TOKEN e/ou NEWS_DISCORD_CHANNEL_ID',
        }
        cachedHeadlines = { atMs: now, payload }
        return res.status(200).json(payload)
      }

      const raw = await fetchDiscordMessages(newsDiscordChannelIdNow, Math.max(limit, 25))
      const debug = debugMode
        ? {
            rawCount: Array.isArray(raw) ? raw.length : 0,
            sample: raw && Array.isArray(raw) && raw[0]
              ? {
                  id: raw[0].id,
                  timestamp: raw[0].timestamp || null,
                  author: raw[0].author ? { bot: !!raw[0].author.bot, username: raw[0].author.username ? String(raw[0].author.username) : null } : null,
                  contentHead: raw[0].content ? String(raw[0].content).slice(0, 120) : null,
                  embedsCount: raw[0].embeds && Array.isArray(raw[0].embeds) ? raw[0].embeds.length : 0,
                }
              : null,
          }
        : null
      const itemsRaw = raw
        .filter(m => {
          return !!m
        })
        .flatMap(m => {
          const createdAt = m && m.timestamp ? String(m.timestamp) : null
          const baseId = m && m.id ? String(m.id) : String(Math.random())
          const author = m && m.author ? { bot: !!m.author.bot, username: m.author.username ? String(m.author.username) : null } : null
          return extractTextsFromMessage(m).map((x, idx) => ({
            id: `${baseId}_${idx}`,
            createdAt,
            text: x.text,
            url: x.url || null,
            author,
          }))
        })
        .filter(x => !!x.text)
        .slice(0, limit)

      const items = []
      for (const it of itemsRaw) {
        items.push({
          id: it.id,
          createdAt: it.createdAt,
          original: it.text,
          url: it.url,
          author: it.author,
        })
      }

      const stored = await loadStoredHeadlines(now)
      const byId = new Map<string, StoredHeadline>()
      for (const s of stored) byId.set(s.id, s)
      for (const it of items) {
        const id = String(it.id || '')
        if (!id) continue
        const next: StoredHeadline = {
          id,
          createdAt: it.createdAt ? String(it.createdAt) : null,
          original: String(it.original || ''),
          url: it.url ? String(it.url) : null,
          author: it.author
            ? { bot: !!(it.author as { bot?: boolean }).bot, username: (it.author as { username?: string | null }).username ? String((it.author as { username?: string | null }).username) : null }
            : null,
        }
        byId.set(id, next)
      }
      const mergedAll = Array.from(byId.values())
      const merged = pruneStoredHeadlines(mergedAll, now).sort((a, b) => {
        const am = parseCreatedAtMs(a.createdAt) ?? 0
        const bm = parseCreatedAtMs(b.createdAt) ?? 0
        return bm - am
      })
      await saveStoredHeadlines(merged)
      const outputItems = merged.length ? merged.slice(0, limit) : items.slice(0, limit)

      const payload = {
        ok: true,
        generatedAt: nowISO(),
        provider: 'financialjuice',
        mode: 'discord',
        url: financialJuiceUrl,
        source: { channelId: newsDiscordChannelIdNow },
        filter: { onlyFj },
        store: { enabled: newsHeadlinesStoreEnabled, retentionDays: newsHeadlinesRetentionDays, total: merged.length, rawTotal: mergedAll.length, displayedFromDiscord: merged.length === 0 && items.length > 0 },
        debug,
        items: outputItems,
      }

      cachedHeadlines = { atMs: now, payload }
      res.json(payload)
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'financialjuice_headlines_failed',
        generatedAt: nowISO(),
        provider: 'financialjuice',
        mode: 'discord',
        url: financialJuiceUrl,
        message: String(err instanceof Error ? err.message : err),
      })
    }
  })

  app.get('/api/news/web/module', async (req, res) => {
    function parseLimit(v: unknown) {
      const n = Number(v)
      const cap = Math.max(5, Math.min(80, Number.isFinite(n) ? Math.floor(n) : newsWebMaxItems))
      return cap
    }

    try {
      const limit = parseLimit((req.query && (req.query.limit as unknown)) || newsWebMaxItems)
      const now = Date.now()

      if (cachedWebNews && now - cachedWebNews.atMs < newsWebCacheSeconds * 1000) {
        return res.json(cachedWebNews.payload)
      }

      if (!newsWebEnabled) {
        const payload = {
          ok: false,
          error: 'disabled',
          generatedAt: nowISO(),
          provider: 'web_news_module',
          message: 'Ative NEWS_WEB_ENABLED=true para habilitar o Web News Module.',
        }
        cachedWebNews = { atMs: now, payload }
        return res.status(200).json(payload)
      }

      const rawLists = await Promise.allSettled(
        newsWebRssUrls.map(async url => {
          const xml = await fetchTextWithTimeout(url, 6500)
          const items = parseRssItems(xml)
          return { url, items }
        }),
      )

      const all = []
      for (const r of rawLists) {
        if (r.status !== 'fulfilled') continue
        const host = hostnameOf(r.value.url)
        for (const it of r.value.items) {
          const publishedMs = it.pubDate ? Date.parse(it.pubDate) : NaN
          const within = Number.isFinite(publishedMs) ? now - publishedMs <= newsWebWindowHours * 60 * 60 * 1000 : true
          if (!within) continue

          const title = sanitizeNoNumbers(it.title)
          const link = String(it.link || '').trim()
          if (!title || !link) continue

          const info = classifyWebNewsItem(title, link)
          all.push({
            id: normalizeWebItemId(link, title),
            title,
            url: link,
            publishedAt: Number.isFinite(publishedMs) ? new Date(publishedMs).toISOString() : null,
            source: it.source ? sanitizeNoNumbers(it.source) : host || null,
            bucket: info.bucket,
            driver: info.driver,
            impact: info.impact,
            confidence: info.confidence,
          } satisfies WebNewsItem)
        }
      }

      const byId = new Map<string, WebNewsItem>()
      for (const x of all) byId.set(x.id, x)
      const merged = Array.from(byId.values()).sort((a, b) => {
        const am = a.publishedAt ? Date.parse(a.publishedAt) : 0
        const bm = b.publishedAt ? Date.parse(b.publishedAt) : 0
        return bm - am
      })

      const items = merged.slice(0, limit)
      const summary = summarizeWebNews(items)
      const sources = Array.from(new Set(items.map(x => hostnameOf(x.url)).filter(Boolean))).slice(0, 12)

      const payload = {
        ok: true,
        generatedAt: nowISO(),
        provider: 'web_news_module',
        windowHours: newsWebWindowHours,
        sources,
        items,
        ...(summary.ok ? summary : {}),
      }

      cachedWebNews = { atMs: now, payload }
      res.json(payload)
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'web_news_module_failed',
        generatedAt: nowISO(),
        provider: 'web_news_module',
        message: String(err instanceof Error ? err.message : err),
      })
    }
  })

  app.post('/api/market/update', async (req, res) => {
    const reason =
      (req.body && typeof req.body.reason === 'string' && req.body.reason.trim()) ||
      'manual'

    if (reason !== 'schedule') {
      const info = manualCooldownInfo()
      if (info.remainingSec > 0) {
        res.setHeader('Retry-After', String(info.remainingSec))
        return res.status(429).json({
          ok: false,
          error: 'manual_cooldown',
          state,
          manualCooldown: info,
        })
      }
    }

    const ok = await runUpdate(reason)
    if (!ok) return res.status(409).json({ ok: false, error: 'update_in_progress', state })
    if (reason !== 'schedule') lastManualStartMs = Date.now()
    res.status(202).json({ ok: true, state })
  })

  app.post('/api/market/shutdown', async (_req, res) => {
    shutdownRequested = true
    res.status(202).json({ ok: true, state, shutdown: { requested: true, running: state.running } })
    if (state.running) return
    if (httpServer) httpServer.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 2500).unref()
  })

  const server = app.listen(port, host, () => {
    process.stdout.write(`Market updater em http://${host}:${port}\n`)
    process.stdout.write(`Intervalo: ${intervalMinutes} min\n`)
    process.stdout.write(`Logs: ${logsDir}\n`)
    if (marketScheduleMode === 'cron') {
      process.stdout.write(`Scheduler: cron (8:30, a cada ${Math.max(5, Math.min(60, intervalMinutes))}min até 17:00, e 20:00 • seg-sex)\n`)
      schedulePending = true
      void runScheduledIfDue()
      startCronScheduler()
    } else {
      schedulePending = true
      void runScheduledIfDue()
    }

    if (telegramFinancialJuiceConfigured()) {
      startFinancialJuicePoller()
    }
  })
  httpServer = server
  server.on('error', err => {
    const anyErr = err as NodeJS.ErrnoException
    if (anyErr && anyErr.code === 'EADDRINUSE') {
      process.stderr.write(
        `ERRO • Porta em uso: http://${host}:${port}\n` +
          `- Encerre a outra janela/serviço que já está rodando o market:service\n` +
          `- Ou altere a porta via MARKET_SERVICE_PORT (ex.: set MARKET_SERVICE_PORT=3034)\n`,
      )
      process.exitCode = 1
      return
    }
    process.stderr.write(String(anyErr && (anyErr.stack || anyErr.message) ? anyErr.stack || anyErr.message : anyErr))
    process.exitCode = 1
  })

  if (marketScheduleMode !== 'cron') {
    setInterval(() => {
      schedulePending = true
      void runScheduledIfDue()
    }, intervalMs)
  }
}

main().catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
