import type { SpawnResult } from './spawn.ts'

export async function validateArtifacts(params: {
  logPath: string
  enabled: boolean
  strict: boolean
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
  const finish = async (status: string, detail?: string) => {
    await params.appendLog(params.logPath, `VALIDATE status=${status}${detail ? ` • ${detail}` : ''}\n`)
  }

  if (!params.enabled) {
    await finish('disabled')
    return true
  }

  await params.appendLog(params.logPath, `VALIDATE start • market:${params.strict ? 'validate:strict' : 'validate'}\n`)
  const args = ['run', '-s', params.strict ? 'market:validate:strict' : 'market:validate']
  const timeoutMinutes = Math.max(1, params.envNumber('MARKET_VALIDATE_TIMEOUT_MINUTES', 5))
  const timeoutMs = timeoutMinutes * 60 * 1000
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
  if (res.exitCode !== 0) {
    await finish('failed', `exit=${res.exitCode}`)
    return false
  }
  await finish('ok')
  return true
}
