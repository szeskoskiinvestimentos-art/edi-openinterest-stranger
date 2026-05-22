import type { ChildProcess } from 'node:child_process'
import type { UpdateState } from './types.ts'
import {
  buildFinalUpdateState,
  safeRunConfiguredSubsystems,
  safeSendTelegramOperationalOnce,
  safeUpdateControleDeDados,
  validateArtifactsForFinalize,
} from './runner-helpers.ts'

export function createFinalizeOnce(params: {
  startedAt: string
  logPath: string
  reason: string
  mode: string
  nowISO: () => string
  appendLog: (logPath: string, chunk: string) => Promise<void>
  state: { set: (next: UpdateState) => void }
  child: { set: (next: ChildProcess | null) => void }
  summary: { get: () => unknown }
  workspaceRoot: string
  buildControleDeDadosSnapshot: (deps: {
    nowISO: () => string
    workspaceRoot: string
    marketStatus?: unknown
    logPath?: string | null
    gitSyncStatus?: string | null
  }) => Promise<any>
  writeControleDeDadosHtml: (snapshot: any, workspaceRoot: string) => Promise<boolean>
  injectControleDeDadosOptionsViaPython: (workspaceRoot: string) => Promise<void>
  runConfiguredSubsystems: (logPath: string) => Promise<unknown>
  validateArtifacts: (logPath: string) => Promise<boolean>
  gitSyncAfterUpdateLocal: (meta: { logPath: string; finishedAt: string; exitCode: number; reason: string; mode?: string }) => Promise<void>
  sendTelegramOperationalOnce: (params: { reason: string; logPath: string }) => Promise<unknown>
  runScheduledIfDue: () => Promise<boolean>
  shutdown: { isRequested: () => boolean; exitNowIfIdle: () => void }
}) {
  let finalized = false
  let timeoutTimer: NodeJS.Timeout | null = null

  const setTimeoutTimer = (timer: NodeJS.Timeout) => {
    timeoutTimer = timer
  }

  const finalizeOnce = async (exitCode: number, endedBy: string) => {
    if (finalized) return
    finalized = true
    if (timeoutTimer) clearTimeout(timeoutTimer)
    params.child.set(null)

    const finishedAt = params.nowISO()
    await params.appendLog(params.logPath, `END ${finishedAt} • exit=${exitCode} • ${endedBy}\n`)

    const finalState = buildFinalUpdateState({
      startedAt: params.startedAt,
      finishedAt,
      exitCode,
      logPath: params.logPath,
      reason: params.reason,
      mode: params.mode,
      summary: params.summary.get(),
    })
    params.state.set(finalState)

    await safeUpdateControleDeDados({
      nowISO: params.nowISO,
      workspaceRoot: params.workspaceRoot,
      marketStatus: { ok: true, state: finalState },
      logPath: params.logPath,
      gitSyncStatus: null,
      buildControleDeDadosSnapshot: params.buildControleDeDadosSnapshot,
      writeControleDeDadosHtml: params.writeControleDeDadosHtml,
      injectControleDeDadosOptionsViaPython: params.injectControleDeDadosOptionsViaPython,
      onSnapshot: snapshot => {
        if (snapshot && snapshot.state) snapshot.state.last_cotacoes_finished_iso = finishedAt
      },
    })

    if (exitCode === 0) {
      await safeRunConfiguredSubsystems({ runConfiguredSubsystems: params.runConfiguredSubsystems, logPath: params.logPath })
    }

    const validateOk = await validateArtifactsForFinalize({
      logPath: params.logPath,
      exitCode,
      appendLog: params.appendLog,
      validateArtifacts: params.validateArtifacts,
    })
    await params.gitSyncAfterUpdateLocal({
      logPath: params.logPath,
      finishedAt,
      exitCode: validateOk ? exitCode : 91,
      reason: params.reason,
      mode: params.mode,
    })

    await safeSendTelegramOperationalOnce({
      reason: params.reason,
      logPath: params.logPath,
      exitCode,
      sendTelegramOperationalOnce: params.sendTelegramOperationalOnce,
      appendLog: params.appendLog,
    })

    if (params.shutdown.isRequested()) {
      params.shutdown.exitNowIfIdle()
      return
    }
    await params.runScheduledIfDue()
  }

  return { finalizeOnce, setTimeoutTimer }
}

