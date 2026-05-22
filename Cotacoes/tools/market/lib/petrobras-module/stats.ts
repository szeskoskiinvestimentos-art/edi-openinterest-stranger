import type { MarketQuotes } from '../../types.js'

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function parseTimeMs(t: string) {
  const ms = Date.parse(String(t || ''))
  return Number.isFinite(ms) ? ms : NaN
}

export function buildReturnSeries(market: MarketQuotes, symbol: string, maxPoints: number) {
  const arr = market && market.series ? market.series[symbol] : null
  if (!Array.isArray(arr) || arr.length < 3) return [] as Array<{ tMs: number; r: number }>

  const slice = maxPoints > 0 ? arr.slice(-Math.max(3, maxPoints)) : arr.slice()
  const out: Array<{ tMs: number; r: number }> = []

  for (let i = 1; i < slice.length; i++) {
    const a = slice[i - 1]
    const b = slice[i]
    if (!a || !b) continue
    const pa = a.price
    const pb = b.price
    if (!isFiniteNumber(pa) || !isFiniteNumber(pb) || pa <= 0 || pb <= 0) continue
    const tMs = parseTimeMs(b.t)
    if (!Number.isFinite(tMs)) continue
    const r = Math.log(pb / pa)
    if (!Number.isFinite(r)) continue
    out.push({ tMs, r })
  }

  return out
}

export function pearson(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length)
  if (n < 20) return null
  let sx = 0
  let sy = 0
  for (let i = 0; i < n; i++) {
    sx += xs[i]!
    sy += ys[i]!
  }
  const mx = sx / n
  const my = sy / n
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx
    const dy = ys[i]! - my
    sxx += dx * dx
    syy += dy * dy
    sxy += dx * dy
  }
  if (!(sxx > 0) || !(syy > 0)) return null
  const c = sxy / Math.sqrt(sxx * syy)
  return Number.isFinite(c) ? clamp(c, -1, 1) : null
}

export function correlationAligned(a: Array<{ tMs: number; r: number }>, b: Array<{ tMs: number; r: number }>) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 20 || b.length < 20) return { corr: null, n: 0 }
  const mapB = new Map<number, number>()
  for (const p of b) {
    if (!p || !Number.isFinite(p.tMs) || !isFiniteNumber(p.r)) continue
    mapB.set(p.tMs, p.r)
  }
  const xs: number[] = []
  const ys: number[] = []
  for (const p of a) {
    if (!p || !Number.isFinite(p.tMs) || !isFiniteNumber(p.r)) continue
    const r2 = mapB.get(p.tMs)
    if (!isFiniteNumber(r2)) continue
    xs.push(p.r)
    ys.push(r2)
  }
  const corr = pearson(xs, ys)
  return { corr, n: xs.length }
}
