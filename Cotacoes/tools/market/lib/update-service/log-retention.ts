import path from 'node:path'

export async function pruneMarketUpdateLogs(params: {
  logsDir: string
  retentionDays: number
  keepPaths: Array<string | null | undefined>
  readdir: (dir: string) => Promise<string[]>
  stat: (p: string) => Promise<{ mtimeMs: number }>
  unlink: (p: string) => Promise<void>
}) {
  try {
    const keep = new Set<string>()
    for (const p of params.keepPaths) {
      if (!p) continue
      try {
        keep.add(path.resolve(p))
      } catch {
        void 0
      }
    }

    const days = Math.max(1, params.retentionDays)
    const cutoffMs = Date.now() - days * 86400 * 1000
    const items = await params.readdir(params.logsDir)
    for (const name of items) {
      if (!name.startsWith('market_update_') || !name.endsWith('.log')) continue
      const p = path.join(params.logsDir, name)
      let rp = p
      try {
        rp = path.resolve(p)
      } catch {
        void 0
      }
      if (keep.has(rp)) continue
      try {
        const st = await params.stat(p)
        if (st.mtimeMs > cutoffMs) continue
        await params.unlink(p)
      } catch {
        void 0
      }
    }
  } catch {
    void 0
  }
}

