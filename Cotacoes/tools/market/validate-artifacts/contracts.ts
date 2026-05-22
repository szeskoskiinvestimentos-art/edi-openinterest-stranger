export function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export function pickGeneratedAt(obj: unknown): string | null {
  if (!isObject(obj)) return null
  const top = obj.generatedAt
  if (typeof top === 'string' && top.trim()) return top
  const meta = obj.meta
  if (isObject(meta)) {
    const m = meta.generatedAt
    if (typeof m === 'string' && m.trim()) return m
  }
  return null
}

export function pickSource(obj: unknown): string | null {
  if (!isObject(obj)) return null
  const top = obj.source
  if (typeof top === 'string' && top.trim()) return top
  if (isObject(top)) return '__object_source__'
  const meta = obj.meta
  if (isObject(meta)) {
    const m = meta.source
    if (typeof m === 'string' && m.trim()) return m
    if (isObject(m)) return '__object_source__'
  }
  const provider = obj.provider
  if (typeof provider === 'string' && provider.trim()) return provider
  return null
}

export function hasWarningsField(obj: unknown): boolean {
  if (!isObject(obj)) return false
  const top = obj.warnings
  if (Array.isArray(top) && top.every(x => typeof x === 'string')) return true
  const meta = obj.meta
  if (isObject(meta)) {
    const m = meta.warnings
    if (Array.isArray(m) && m.every(x => typeof x === 'string')) return true
  }
  return false
}
