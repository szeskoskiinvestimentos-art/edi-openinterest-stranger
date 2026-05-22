import type { MarketPoint } from '../../../types.js'

export function pruneByCutoff(points: MarketPoint[], cutoffMs: number) {
  const out: MarketPoint[] = []
  for (const p of points) {
    const t = p && typeof p.t === 'string' ? Date.parse(p.t) : NaN
    if (!Number.isFinite(t)) continue
    if (t >= cutoffMs) out.push(p)
  }
  return out
}
