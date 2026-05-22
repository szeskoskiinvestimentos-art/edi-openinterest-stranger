export function parseLimit(params: { value: unknown; fallback: number; min: number; max: number }) {
  const n = Number(params.value)
  const next = Number.isFinite(n) ? Math.floor(n) : params.fallback
  return Math.max(params.min, Math.min(params.max, next))
}

