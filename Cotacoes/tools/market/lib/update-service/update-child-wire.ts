import type { ChildProcess } from 'node:child_process'

export function wireUpdateChildProcess(params: {
  child: ChildProcess
  logPath: string
  onChunk: (chunk: string) => void
  appendLog: (logPath: string, chunk: string) => Promise<void>
  finalizeOnce: (exitCode: number, endedBy: string) => Promise<void>
}) {
  params.child.stdout?.on('data', d => {
    const s = String(d)
    params.onChunk(s)
    void params.appendLog(params.logPath, s)
  })
  params.child.stderr?.on('data', d => {
    const s = String(d)
    params.onChunk(s)
    void params.appendLog(params.logPath, s)
  })

  params.child.on('error', err => {
    void params.finalizeOnce(-1, `spawn_error:${String(err instanceof Error ? err.message : err)}`)
  })

  params.child.on('close', code => {
    void (async () => {
      const exitCode = typeof code === 'number' ? code : -1
      await params.finalizeOnce(exitCode, 'close')
    })()
  })
}
