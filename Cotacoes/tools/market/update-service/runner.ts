import type { ChildProcess } from 'node:child_process'
import path from 'node:path'
import type { UpdateState } from './types.ts'
import { createFinalizeOnce } from './runner-finalize.ts'
import { safeUpdateControleDeDados } from './runner-helpers.ts'

export type MarketUpdateRunnerDeps = {
  state: { get: () => UpdateState; set: (next: UpdateState) => void }
  child: { get: () => ChildProcess | null; set: (next: ChildProcess | null) => void }
  summary: { get: () => unknown; set: (next: unknown) => void }
  setLastUpdateStartMs: (ms: number) => void

  logsDir: string
  updateMode: string
  marketUpdateTimeoutMinutes: number

  nowISO: () => string
  safeFileStamp: () => string
  appendLog: (logPath: string, chunk: string) => Promise<void>
  pruneMarketUpdateLogs: () => Promise<void>

  buildControleDeDadosSnapshot: (deps: {
    nowISO: () => string
    workspaceRoot: string
    marketStatus?: unknown
    logPath?: string | null
    gitSyncStatus?: string | null
  }) => Promise<any>
  workspaceRoot: string
  writeControleDeDadosHtml: (snapshot: any, workspaceRoot: string) => Promise<boolean>
  injectControleDeDadosOptionsViaPython: (workspaceRoot: string) => Promise<void>

  scriptForMode: (mode: string) => string
  spawnMarketUpdateProcess: (deps: {
    projectRoot: string
    platform: NodeJS.Platform
    comspec: string | undefined
    processEnv: NodeJS.ProcessEnv
    script: string
    reason: string
  }) => ChildProcess
  projectRoot: string
  platform: NodeJS.Platform
  comspec: string | undefined
  processEnv: NodeJS.ProcessEnv

  wireUpdateChildProcess: (deps: {
    child: ChildProcess
    logPath: string
    onChunk: (chunk: string) => void
    appendLog: (logPath: string, chunk: string) => Promise<void>
    finalizeOnce: (exitCode: number, endedBy: string) => Promise<void>
  }) => void
  tryCaptureSummary: (chunk: string) => void
  startUpdateTimeout: (deps: {
    logPath: string
    minutes: number
    child: ChildProcess
    platform: NodeJS.Platform
    projectRoot: string
    processEnv: NodeJS.ProcessEnv
    appendLog: (logPath: string, chunk: string) => Promise<void>
    spawnCapture: (cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv }) => Promise<{
      exitCode: number
      stdout: string
      stderr: string
    }>
    finalizeOnce: (exitCode: number, endedBy: string) => Promise<void>
  }) => NodeJS.Timeout
  spawnCapture: (cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv }) => Promise<{
    exitCode: number
    stdout: string
    stderr: string
  }>

  runConfiguredSubsystems: (logPath: string) => Promise<unknown>
  validateArtifacts: (logPath: string) => Promise<boolean>
  gitSyncAfterUpdateLocal: (meta: {
    logPath: string
    finishedAt: string
    exitCode: number
    reason: string
    mode?: string
  }) => Promise<void>
  sendTelegramOperationalOnce: (params: { reason: string; logPath: string }) => Promise<unknown>

  runScheduledIfDue: () => Promise<boolean>
  shutdown: { isRequested: () => boolean; exitNowIfIdle: () => void }
}

export function createMarketUpdateRunner(deps: MarketUpdateRunnerDeps) {
  async function runUpdate(reason: string) {
    if (deps.state.get().running) return false

    const prevState = deps.state.get()
    await deps.pruneMarketUpdateLogs()

    const startedAt = deps.nowISO()
    deps.setLastUpdateStartMs(Date.now())
    const logPath = path.join(deps.logsDir, `market_update_${deps.safeFileStamp()}.log`)
    const mode = reason === 'force' ? 'all' : deps.updateMode
    deps.summary.set(null)
    deps.state.set({
      running: true,
      current: { startedAt, logPath, reason, mode, summary: null },
      last: prevState.running ? undefined : prevState.last,
    })

    await deps.appendLog(logPath, `START ${startedAt} • ${reason}\n`)
    await deps.appendLog(logPath, `MODE ${mode}\n`)
    await safeUpdateControleDeDados({
      nowISO: deps.nowISO,
      workspaceRoot: deps.workspaceRoot,
      marketStatus: { ok: true, state: deps.state.get() },
      logPath,
      gitSyncStatus: null,
      buildControleDeDadosSnapshot: deps.buildControleDeDadosSnapshot,
      writeControleDeDadosHtml: deps.writeControleDeDadosHtml,
      injectControleDeDadosOptionsViaPython: deps.injectControleDeDadosOptionsViaPython,
    })

    const script = deps.scriptForMode(mode)
    const child = deps.spawnMarketUpdateProcess({
      projectRoot: deps.projectRoot,
      platform: deps.platform,
      comspec: deps.comspec,
      processEnv: deps.processEnv,
      script,
      reason,
    })

    deps.child.set(child)
    const current = deps.state.get()
    if (current.running && typeof child.pid === 'number') {
      deps.state.set({ ...current, current: { ...current.current, pid: child.pid } })
    }

    const fin = createFinalizeOnce({
      startedAt,
      logPath,
      reason,
      mode,
      nowISO: deps.nowISO,
      appendLog: deps.appendLog,
      state: deps.state,
      child: deps.child,
      summary: deps.summary,
      workspaceRoot: deps.workspaceRoot,
      buildControleDeDadosSnapshot: deps.buildControleDeDadosSnapshot,
      writeControleDeDadosHtml: deps.writeControleDeDadosHtml,
      injectControleDeDadosOptionsViaPython: deps.injectControleDeDadosOptionsViaPython,
      runConfiguredSubsystems: deps.runConfiguredSubsystems,
      validateArtifacts: deps.validateArtifacts,
      gitSyncAfterUpdateLocal: deps.gitSyncAfterUpdateLocal,
      sendTelegramOperationalOnce: deps.sendTelegramOperationalOnce,
      runScheduledIfDue: deps.runScheduledIfDue,
      shutdown: deps.shutdown,
    })
    const timeoutTimer = deps.startUpdateTimeout({
      logPath,
      minutes: deps.marketUpdateTimeoutMinutes,
      child,
      platform: deps.platform,
      projectRoot: deps.projectRoot,
      processEnv: deps.processEnv,
      appendLog: deps.appendLog,
      spawnCapture: deps.spawnCapture,
      finalizeOnce: fin.finalizeOnce,
    })
    fin.setTimeoutTimer(timeoutTimer)
    deps.wireUpdateChildProcess({
      child,
      logPath,
      onChunk: deps.tryCaptureSummary,
      appendLog: deps.appendLog,
      finalizeOnce: fin.finalizeOnce,
    })

    return true
  }

  return { runUpdate }
}
