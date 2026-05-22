import { clamp, meanAbs } from './math.js'
import type { ForeignFlowRow } from './types.js'

export function deriveForeignFlow(series: ForeignFlowRow[]) {
  if (!series.length) return null
  const latest = series[series.length - 1]
  const last60 = series.slice(-60).map(x => x.foreigners)
  const unit = meanAbs(last60) || 1_000_000_000

  const sumLast = (n: number) => series.slice(-n).reduce((s, x) => s + x.foreigners, 0)
  const cum5 = sumLast(5)
  const cum20 = sumLast(20)
  const ma28 =
    series.length >= 28 ? series.slice(-28).reduce((s, x) => s + x.foreigners, 0) / 28 : series.reduce((s, x) => s + x.foreigners, 0) / series.length

  const score = clamp(cum5 / (unit * 5), -1, 1)
  const bias: 'inflow' | 'outflow' | 'neutral' = score > 0.25 ? 'inflow' : score < -0.25 ? 'outflow' : 'neutral'
  const wdo: '↓' | '↑' | '≈' = bias === 'inflow' ? '↓' : bias === 'outflow' ? '↑' : '≈'
  const win: '↑' | '↓' | '≈' = bias === 'inflow' ? '↑' : bias === 'outflow' ? '↓' : '≈'

  return {
    latest,
    derived: { foreigners: { cum5, cum20, ma28, unit } },
    signal: { score, bias, wdo, win },
  }
}
