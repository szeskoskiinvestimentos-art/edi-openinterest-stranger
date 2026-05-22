import { spawn, type ChildProcess } from 'node:child_process'

export function spawnMarketUpdateProcess(params: {
  projectRoot: string
  platform: NodeJS.Platform
  comspec?: string
  processEnv: NodeJS.ProcessEnv
  script: string
  reason: string
}) {
  const npmArgs = ['run', '-s', params.script]
  const env: NodeJS.ProcessEnv = {
    ...params.processEnv,
    MARKET_UPDATE_REASON: params.reason,
    INVESTING_EXPORT_REQUIRED: params.processEnv.INVESTING_EXPORT_REQUIRED || 'false',
  }
  const opts = { cwd: params.projectRoot, env, windowsHide: true }

  const child: ChildProcess =
    params.platform === 'win32'
      ? spawn(params.comspec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...npmArgs], opts)
      : spawn('npm', npmArgs, opts)

  return child
}
