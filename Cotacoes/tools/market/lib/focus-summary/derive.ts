import type { FocusDerived, FocusYearPack } from './types.js'

function sgn(x: number | null) {
  return typeof x === 'number' && Number.isFinite(x) ? (x > 0 ? 1 : x < 0 ? -1 : 0) : 0
}

export function buildDerived(params: { years: Record<string, FocusYearPack>; yearsList: string[] }): FocusDerived {
  const refYear = params.yearsList[0]
  const ref = params.years[refYear]
  const score =
    1.0 * sgn(ref?.ipca?.deltaMediana ?? null) +
    1.0 * sgn(ref?.selic?.deltaMediana ?? null) +
    0.6 * sgn(ref?.cambio?.deltaMediana ?? null) +
    -0.4 * sgn(ref?.pib?.deltaMediana ?? null)
  const bias = score > 0.8 ? 'hawkish' : score < -0.8 ? 'dovish' : 'mixed'
  const wdo = bias === 'hawkish' ? '↑' : bias === 'dovish' ? '↓' : '≈'
  const win = bias === 'hawkish' ? '↓' : bias === 'dovish' ? '↑' : '≈'
  return { referenceYear: refYear, score, bias, wdo, win }
}

