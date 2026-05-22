export function tryCaptureSummaryFromChunk(chunk: string, onSummary: (summary: unknown) => void) {
  const lines = String(chunk || '').split(/\r?\n/g)
  for (const line of lines) {
    if (!line.startsWith('SUMMARY_JSON ')) continue
    const raw = line.slice('SUMMARY_JSON '.length).trim()
    if (!raw) continue
    try {
      onSummary(JSON.parse(raw) as unknown)
    } catch {
      void 0
    }
  }
}

