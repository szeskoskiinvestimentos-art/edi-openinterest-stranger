import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

export function toEpochSec(ms: number | null) {
  return typeof ms === 'number' && Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

export function toIso(ms: number | null) {
  return typeof ms === 'number' && Number.isFinite(ms) ? new Date(ms).toISOString() : null
}

export async function safeStat(p: string) {
  try {
    const s = await stat(p)
    const ms = typeof s.mtimeMs === 'number' ? s.mtimeMs : null
    return { exists: true as const, size: s.size, mtimeMs: ms, mtime: toEpochSec(ms), mtime_fmt: toIso(ms) }
  } catch {
    return { exists: false as const, size: null, mtimeMs: null, mtime: null, mtime_fmt: null }
  }
}

export async function safeReadJson<T>(p: string): Promise<T | null> {
  try {
    const raw = await readFile(p, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function listRecentFiles(dir: string, max = 12) {
  try {
    const items = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
      items
        .filter(d => d.isFile())
        .map(async d => {
          const abs = path.join(dir, d.name)
          const st = await safeStat(abs)
          return { name: d.name, path: abs, mtime: st.mtime, mtime_fmt: st.mtime_fmt, size: st.size ?? null, exists: st.exists }
        }),
    )
    files.sort((a, b) => Number(b.mtime ?? 0) - Number(a.mtime ?? 0))
    return files.slice(0, Math.max(0, max))
  } catch {
    return []
  }
}
