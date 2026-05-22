import { clamp, isFiniteNumber } from '../../stats.js'

export function usdbrlDynamicWeight(params: { oilAvgPct: number | null }) {
  const oilStrength = isFiniteNumber(params.oilAvgPct) ? clamp(Math.max(0, params.oilAvgPct) / 4, 0, 1) : 0
  return 0.7 * (1 - 0.4 * oilStrength)
}
