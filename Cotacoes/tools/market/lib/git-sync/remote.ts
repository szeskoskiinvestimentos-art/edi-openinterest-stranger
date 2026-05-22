import type { GitSyncDeps, GitSyncMeta } from './types.js'

function hasHttpCreds(u: string) {
  return /^https?:\/\/[^/]+@/i.test(String(u || '').trim())
}

export function remoteUrlSafe(remoteUrl: string | null | undefined) {
  const raw = String(remoteUrl || '').trim()
  if (!raw) return null
  if (hasHttpCreds(raw)) return '__blocked_http_credentials__' as const
  return raw
}

export async function ensureRemote(params: {
  meta: GitSyncMeta
  deps: GitSyncDeps
  repoDir: string
  remoteName: string
  remoteUrlSafe: string | '__blocked_http_credentials__' | null
}) {
  const { meta, deps, repoDir, remoteName } = params

  const check = await deps.spawnCapture('git', ['remote', 'get-url', remoteName], { cwd: repoDir, env: deps.env })
  if (check.exitCode === 0 && check.stdout.trim()) return { ok: true as const }

  if (!params.remoteUrlSafe) {
    await deps.appendLog(meta.logPath, `GIT_SYNC skip • remote "${remoteName}" not configured (set MARKET_GIT_SYNC_REMOTE_URL)\n`)
    return { ok: false as const, status: 'remote_missing' as const }
  }
  if (params.remoteUrlSafe === '__blocked_http_credentials__') {
    await deps.appendLog(meta.logPath, `GIT_SYNC skip • MARKET_GIT_SYNC_REMOTE_URL blocked (do not embed credentials in URL)\n`)
    return { ok: false as const, status: 'remote_url_blocked' as const }
  }

  await deps.appendLog(meta.logPath, `GIT_SYNC remote bootstrap • ${remoteName} => ${params.remoteUrlSafe}\n`)
  const add = await deps.spawnCapture('git', ['remote', 'add', remoteName, params.remoteUrlSafe], { cwd: repoDir, env: deps.env })
  if (add.exitCode === 0) return { ok: true as const }

  const out = `${add.stdout}\n${add.stderr}`.trim()
  const setUrl = await deps.spawnCapture('git', ['remote', 'set-url', remoteName, params.remoteUrlSafe], { cwd: repoDir, env: deps.env })
  if (setUrl.exitCode === 0) return { ok: true as const }

  await deps.appendLog(meta.logPath, `GIT_SYNC error • git remote add/set-url failed\n${out}\n${setUrl.stderr || setUrl.stdout}\n`)
  return { ok: false as const, status: 'remote_config_failed' as const }
}

