import { spawn } from 'node:child_process'

export type SpawnResult = {
  exitCode: number
  stdout: string
  stderr: string
}

export function platformCmd(cmd: string) {
  if (process.platform !== 'win32') return cmd
  const c = String(cmd || '').trim().toLowerCase()
  if (c === 'npm') return 'npm.cmd'
  if (c === 'npx') return 'npx.cmd'
  return cmd
}

export function spawnCapture(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) {
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

export function spawnCaptureWithTimeout(
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
