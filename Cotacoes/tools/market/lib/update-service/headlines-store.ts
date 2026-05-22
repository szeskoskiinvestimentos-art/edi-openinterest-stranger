import path from 'node:path'

export type StoredHeadline = {
  id: string
  createdAt: string | null
  original: string
  url: string | null
  author: { bot: boolean; username: string | null } | null
}

export function parseCreatedAtMs(createdAt: string | null) {
  if (!createdAt) return null
  const t = Date.parse(createdAt)
  return Number.isFinite(t) ? t : null
}

export function pruneStoredHeadlines(items: StoredHeadline[], nowMs: number, retentionDays: number) {
  const days = Math.max(1, retentionDays)
  const cutoff = nowMs - days * 24 * 60 * 60 * 1000
  return items.filter(it => {
    const ms = parseCreatedAtMs(it.createdAt)
    if (ms === null) return true
    return ms >= cutoff
  })
}

export function createStoredHeadlinesStore(params: {
  baseDir: string
  enabled: boolean
  storeFile: string
  retentionDays: number
  nowISO: () => string
  fileExists: (p: string) => Promise<boolean>
  readFile: (p: string, opts: { encoding: 'utf-8' }) => Promise<string>
  mkdir: (p: string, opts: { recursive: boolean }) => Promise<unknown>
  writeFile: (p: string, content: string, opts: { encoding: 'utf-8' }) => Promise<unknown>
}) {
  const filePath = () => {
    const configured = params.storeFile && String(params.storeFile).trim()
    return configured ? String(configured).trim() : path.join(params.baseDir, 'news_financialjuice_headlines.json')
  }

  const load = async (nowMs: number) => {
    if (!params.enabled) return [] as StoredHeadline[]
    const p = filePath()
    try {
      if (!(await params.fileExists(p))) return []
      const raw = await params.readFile(p, { encoding: 'utf-8' })
      const parsed: unknown = raw ? JSON.parse(raw) : null
      const list =
        parsed && typeof parsed === 'object' && 'items' in parsed && Array.isArray((parsed as Record<string, unknown>).items)
          ? ((parsed as Record<string, unknown>).items as unknown[])
          : Array.isArray(parsed)
            ? (parsed as unknown[])
            : []

      const mapped: StoredHeadline[] = []
      for (const x of list) {
        if (!x || typeof x !== 'object') continue
        const o = x as Record<string, unknown>
        const id = typeof o.id === 'string' ? o.id : ''
        const original = typeof o.original === 'string' ? o.original : ''
        if (!id || !original) continue
        mapped.push({
          id,
          createdAt: typeof o.createdAt === 'string' ? o.createdAt : null,
          original,
          url: typeof o.url === 'string' ? o.url : null,
          author:
            o.author && typeof o.author === 'object'
              ? {
                  bot: !!(o.author as Record<string, unknown>).bot,
                  username: typeof (o.author as Record<string, unknown>).username === 'string' ? String((o.author as Record<string, unknown>).username) : null,
                }
              : null,
        })
      }
      return pruneStoredHeadlines(mapped, nowMs, params.retentionDays)
    } catch {
      return []
    }
  }

  const save = async (items: StoredHeadline[]) => {
    if (!params.enabled) return
    const p = filePath()
    await params.mkdir(path.dirname(p), { recursive: true })
    const payload = { updatedAt: params.nowISO(), retentionDays: params.retentionDays, items }
    await params.writeFile(p, JSON.stringify(payload, null, 2), { encoding: 'utf-8' })
  }

  return { load, save }
}

