import type { SpawnResult } from './spawn.ts'

export async function runConfiguredSubsystems(params: {
  logPath: string
  env: (key: string, fallback?: string) => string | undefined
  envNumber: (key: string, fallback: number) => number
  projectRoot: string
  platform: NodeJS.Platform
  comspec?: string
  processEnv: NodeJS.ProcessEnv
  spawnCaptureWithTimeout: (
    cmd: string,
    args: string[],
    opts: { cwd?: string; env?: NodeJS.ProcessEnv },
    timeoutMs: number,
  ) => Promise<SpawnResult>
  appendLog: (logPath: string, chunk: string) => Promise<void>
}) {
  const raw = params.env('MARKET_SUBSYSTEMS', 'market:addons') || 'market:addons'
  const list = String(raw)
    .split(/[\n,;]+/g)
    .map(s => s.trim())
    .filter(Boolean)
  if (!list.length) return true

  const timeoutMinutes = Math.max(1, params.envNumber('MARKET_SUBSYSTEM_TIMEOUT_MINUTES', 10))
  const timeoutMs = timeoutMinutes * 60 * 1000

  let ok = true
  for (const script of list) {
    const args = ['run', '-s', script]
    const res =
      params.platform === 'win32'
        ? await params.spawnCaptureWithTimeout(
            params.comspec || 'cmd.exe',
            ['/d', '/s', '/c', 'npm', ...args],
            { cwd: params.projectRoot, env: { ...params.processEnv } },
            timeoutMs,
          )
        : await params.spawnCaptureWithTimeout('npm', args, { cwd: params.projectRoot, env: { ...params.processEnv } }, timeoutMs)
    if (res.stdout) await params.appendLog(params.logPath, res.stdout)
    if (res.stderr) await params.appendLog(params.logPath, res.stderr)
    if (res.exitCode !== 0) ok = false
  }
  return ok
}
