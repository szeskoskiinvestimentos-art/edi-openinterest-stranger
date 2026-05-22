import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import type { GitSyncDeps, GitSyncMeta } from './types.js'

export async function prepareTargetFiles(params: {
  meta: GitSyncMeta
  deps: GitSyncDeps
  repoAbs: string
  sourceDirAbs: string
  targetDirRel: string
}) {
  const { meta, deps } = params

  const targetDirAbs = deps.requireInsideWorkspace('GIT_SYNC_TARGET_DIR', deps.resolveFromBase(params.repoAbs, params.targetDirRel))
  await mkdir(targetDirAbs, { recursive: true })

  deps.appendLog(meta.logPath, `GIT_SYNC target • ${params.targetDirRel}\n`).catch(() => void 0)
  deps.appendLog(meta.logPath, `GIT_SYNC source • ${deps.sourceDataDir}\n`).catch(() => void 0)

  const entries = await readdir(params.sourceDirAbs, { withFileTypes: true })
  const sourceFileNames = entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(name => /\.((json)|(js))$/i.test(name))
    .sort((a, b) => a.localeCompare(b))

  const targetRelFromRepo = path.relative(params.repoAbs, targetDirAbs).replace(/\\/g, '/')
  const targetFiles = sourceFileNames.map(name => path.posix.join(targetRelFromRepo, name))

  const controleRel = 'controle_de_dados.html'

  const sameDir =
    (process.platform === 'win32' ? params.sourceDirAbs.toLowerCase() : params.sourceDirAbs) ===
    (process.platform === 'win32' ? targetDirAbs.toLowerCase() : targetDirAbs)

  if (!sameDir) {
    for (const name of sourceFileNames) {
      await copyFile(path.join(params.sourceDirAbs, name), path.join(targetDirAbs, name))
    }
  }

  return { targetDirAbs, targetRelFromRepo, sameDir, sourceFileNames, targetFiles, controleRel }
}

