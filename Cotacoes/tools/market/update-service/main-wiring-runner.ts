import { readdir, stat, unlink } from 'node:fs/promises'
import { gitSyncAfterUpdate } from '../lib/git-sync.ts'
import { buildControleDeDadosSnapshot } from '../lib/update-service/controle-de-dados.ts'
import {
  injectControleDeDadosOptionsViaPython,
  writeControleDeDadosHtml,
} from '../lib/update-service/controle-de-dados-html.ts'
import { spawnCapture, spawnCaptureWithTimeout } from '../lib/update-service/spawn.ts'
import { pruneMarketUpdateLogs as pruneMarketUpdateLogsModule } from '../lib/update-service/log-retention.ts'
import { manualCooldownInfo as manualCooldownInfoModule } from '../lib/update-service/manual-cooldown.ts'
import { tryCaptureSummaryFromChunk } from '../lib/update-service/summary-capture.ts'
import { nextCronRun as nextCronRunModule } from '../lib/update-service/cron-scheduler.ts'
import { runConfiguredSubsystems as runConfiguredSubsystemsModule } from '../lib/update-service/subsystems.ts'
import { validateArtifacts as validateArtifactsModule } from '../lib/update-service/artifact-validation.ts'
import { scriptForMode } from '../lib/update-service/mode-script.ts'
import { startUpdateTimeout } from '../lib/update-service/update-timeout.ts'
import { spawnMarketUpdateProcess } from '../lib/update-service/update-spawn.ts'
import { wireUpdateChildProcess } from '../lib/update-service/update-child-wire.ts'
import { createMarketUpdateRunner } from './runner.ts'
import { nowISO, safeFileStamp } from './env.ts'
import { appendLog } from './fs.ts'
import type { MarketServiceConfig } from './config.ts'
import {
  PROJECT_ROOT,
  requireInsideWorkspace,
  resolveFromBase,
  resolveFromProject,
  resolveFromWorkspace,
  WORKSPACE_ROOT,
} from './paths.ts'
import type { UpdateServiceShutdown, UpdateServiceStores } from './main-wiring-state.ts'
import type { createTelegramWiring } from './telegram.ts'

export function createMainUpdateRunner(params: {
  cfg: MarketServiceConfig
  stores: UpdateServiceStores
  shutdown: UpdateServiceShutdown
  env: typeof import('./env.ts')['env']
  envNumber: typeof import('./env.ts')['envNumber']
  telegramWiring: Pick<ReturnType<typeof createTelegramWiring>, 'sendTelegramOperationalOnce'>
}) {
  const { cfg, stores, shutdown, env, envNumber, telegramWiring } = params

  const pruneMarketUpdateLogs = createPruneMarketUpdateLogs({ stores, logsDir: cfg.logsDir, retentionDays: cfg.marketUpdateLogRetentionDays })
  const tryCaptureSummary = createTryCaptureSummary({ stores })
  const manualCooldownInfo = createManualCooldownInfo({ cfg, stores })
  const gitSyncAfterUpdateLocal = createGitSyncAfterUpdateLocal({ cfg })

  let updateRunner: ReturnType<typeof createMarketUpdateRunner> | null = null
  async function runUpdate(reason: string) {
    return await updateRunner!.runUpdate(reason)
  }

  const runScheduledIfDue = createRunScheduledIfDue({ cfg, stores, runUpdate })
  const nextCronRun = createNextCronRun({ cfg })
  const runConfiguredSubsystems = createRunConfiguredSubsystems({ env, envNumber })
  const validateArtifacts = createValidateArtifacts({ cfg, envNumber })

  updateRunner = createMarketUpdateRunner({
    state: stores.state,
    child: stores.child,
    summary: stores.summary,
    setLastUpdateStartMs: ms => {
      stores.lastUpdateStartMs.set(ms)
    },
    logsDir: cfg.logsDir,
    updateMode: cfg.updateMode,
    marketUpdateTimeoutMinutes: cfg.updateTimeoutMinutes,
    nowISO,
    safeFileStamp,
    appendLog,
    pruneMarketUpdateLogs,
    buildControleDeDadosSnapshot,
    workspaceRoot: WORKSPACE_ROOT,
    writeControleDeDadosHtml,
    injectControleDeDadosOptionsViaPython,
    scriptForMode,
    spawnMarketUpdateProcess,
    projectRoot: PROJECT_ROOT,
    platform: process.platform,
    comspec: process.env.ComSpec,
    processEnv: process.env,
    wireUpdateChildProcess,
    tryCaptureSummary,
    startUpdateTimeout,
    spawnCapture,
    runConfiguredSubsystems,
    validateArtifacts,
    gitSyncAfterUpdateLocal,
    sendTelegramOperationalOnce: ({ reason, logPath }) => telegramWiring.sendTelegramOperationalOnce({ reason, logPath }),
    runScheduledIfDue,
    shutdown,
  })

  return { runUpdate, runScheduledIfDue, nextCronRun, manualCooldownInfo }
}

