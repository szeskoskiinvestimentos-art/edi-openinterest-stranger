export function getFirst(row: Record<string, string>, keys: string[]) {
  for (const k of keys) {
    const v = (row[k] || '').trim()
    if (v) return v
  }
  return ''
}

