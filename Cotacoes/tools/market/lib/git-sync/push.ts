import type { GitSyncDeps, GitSyncMeta } from './types.js'

export async function pushWithRetry(params: {
  meta: GitSyncMeta
  deps: GitSyncDeps
  repoDir: string
  remoteName: string
  branchName: string
}) {
  const { meta, deps } = params
  const pushRef = params.branchName ? `HEAD:${params.branchName}` : 'HEAD'
  const pushArgs = ['push', params.remoteName, pushRef]
  const push = await deps.spawnCapture('git', pushArgs, { cwd: params.repoDir, env: deps.env })
  if (push.exitCode === 0) return { ok: true as const, stdout: push.stdout }

  const out = String(push.stderr || push.stdout || '').trim()
  await deps.appendLog(meta.logPath, `GIT_SYNC error • git push failed\n${out}\n`)

  const retriable = /non-fast-forward|fetch first|rejected/i.test(out)
  if (!retriable) return { ok: false as const, status: 'push_failed' as const }

  const push2 = await (params.branchName
    ? (async () => {
        await deps.appendLog(meta.logPath, `GIT_SYNC retry • push --force-with-lease ${params.remoteName} ${pushRef}\n`)
        return await deps.spawnCapture('git', ['push', '--force-with-lease', params.remoteName, pushRef], {
          cwd: params.repoDir,
          env: deps.env,
        })
      })()
    : (async () => {
        const curBranch = await deps.spawnCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: params.repoDir, env: deps.env })
        const branch = (curBranch.stdout.trim() || 'main').trim()
        await deps.appendLog(meta.logPath, `GIT_SYNC retry • pull --no-rebase -X ours ${params.remoteName} ${branch}\n`)
        const pull = await deps.spawnCapture('git', ['pull', '--no-rebase', '--no-edit', '-X', 'ours', params.remoteName, branch], {
          cwd: params.repoDir,
          env: deps.env,
        })
        if (pull.exitCode !== 0) {
          await deps.appendLog(meta.logPath, `GIT_SYNC error • git pull failed\n${pull.stderr || pull.stdout}\n`)
          return null
        }
        return await deps.spawnCapture('git', pushArgs, { cwd: params.repoDir, env: deps.env })
      })())

  if (!push2) return { ok: false as const, status: 'pull_failed' as const }
  if (push2.exitCode !== 0) {
    await deps.appendLog(meta.logPath, `GIT_SYNC error • git push retry failed\n${push2.stderr || push2.stdout}\n`)
    return { ok: false as const, status: 'push_retry_failed' as const }
  }

  await deps.appendLog(meta.logPath, `GIT_SYNC pushed (retry)\n${push2.stdout}\n`)
  return { ok: true as const, stdout: push2.stdout, retry: true as const }
}

