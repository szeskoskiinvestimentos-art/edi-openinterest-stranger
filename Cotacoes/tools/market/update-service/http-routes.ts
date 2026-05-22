import path from 'node:path'
import type { ChildProcess } from 'node:child_process'
import type { Express } from 'express'
import type { UpdateState } from './types.ts'

type RegisterMarketServiceHttpRoutesParams = {
  app: Express

  workspaceRoot: string
  projectRoot: string
  platform: NodeJS.Platform
  processEnv: NodeJS.ProcessEnv

  nowISO: () => string
  fileExists: (p: string) => Promise<boolean>
  readFileText: (p: string) => Promise<string>
  appendLog: (logPath: string, chunk: string) => Promise<void>
  spawnCapture: (cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv }) => Promise<{ exitCode: number; stdout: string; stderr: string }>

  reloadDotenvIfChanged: () => Promise<void>
  env: (key: string, fallback?: string) => string | undefined
  envBool: (key: string, fallback: boolean) => boolean
  envNumber: (key: string, fallback: number) => number

  parseLimit: (params: { value: unknown; fallback: number; min: number; max: number }) => number
  normalizeDiscordChannelId: (raw: string) => string

  state: { get: () => UpdateState }
  getCurrentChild: () => ChildProcess | null

  manualCooldownInfo: () => { cooldownMinutes: number; lastManualStartedAt: string | null; nextAllowedAt: string | null; remainingSec: number }
  buildSchedule: () => unknown

  telegramStatus: () => unknown
  newsStatus: () => unknown

  readGitSyncStatusFromLog: (logPath: string) => Promise<unknown>

  sendTelegramOperationalOnce: (opts: { reason: string; logPath?: string; force?: boolean }) => Promise<{ ok: boolean; error?: string; message?: string }>
  forwardFinancialJuiceToTelegram: (opts?: { bootstrap?: boolean; dryRun?: boolean; maxItems?: number }) => Promise<unknown>

  optionsRoutes: { register: (deps: { app: Express; optionsDashboardDir: string; nowISO: () => string; readJsonFile: <T>(p: string) => Promise<T> }) => void; optionsDashboardDir: string; readJsonFile: <T>(p: string) => Promise<T> }
  newsRoutes: {
    register: (deps: any) => Promise<void>
    deps: any
  }

  runUpdate: (reason: string) => Promise<boolean>
  setLastManualStartMs: (ms: number) => void

  shutdown: { request: () => void; isRequested: () => boolean; exitNowIfIdle: () => void }
}

export async function registerMarketServiceHttpRoutes(params: RegisterMarketServiceHttpRoutesParams) {
  registerControleDeDadosRoute(params)
  registerMarketStatusRoutes(params)
  registerGitSyncRoute(params)
  registerTelegramRoutes(params)
  await registerExternalRoutes(params)
  registerUpdateRoute(params)
  registerAbortRoute(params)
  registerShutdownRoute(params)
}

function registerControleDeDadosRoute(params: RegisterMarketServiceHttpRoutesParams) {
  params.app.get('/controle_de_dados.html', async (_req, res) => {
    const htmlPath = path.resolve(params.workspaceRoot, 'controle_de_dados.html')
    if (!(await params.fileExists(htmlPath))) return res.status(404).send('not_found')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(await params.readFileText(htmlPath))
  })
}

function registerMarketStatusRoutes(params: RegisterMarketServiceHttpRoutesParams) {
  params.app.get('/api/market/health', (_req, res) => {
    res.json({
      ok: true,
      state: params.state.get(),
      manualCooldown: params.manualCooldownInfo(),
      schedule: params.buildSchedule(),
    })
  })

  params.app.get('/api/market/status', async (_req, res) => {
    await params.reloadDotenvIfChanged()
    res.json({
      ok: true,
      state: params.state.get(),
      manualCooldown: params.manualCooldownInfo(),
      schedule: params.buildSchedule(),
      telegram: params.telegramStatus(),
      news: params.newsStatus(),
    })
  })
}

function registerGitSyncRoute(params: RegisterMarketServiceHttpRoutesParams) {
  params.app.get('/api/market/git-sync', async (_req, res) => {
    const st = params.state.get()
    const logPath = st.running ? st.current.logPath : st.last ? st.last.logPath : null
    if (!logPath) return res.json({ ok: false, error: 'no_log' })
    const gitSync = await params.readGitSyncStatusFromLog(logPath)
    res.json({ ok: true, logPath, gitSync })
  })
}

