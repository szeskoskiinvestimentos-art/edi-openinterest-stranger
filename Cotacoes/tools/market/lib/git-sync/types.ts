export type SpawnResult = {
  exitCode: number
  stdout: string
  stderr: string
}

export type SpawnCapture = (cmd: string, args: string[], opts?: { cwd?: string; env?: NodeJS.ProcessEnv }) => Promise<SpawnResult>

export type AppendLog = (logPath: string, chunk: string) => Promise<void>

export type GitSyncMeta = {
  logPath: string
  finishedAt: string
  exitCode: number
  reason: string
  mode?: string
}

export type GitSyncDeps = {
  workspaceRoot: string
  projectRoot: string
  repoDirHint?: string | null
  sourceDataDir: string
  targetDirRel?: string | null
  remoteName?: string | null
  remoteUrl?: string | null
  branch?: string | null
  enabled: boolean
  push: boolean
  spawnCapture: SpawnCapture
  appendLog: AppendLog
  requireInsideWorkspace: (label: string, p: string) => string
  resolveFromWorkspace: (p: string) => string
  resolveFromProject: (p: string) => string
  resolveFromBase: (baseDir: string, p: string) => string
  env: NodeJS.ProcessEnv
}

