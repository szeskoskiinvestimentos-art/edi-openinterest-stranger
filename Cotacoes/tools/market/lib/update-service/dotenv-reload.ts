export function createDotenvReloader(params: {
  dotenvPath: string
  stat: (p: string) => Promise<{ mtimeMs: number }>
  config: (opts: { path: string; override: boolean }) => void
}) {
  let lastMtimeMs = 0
  return async function reloadDotenvIfChanged() {
    try {
      const st = await params.stat(params.dotenvPath)
      if (!st || typeof st.mtimeMs !== 'number' || !Number.isFinite(st.mtimeMs)) return
      if (st.mtimeMs <= lastMtimeMs) return
      params.config({ path: params.dotenvPath, override: true })
      lastMtimeMs = st.mtimeMs
    } catch {
      void 0
    }
  }
}

