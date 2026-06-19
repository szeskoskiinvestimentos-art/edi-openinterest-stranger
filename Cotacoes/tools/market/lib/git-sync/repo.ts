import type { GitSyncDeps } from './types.js'
import { isPathInside } from '../../update-service/paths.js'

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
