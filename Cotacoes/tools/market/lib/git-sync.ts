import path from 'node:path'
import { prepareTargetFiles } from './git-sync/files.js'
import { ensureTargetInsideRepo, resolveGitRepoDir } from './git-sync/repo.js'
import { ensureRemote, remoteUrlSafe } from './git-sync/remote.js'
import { pushWithRetry } from './git-sync/push.js'
import type { GitSyncDeps, GitSyncMeta } from './git-sync/types.js'

export type { AppendLog, GitSyncDeps, GitSyncMeta, SpawnCapture, SpawnResult } from './git-sync/types.js'

export async function gitSyncAfterUpdate(meta: GitSyncMeta, deps: GitSyncDeps) {
  const finish = async (status: string, detail?: string) => {
    await deps.appendLog(meta.logPath, `GIT_SYNC status=${status}${detail ? ` • ${detail}` : ''}\n`)
  }

  if (!deps.enabled) {
    await finish('disabled')
    return
  }
  if (meta.exitCode !== 0) {
    await finish('skip_exit_code')
    return
  }

  await deps.appendLog(meta.logPath, `GIT_SYNC start • ${meta.finishedAt}\n`)

  const repoDir = await resolveGitRepoDir(deps)
  if (!repoDir) {
    await deps.appendLog(meta.logPath, `GIT_SYNC skip • repo not found (set MARKET_GIT_SYNC_REPO_DIR)\n`)
    await finish('repo_missing')
    return
  }

  const repoAbs = deps.requireInsideWorkspace('GIT_SYNC_REPO_DIR', repoDir)
  const sourceDirAbs = deps.requireInsideWorkspace('GIT_SYNC_SOURCE_DATA_DIR', deps.resolveFromProject(String(deps.sourceDataDir)))
  const defaultTargetDirRel = path.relative(repoAbs, sourceDirAbs).replace(/\\/g, '/')
  const targetDirRel = String(deps.targetDirRel || '').trim() ? String(deps.targetDirRel || '').trim() : defaultTargetDirRel

  const remoteName = String(deps.remoteName || 'origin')
  const remoteSafe = remoteUrlSafe(deps.remoteUrl)

  deps.appendLog(meta.logPath, `GIT_SYNC repo • ${repoDir}\n`).catch(() => void 0)

  const { targetDirAbs, sourceFileNames, targetFiles, controleRel } = await prepareTargetFiles({
    meta,
    deps,
    repoAbs,
    sourceDirAbs,
    targetDirRel,
  })

  if (!sourceFileNames.length) {
    await deps.appendLog(meta.logPath, `GIT_SYNC skip • no source files found in ${sourceDirAbs}\n`)
    await finish('no_targets')
    return
  }

  if (!ensureTargetInsideRepo(repoAbs, targetDirAbs)) {
    await finish('failed', 'target outside repo')
    return
  }

  const cached = await deps.spawnCapture('git', ['diff', '--cached', '--name-only'], { cwd: repoDir, env: deps.env })
  if (cached.exitCode === 0 && cached.stdout.trim()) {
    await deps.appendLog(meta.logPath, `GIT_SYNC skip • index has staged changes\n`)
    await finish('index_dirty')
    return
  }

  const statusFiles = [...targetFiles, controleRel]
  const st2 = await deps.spawnCapture('git', ['status', '--porcelain', '--', ...statusFiles], { cwd: repoDir, env: deps.env })
  if (st2.exitCode !== 0) {
    await deps.appendLog(meta.logPath, `GIT_SYNC error • git status failed\n${st2.stderr || st2.stdout}\n`)
    await finish('failed', 'git status failed')
    return
  }
  if (!st2.stdout.trim()) {
    await deps.appendLog(meta.logPath, `GIT_SYNC skip • no changes\n`)
    await finish('no_changes')
    return
  }

  const add = await deps.spawnCapture('git', ['add', '--', ...statusFiles], { cwd: repoDir, env: deps.env })
  if (add.exitCode !== 0) {
    await deps.appendLog(meta.logPath, `GIT_SYNC error • git add failed\n${add.stderr || add.stdout}\n`)
    await finish('failed', 'git add failed')
    return
  }

  const msg = `chore(cotacoes): market update ${meta.finishedAt} • ${meta.reason}${meta.mode ? ` • ${meta.mode}` : ''}`
  const commit = await deps.spawnCapture('git', ['commit', '-m', msg], { cwd: repoDir, env: deps.env })
  if (commit.exitCode !== 0) {
    const out = `${commit.stdout}\n${commit.stderr}`.trim()
    if (/nothing to commit/i.test(out)) {
      await deps.appendLog(meta.logPath, `GIT_SYNC skip • nothing to commit\n`)
      await finish('no_changes')
      return
    }
    await deps.appendLog(meta.logPath, `GIT_SYNC error • git commit failed\n${out}\n`)
    await finish('failed', 'git commit failed')
    return
  }

  await deps.appendLog(meta.logPath, `GIT_SYNC committed\n${commit.stdout}\n`)

  if (!deps.push) {
    await finish('committed')
    return
  }

  const ensured = await ensureRemote({ meta, deps, repoDir, remoteName, remoteUrlSafe: remoteSafe })
  if (!ensured.ok) {
    await finish(ensured.status)
    return
  }

  const branchName = String(deps.branch || '').trim()
  const pushed = await pushWithRetry({ meta, deps, repoDir, remoteName, branchName })
  if (!pushed.ok) {
    await finish('failed', pushed.status)
    return
  }

  await deps.appendLog(meta.logPath, `GIT_SYNC pushed\n${pushed.stdout}\n`)
  await finish('pushed')
}

