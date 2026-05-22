import type { ChildProcess } from 'node:child_process'
import type { SpawnResult } from './spawn.ts'

export function startUpdateTimeout(params: {
  logPath: string
  minutes: number
  child: ChildProcess
  platform: NodeJS.Platform
  projectRoot: string
  processEnv: NodeJS.ProcessEnv
  appendLog: (logPath: string, chunk: string) => Promise<void>
  spawnCapture: (cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv }) => Promise<SpawnResult>
  finalizeOnce: (exitCode: number, endedBy: string) => Promise<void>
}) {
  let timeoutFired = false
  const timeoutMs = params.minutes * 60 * 1000
  return setTimeout(() => {
    if (timeoutFired) return
    timeoutFired = true
    void (async () => {
      await params.appendLog(params.logPath, `TIMEOUT • update excedeu ${params.minutes}min\n`)
      const pid = params.child && typeof params.child.pid === 'number' ? params.child.pid : null
      if (!pid) {
        await params.appendLog(params.logPath, `TIMEOUT • sem PID para encerrar\n`)
        await params.finalizeOnce(-1, 'timeout_no_pid')
        return
      }
      if (params.platform === 'win32') {
        const kill = await params.spawnCapture('taskkill', ['/PID', String(pid), '/T', '/F'], {
          cwd: params.projectRoot,
          env: params.processEnv,
        })
        if (kill.exitCode !== 0) {
          await params.appendLog(params.logPath, `TIMEOUT • taskkill falhou\n${kill.stderr || kill.stdout}\n`)
          await params.finalizeOnce(-1, 'timeout_taskkill_fail')
        } else {
          await params.appendLog(params.logPath, `TIMEOUT • taskkill OK (pid=${pid})\n`)
          await params.finalizeOnce(-2, 'timeout_taskkill_ok')
        }
        return
      }
      try {
        params.child.kill('SIGKILL')
        await params.appendLog(params.logPath, `TIMEOUT • kill OK (pid=${pid})\n`)
        await params.finalizeOnce(-2, 'timeout_kill_ok')
      } catch (err) {
        await params.appendLog(
          params.logPath,
          `TIMEOUT • kill falhou (pid=${pid}) • ${String(err instanceof Error ? err.message : err)}\n`,
        )
        await params.finalizeOnce(-1, 'timeout_kill_fail')
      }
    })()
  }, timeoutMs).unref()
}