function createPruneMarketUpdateLogs(params: { stores: UpdateServiceStores; logsDir: string; retentionDays: number }) {
  return async () => {
    const state = params.stores.state.get()
    await pruneMarketUpdateLogsModule({
      logsDir: params.logsDir,
      retentionDays: params.retentionDays,
      keepPaths: [state.running ? state.current.logPath : null, state.last ? state.last.logPath : null],
      readdir,
      stat,
      unlink,
    })
  }
}

function createTryCaptureSummary(params: { stores: UpdateServiceStores }) {
  return (chunk: string) => {
    tryCaptureSummaryFromChunk(chunk, summary => {
      params.stores.summary.set(summary)
      const state = params.stores.state.get()
      if (state.running) params.stores.state.set({ ...state, current: { ...state.current, summary } })
    })
  }
}

function createManualCooldownInfo(params: { cfg: MarketServiceConfig; stores: UpdateServiceStores }) {
  return () => {
    return manualCooldownInfoModule({
      manualCooldownMs: params.cfg.manualCooldownMs,
      manualCooldownMinutes: params.cfg.manualCooldownMinutes,
      lastManualStartMs: params.stores.lastManualStartMs.get(),
    })
  }
}

function createGitSyncAfterUpdateLocal(params: { cfg: MarketServiceConfig }) {
  return async (meta: { logPath: string; finishedAt: string; exitCode: number; reason: string; mode?: string }) => {
    await gitSyncAfterUpdate(meta, {
      workspaceRoot: WORKSPACE_ROOT,
      projectRoot: PROJECT_ROOT,
      repoDirHint: params.cfg.gitSync.repoDir,
      sourceDataDir: String(params.cfg.sourceDataDir),
      targetDirRel: params.cfg.gitSync.targetDir,
      remoteName: params.cfg.gitSync.remote,
      remoteUrl: params.cfg.gitSync.remoteUrl,
      branch: params.cfg.gitSync.branch,
      enabled: params.cfg.gitSync.enabled,
      push: params.cfg.gitSync.push,
      spawnCapture,
      appendLog,
      requireInsideWorkspace,
      resolveFromWorkspace,
      resolveFromProject,
      resolveFromBase,
      env: process.env,
    })
  }
}

function createRunScheduledIfDue(params: { cfg: MarketServiceConfig; stores: UpdateServiceStores; runUpdate: (reason: string) => Promise<boolean> }) {
  return async () => {
    const state = params.stores.state.get()
    if (state.running) return false
    if (!params.stores.schedulePending.get()) return false

    const now = Date.now()
    const last = params.stores.lastUpdateStartMs.get()
    if (params.cfg.scheduler.scheduleMode !== 'cron' && last && now - last < params.cfg.intervalMs) return false

    params.stores.schedulePending.set(false)
    return await params.runUpdate('schedule')
  }
}

function createNextCronRun(params: { cfg: MarketServiceConfig }) {
  return (from: Date) => {
    return nextCronRunModule(from, params.cfg.intervalMinutes)
  }
}

function createRunConfiguredSubsystems(params: { env: typeof import('./env.ts')['env']; envNumber: typeof import('./env.ts')['envNumber'] }) {
  return async (logPath: string) => {
    return await runConfiguredSubsystemsModule({
      logPath,
      env: params.env,
      envNumber: params.envNumber,
      projectRoot: PROJECT_ROOT,
      platform: process.platform,
      comspec: process.env.ComSpec,
      processEnv: process.env,
      spawnCaptureWithTimeout,
      appendLog,
    })
  }
}

function createValidateArtifacts(params: { cfg: MarketServiceConfig; envNumber: typeof import('./env.ts')['envNumber'] }) {
  return async (logPath: string) => {
    return await validateArtifactsModule({
      logPath,
      enabled: params.cfg.validate.beforeGitSync,
      strict: params.cfg.validate.strict,
      envNumber: params.envNumber,
      projectRoot: PROJECT_ROOT,
      platform: process.platform,
      comspec: process.env.ComSpec,
      processEnv: process.env,
      spawnCaptureWithTimeout,
      appendLog,
    })
  }
}
