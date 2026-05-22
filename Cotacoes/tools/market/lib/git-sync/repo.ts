import path from 'node:path'
import type { GitSyncDeps } from './types.js'

function isPathInside(baseDir: string, targetPath: string) {
  const base = path.resolve(baseDir)
  const target = path.resolve(targetPath)
  const normBase = process.platform === 'win32' ? base.toLowerCase() : base
  const normTarget = process.platform === 'win32' ? target.toLowerCase() : target
  const baseWithSep = normBase.endsWith(path.sep) ? normBase : normBase + path.sep
  return normTarget === normBase || normTarget.startsWith(baseWithSep)
}

export async function resolveGitRepoDir(deps: GitSyncDeps) {
  const candidates = [
    deps.repoDirHint ? deps.resolveFromWorkspace(deps.repoDirHint) : null,
    deps.workspaceRoot,
    deps.projectRoot,
  ].filter(Boolean) as string[]

  for (const dir of candidates) {
    try {
      deps.requireInsideWorkspace('GIT_SYNC_REPO_DIR', dir)
    } catch {
      continue
    }
    const check = await deps.spawnCapture('git', ['rev-parse', '--is-inside-work-tree'], { cwd: dir, env: deps.env })
    if (check.exitCode === 0 && check.stdout.trim().toLowerCase() === 'true') return dir
  }
  return null
}

export function ensureTargetInsideRepo(repoAbs: string, targetAbs: string) {
  return isPathInside(repoAbs, targetAbs)
}

