export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function weightedAvg(xs: Array<{ v: number | null; w: number }>) {
  const pairs = xs
    .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0)
    .map(x => ({ v: x.v as number, w: x.w }))
  if (!pairs.length) return null
  const wsum = pairs.reduce((a, b) => a + b.w, 0)
  if (!(wsum > 0)) return null
  return pairs.reduce((a, b) => a + b.v * b.w, 0) / wsum
}