function registerTelegramRoutes(params: RegisterMarketServiceHttpRoutesParams) {
  params.app.post('/api/telegram/operational/send', async (req, res) => {
    const force = readBodyFlag(req.body, 'force')
    try {
      const result = await params.sendTelegramOperationalOnce({ reason: 'manual', force })
      if (!result.ok) return res.status(400).json(result)
      res.json(result)
    } catch (err) {
      res
        .status(500)
        .json({ ok: false, error: 'telegram_operational_failed', message: String(err instanceof Error ? err.message : err) })
    }
  })

  params.app.post('/api/telegram/financialjuice/send', async (req, res) => {
    const bootstrap = readBodyFlag(req.body, 'bootstrap')
    try {
      const dryRun = readBodyFlag(req.body, 'dryRun')
      const maxItems = readBodyOptionalFiniteInt(req.body, 'maxItems')
      const result = await params.forwardFinancialJuiceToTelegram({ bootstrap, dryRun, maxItems })
      if (!(result as any).ok) return res.status(400).json(result)
      res.json(result)
    } catch (err) {
      res
        .status(500)
        .json({ ok: false, error: 'telegram_financialjuice_failed', message: String(err instanceof Error ? err.message : err) })
    }
  })
}

async function registerExternalRoutes(params: RegisterMarketServiceHttpRoutesParams) {
  params.optionsRoutes.register({
    app: params.app,
    optionsDashboardDir: params.optionsRoutes.optionsDashboardDir,
    nowISO: params.nowISO,
    readJsonFile: params.optionsRoutes.readJsonFile,
  })
  await params.newsRoutes.register(params.newsRoutes.deps)
}

function registerUpdateRoute(params: RegisterMarketServiceHttpRoutesParams) {
  params.app.post('/api/market/update', async (req, res) => {
    const reason = (req.body && typeof req.body.reason === 'string' && req.body.reason.trim()) || 'manual'

    if (reason !== 'schedule' && reason !== 'force') {
      const info = params.manualCooldownInfo()
      if (info.remainingSec > 0) {
        res.setHeader('Retry-After', String(info.remainingSec))
        return res.status(429).json({ ok: false, error: 'manual_cooldown', state: params.state.get(), manualCooldown: info })
      }
    }

    const ok = await params.runUpdate(reason)
    if (!ok) return res.status(409).json({ ok: false, error: 'update_in_progress', state: params.state.get() })
    if (reason !== 'schedule' && reason !== 'force') params.setLastManualStartMs(Date.now())
    res.status(202).json({ ok: true, state: params.state.get() })
  })
}

function registerAbortRoute(params: RegisterMarketServiceHttpRoutesParams) {
  params.app.post('/api/market/abort', async (_req, res) => {
    const st = params.state.get()
    const currentChild = params.getCurrentChild()
    if (!st.running || !currentChild || typeof currentChild.pid !== 'number') {
      return res.status(409).json({ ok: false, error: 'not_running', state: st })
    }
    const pid = currentChild.pid
    const logPath = st.current.logPath
    await params.appendLog(logPath, `ABORT • requested • pid=${pid}\n`)
    if (params.platform === 'win32') {
      const kill = await params.spawnCapture('taskkill', ['/PID', String(pid), '/T', '/F'], {
        cwd: params.projectRoot,
        env: params.processEnv,
      })
      if (kill.exitCode !== 0) {
        await params.appendLog(logPath, `ABORT • taskkill falhou\n${kill.stderr || kill.stdout}\n`)
        return res.status(500).json({ ok: false, error: 'taskkill_failed', state: st })
      }
      await params.appendLog(logPath, `ABORT • taskkill OK (pid=${pid})\n`)
      return res.status(202).json({ ok: true, pid, state: st })
    }
    try {
      currentChild.kill('SIGKILL')
      await params.appendLog(logPath, `ABORT • kill OK (pid=${pid})\n`)
      return res.status(202).json({ ok: true, pid, state: st })
    } catch (err) {
      await params.appendLog(logPath, `ABORT • kill falhou (pid=${pid}) • ${String(err instanceof Error ? err.message : err)}\n`)
      return res.status(500).json({ ok: false, error: 'kill_failed', state: st })
    }
  })
}

function registerShutdownRoute(params: RegisterMarketServiceHttpRoutesParams) {
  params.app.post('/api/market/shutdown', async (_req, res) => {
    params.shutdown.request()
    res.status(202).json({
      ok: true,
      state: params.state.get(),
      shutdown: { requested: true, running: params.state.get().running },
    })
    params.shutdown.exitNowIfIdle()
  })
}

function readBodyFlag(body: any, key: string) {
  return !!(body && (body[key] === true || body[key] === 1 || body[key] === '1'))
}

function readBodyOptionalFiniteInt(body: any, key: string) {
  const raw = body && body[key] !== undefined && body[key] !== null ? Number(body[key]) : null
  return raw !== null && Number.isFinite(raw) ? Math.floor(raw) : undefined
}
