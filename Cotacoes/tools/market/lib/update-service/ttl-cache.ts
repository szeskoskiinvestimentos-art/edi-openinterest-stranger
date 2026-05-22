export function createTtlCache<T>() {
  let value: { atMs: number; payload: T } | null = null

  const get = (nowMs: number, ttlMs: number) => {
    if (!value) return null
    if (nowMs - value.atMs < Math.max(0, ttlMs)) return value.payload
    return null
  }

  const set = (nowMs: number, payload: T) => {
    value = { atMs: nowMs, payload }
  }

  const clear = () => {
    value = null
  }

  return { get, set, clear }
}

