import { arrowFromPct } from '../format.js'
import { getLatestPoint } from '../series.js'
import type { MarketQuotes } from '../../../types.ts'
import type { CardsMarketAccess } from './signals-types.js'

export function computeMercosulSignals(params: { quotes: MarketQuotes | null; access: CardsMarketAccess }) {
  const { quotes, access } = params
  const symRx = access.symRx

  const mercosulComponents = (() => {
    const pick = (label: string, matcher: RegExp, invertForScore: boolean) => {
      const key = symRx([matcher])
      const pt = key && quotes ? getLatestPoint(quotes.series[key]) : null
      const pct = pt && typeof pt.changePct === 'number' && Number.isFinite(pt.changePct) ? pt.changePct : null
      const a = arrowFromPct(pct)
      const score = typeof pct === 'number' && Number.isFinite(pct) ? (invertForScore ? -pct : pct) : null
      return { label, key, pct, a, score }
    }
    return [
      pick('USD/BRL (BR)', /^USD\/BRL\b/i, true),
      pick('USD/UYU (UY)', /^USD\/UYU\b/i, true),
      pick('USD/PYG (PY)', /^USD\/PYG\b/i, true),
      pick('USD/ARS (AR)', /^USD\/ARS\b/i, true),
      pick('Ibovespa', /(^\.BVSP$|\bIbovespa\b)/i, false),
      pick('EWZ', /^EWZ\b/i, false),
    ]
  })()

  const mercosulPulse = (() => {
    const avg = (xs: Array<number | null>) => {
      const ns = xs.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
      if (!ns.length) return null
      return ns.reduce((a, b) => a + b, 0) / ns.length
    }
    const fxStrength = avg(mercosulComponents.slice(0, 4).map(x => x.score))
    const eqStrength = avg(mercosulComponents.slice(4).map(x => x.score))
    const hasFx = typeof fxStrength === 'number' && Number.isFinite(fxStrength)
    const hasEq = typeof eqStrength === 'number' && Number.isFinite(eqStrength)
    const score = hasFx && hasEq ? 0.7 * fxStrength + 0.3 * eqStrength : hasFx ? fxStrength : hasEq ? eqStrength : null
    let state = '—'
    if (typeof score === 'number' && Number.isFinite(score)) {
      if (score > 0.25) state = 'Entrada (LatAm/BR forte)'
      else if (score < -0.25) state = 'Saída (USD/Stress LatAm)'
      else state = 'Misto / neutro'
    }
    const mode: 'good' | 'bad' | 'mid' =
      typeof score === 'number' && Number.isFinite(score) ? (score > 0.25 ? 'good' : score < -0.25 ? 'bad' : 'mid') : 'mid'
    return { fxStrength, eqStrength, score, state, mode }
  })()

  return { mercosulComponents, mercosulPulse }
}

export type MercosulSignals = ReturnType<typeof computeMercosulSignals>

