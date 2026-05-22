export function clamp(val: number, min: number, max: number) {
  if (!Number.isFinite(val)) return min
  return Math.max(min, Math.min(max, val))
}

export function ymdUtc(d: Date) {
  const yyyy = String(d.getUTCFullYear())
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function safeNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function olsStats(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length)
  if (n < 10) return null
  let sx = 0
  let sy = 0
  let k = 0
  for (let i = 0; i < n; i++) {
    const xi = x[i]
    const yi = y[i]
    if (!Number.isFinite(xi) || !Number.isFinite(yi)) continue
    sx += xi
    sy += yi
    k++
  }
  if (k < 10) return null
  const mx = sx / k
  const my = sy / k
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    const xi = x[i]
    const yi = y[i]
    if (!Number.isFinite(xi) || !Number.isFinite(yi)) continue
    const dx = xi - mx
    const dy = yi - my
    sxx += dx * dx
    syy += dy * dy
    sxy += dx * dy
  }
  if (sxx <= 0 || syy <= 0) return null
  const beta = sxy / sxx
  const alpha = my - beta * mx
  const corr = sxy / Math.sqrt(sxx * syy)
  const r2 = corr * corr
  return { n: k, alpha, beta, corr, r2 }
}

