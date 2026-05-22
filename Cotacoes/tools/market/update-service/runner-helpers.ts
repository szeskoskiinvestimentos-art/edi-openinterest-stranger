import type { UpdateState } from './types.ts'

export async function safeUpdateControleDeDados(params: {
  nowISO: () => string
  workspaceRoot: string
  marketStatus: unknown
  logPath: string
  gitSyncStatus: string | null
  buildControleDeDadosSnapshot: (deps: {
    nowISO: () => string
    workspaceRoot: string
    marketStatus?: unknown
    logPath?: string | null
    gitSyncStatus?: string | null
  }) => Promise<any>
  writeControleDeDadosHtml: (snapshot: any, workspaceRoot: string) => Promise<boolean>
  injectControleDeDadosOptionsViaPython: (workspaceRoot: string) => Promise<void>
  onSnapshot?: (snapshot: any) => void
}) {
  try {
    const snapshot = await params.buildControleDeDadosSnapshot({
      nowISO: params.nowISO,
      workspaceRoot: params.workspaceRoot,
      marketStatus: params.marketStatus,
      logPath: params.logPath,
      gitSyncStatus: params.gitSyncStatus,
    })
    if (params.onSnapshot) params.onSnapshot(snapshot)
    await params.writeControleDeDadosHtml(snapshot, params.workspaceRoot)
    await params.injectControleDeDadosOptionsViaPython(params.workspaceRoot)
  } catch {
    void 0
  }
}

export async function safeRunConfiguredSubsystems(params: { runConfiguredSubsystems: (logPath: string) => Promise<unknown>; logPath: string }) {
  try {
    await params.runConfiguredSubsystems(params.logPath)
  } catch {
    void 0
  }
}

export async function validateArtifactsForFinalize(params: {
  logPath: string
  exitCode: number
  appendLog: (logPath: string, chunk: string) => Promise<void>
  validateArtifacts: (logPath: string) => Promise<boolean>
}) {
  if (params.exitCode !== 0) {
    await params.appendLog(params.logPath, `VALIDATE status=skip_exit_code\n`)
    return true
  }
  try {
    return await params.validateArtifacts(params.logPath)
  } catch {
    await params.appendLog(params.logPath, `VALIDATE status=failed • exception\n`)
    return false
  }
}

export async function safeSendTelegramOperationalOnce(params: {
  reason: string
  logPath: string
  exitCode: number
  sendTelegramOperationalOnce: (params: { reason: string; logPath: string }) => Promise<unknown>
  appendLog: (logPath: string, chunk: string) => Promise<void>
}) {
  if (params.exitCode !== 0) return
  try {
    await params.sendTelegramOperationalOnce({ reason: params.reason, logPath: params.logPath })
  } catch (err) {
    await params.appendLog(params.logPath, `TELEGRAM operational error • ${String(err instanceof Error ? err.message : err)}\n`)
  }
}

export function buildFinalUpdateState(params: {
  startedAt: string
  finishedAt: string
  exitCode: number
  logPath: string
  reason: string
  mode: string
  summary: unknown
}) {
  const last = {
    startedAt: params.startedAt,
    finishedAt: params.finishedAt,
    exitCode: params.exitCode,
    logPath: params.logPath,
    reason: params.reason,
    mode: params.mode,
    summary: params.summary,
  }
  const finalState: UpdateState = { running: false, last }
  return finalState
}

