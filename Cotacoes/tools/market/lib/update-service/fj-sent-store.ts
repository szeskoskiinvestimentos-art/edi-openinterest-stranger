import path from 'node:path'

export function createFinancialJuiceSentStore(params: {
  baseDir: string
  resolveFromBase: (baseDir: string, p: string) => string
  env: (key: string, fallback?: string) => string
  envBool: (key: string, fallback: boolean) => boolean
  envNumber: (key: string, fallback: number) => number
  nowISO: () => string
  fileExists: (p: string) => Promise<boolean>
  readFile: (p: string, opts: { encoding: 'utf-8' }) => Promise<string>
  mkdir: (p: string, opts: { recursive: boolean }) => Promise<unknown>
  writeFile: (p: string, content: string, opts: { encoding: 'utf-8' }) => Promise<unknown>
}) {
  const ids = new Set<string>()
  const fifo: string[] = []
  let dirty = false

  const storePath = () => {
    const configured = params.env('TELEGRAM_FINANCIALJUICE_SENT_STORE_FILE', '')
    return configured && String(configured).trim()
      ? params.resolveFromBase(params.baseDir, String(configured).trim())
      : path.join(params.baseDir, 'telegram_financialjuice_sent.json')
  }

  const clampFifo = () => {
    while (fifo.length > 800) {
      const old = fifo.shift()
      if (old) ids.delete(old)
    }
  }

  const remember = (id: string) => {
    const key = String(id || '').trim()
    if (!key || ids.has(key)) return
    ids.add(key)
    fifo.push(key)
    dirty = true
    clampFifo()
  }

  const has = (id: string) => {
    const key = String(id || '').trim()
    if (!key) return false
    return ids.has(key)
  }

  const load = async (nowMs: number) => {
    if (!params.envBool('TELEGRAM_FINANCIALJUICE_SENT_STORE_ENABLED', true)) return
    const retentionDays = Math.max(1, params.envNumber('TELEGRAM_FINANCIALJUICE_SENT_RETENTION_DAYS', 7))
    try {
      const p = storePath()
      if (!(await params.fileExists(p))) return
      const raw = await params.readFile(p, { encoding: 'utf-8' })
      const parsed: unknown = raw ? JSON.parse(raw) : null
      const list =
        parsed && typeof parsed === 'object' && 'items' in parsed && Array.isArray((parsed as Record<string, unknown>).items)
          ? ((parsed as Record<string, unknown>).items as unknown[])
          : Array.isArray(parsed)
            ? (parsed as unknown[])
            : []
      const cutoff = nowMs - retentionDays * 24 * 60 * 60 * 1000
      for (const x of list) {
        if (!x || typeof x !== 'object') continue
        const o = x as Record<string, unknown>
        const id = typeof o.id === 'string' ? o.id.trim() : ''
        const createdAt = typeof o.createdAt === 'string' ? o.createdAt : null
        const ms = createdAt ? Date.parse(createdAt) : NaN
        if (!id) continue
        if (Number.isFinite(ms) && ms < cutoff) continue
        if (ids.has(id)) continue
        ids.add(id)
        fifo.push(id)
      }
      clampFifo()
      dirty = false
    } catch {
      dirty = false
    }
  }

  const flush = async (nowMs: number) => {
    if (!params.envBool('TELEGRAM_FINANCIALJUICE_SENT_STORE_ENABLED', true)) return
    if (!dirty) return
    try {
      const retentionDays = Math.max(1, params.envNumber('TELEGRAM_FINANCIALJUICE_SENT_RETENTION_DAYS', 7))
      const p = storePath()
      const items = fifo.slice(-800).map(id => ({ id, createdAt: new Date(nowMs).toISOString() }))
      const payload = { updatedAt: params.nowISO(), retentionDays, items }
      await params.mkdir(path.dirname(p), { recursive: true })
      await params.writeFile(p, JSON.stringify(payload, null, 2), { encoding: 'utf-8' })
      dirty = false
    } catch {
      void 0
    }
  }

  return { has, remember, load, flush }
}

