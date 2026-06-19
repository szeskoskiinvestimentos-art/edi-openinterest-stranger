import type { GitSyncDeps, GitSyncMeta } from './types.js'

export async function pushWithRetry(params: {
  meta: GitSyncMeta
  deps: GitSyncDeps
  repoDir: string
  remoteName: string
  branchName: string
}) {
  const { meta, deps } = params
  const allowForcePush = String(deps.env.EDI_GIT_ALLOW_FORCE_PUSH || '').trim() === '1'
  const allowPullOnRetry = String(deps.env.EDI_GIT_ALLOW_PULL_ON_RETRY || '').trim() === '1'
  const pushRef = params.branchName ? `HEAD:${params.branchName}` : 'HEAD'
  const pushArgs = ['push', params.remoteName, pushRef]
  const push = await deps.spawnCapture('git', pushArgs, { cwd: params.repoDir, env: deps.env })
  if (push.exitCode === 0) return { ok: true as const, stdout: push.stdout }

  const out = String(push.stderr || push.stdout || '').trim()
  await deps.appendLog(meta.logPath, `GIT_SYNC error • git push failed\n${out}\n`)

  const retriable = /non-fast-forward|fetch first|rejected/i.test(out)
  if (!retriable) return { ok: false as const, status: 'push_failed' as const }

  if (params.branchName && allowForcePush) {
    const push2 = await (async () => {
      await deps.appendLog(meta.logPath, `GIT_SYNC retry • push --force-with-lease ${params.remoteName} ${pushRef}\n`)
      return await deps.spawnCapture('git', ['push', '--force-with-lease', params.remoteName, pushRef], {
        cwd: params.repoDir,
        env: deps.env,
      })
    })()

    if (push2.exitCode !== 0) {
      await deps.appendLog(meta.logPath, `GIT_SYNC error • git push retry failed\n${push2.stderr || push2.stdout}\n`)
      return { ok: false as const, status: 'push_retry_failed' as const }
    }

    await deps.appendLog(meta.logPath, `GIT_SYNC pushed (retry)\n${push2.stdout}\n`)
    return { ok: true as const, stdout: push2.stdout, retry: true as const }
  }

  if (!params.branchName && allowPullOnRetry) {
    const curBranch = await deps.spawnCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: params.repoDir, env: deps.env })
    const branch = (curBranch.stdout.trim() || 'main').trim()
    await deps.appendLog(meta.logPath, `GIT_SYNC retry • pull --no-rebase -X ours ${params.remoteName} ${branch}\n`)
    const pull = await deps.spawnCapture('git', ['pull', '--no-rebase', '--no-edit', '-X', 'ours', params.remoteName, branch], {
      cwd: params.repoDir,
      env: deps.env,
    })
    if (pull.exitCode !== 0) {
      await deps.appendLog(meta.logPath, `GIT_SYNC error • git pull failed\n${pull.stderr || pull.stdout}\n`)
      return { ok: false as const, status: 'pull_failed' as const }
    }
    const push2 = await deps.spawnCapture('git', pushArgs, { cwd: params.repoDir, env: deps.env })
    if (push2.exitCode !== 0) {
      await deps.appendLog(meta.logPath, `GIT_SYNC error • git push retry failed\n${push2.stderr || push2.stdout}\n`)
      return { ok: false as const, status: 'push_retry_failed' as const }
    }
    await deps.appendLog(meta.logPath, `GIT_SYNC pushed (retry)\n${push2.stdout}\n`)
    return { ok: true as const, stdout: push2.stdout, retry: true as const }
  }

  await deps.appendLog(
    meta.logPath,
    `GIT_SYNC abort • push rejeitado (non-fast-forward). Sem force/pull automatico. Habilite EDI_GIT_ALLOW_FORCE_PUSH=1 ou EDI_GIT_ALLOW_PULL_ON_RETRY=1 se voce realmente quiser este comportamento.\n`,
  )
  return { ok: false as const, status: 'needs_manual_sync' as const }
}
