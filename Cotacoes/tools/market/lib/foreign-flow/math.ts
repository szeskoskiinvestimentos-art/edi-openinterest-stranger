export function clamp(val: number, min: number, max: number) {
  if (!Number.isFinite(val)) return min
  return Math.max(min, Math.min(max, val))
}

export function meanAbs(vals: number[]) {
  let n = 0
  let sum = 0
  for (const x of vals) {
    if (typeof x !== 'number' || !Number.isFinite(x)) continue
    n++
    sum += Math.abs(x)
  }
  return n ? sum / n : 0
}

