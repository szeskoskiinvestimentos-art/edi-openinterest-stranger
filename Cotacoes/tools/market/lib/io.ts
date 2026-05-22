import { rename, stat, unlink, writeFile } from 'node:fs/promises'

export async function fileExists(p: string) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

export async function atomicWriteText(finalPath: string, content: string) {
  const tmp = `${finalPath}.tmp_${String(process.pid)}_${String(Date.now())}_${Math.random().toString(16).slice(2)}`
  await writeFile(tmp, content, 'utf-8')

  const bak = `${finalPath}.bak`
  const hasFinal = await fileExists(finalPath)
  if (hasFinal) {
    try {
      await unlink(bak)
    } catch {
      void 0
    }
    try {
      await rename(finalPath, bak)
    } catch (e) {
      try {
        await unlink(tmp)
      } catch {
        void 0
      }
      throw e
    }
  }

  try {
    await rename(tmp, finalPath)
  } catch (e) {
    if (hasFinal) {
      try {
        await rename(bak, finalPath)
      } catch {
        void 0
      }
    }
    try {
      await unlink(tmp)
    } catch {
      void 0
    }
    throw e
  }

  if (hasFinal) {
    try {
      await unlink(bak)
    } catch {
      void 0
    }
  }
}
