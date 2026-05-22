import type { MarketQuotes } from '../../types.js'
import type { PetrobrasResolvedSymbols } from './symbols.js'
import { buildReturnSeries, correlationAligned, isFiniteNumber } from './stats.js'

export type PetrobrasFlowCorr = {
  baseSymbol: string | null
  windowPoints: number
  items: Array<{ label: string; corr: number | null; n: number }>
}

export function computePetrobrasFlowCorr(params: {
  market: MarketQuotes
  isPre: boolean
  symbols: PetrobrasResolvedSymbols
}): PetrobrasFlowCorr {
  const windowPoints = 180
  const s = params.symbols
  const baseSymbol = (params.isPre ? s.symPBR || s.symPBRA : s.symPETR4 || s.symPETR3) || s.symPBR || s.symPBRA || s.symPETR4 || s.symPETR3
  const base = baseSymbol ? buildReturnSeries(params.market, baseSymbol, windowPoints) : []

  const corrWithBase = (label: string, other: string | null) => {
    if (!baseSymbol || !other) return { label, corr: null, n: 0 }
    const b = buildReturnSeries(params.market, other, windowPoints)
    const out = correlationAligned(base, b)
    return { label, corr: out.corr, n: out.n }
  }

  const corrBrlEmBasket = (() => {
    if (!s.symUSDBRL) return { label: 'USD/BRL × EM Basket', corr: null, n: 0 }
    const basketSymbols = [
      { symbol: s.symUSDMXN, w: 0.35 },
      { symbol: s.symUSDZAR, w: 0.35 },
      { symbol: s.symUSDCLP, w: 0.15 },
      { symbol: s.symUSDTRY, w: 0.15 },
    ].filter(x => !!x.symbol && isFiniteNumber(x.w) && x.w > 0) as Array<{ symbol: string; w: number }>
    if (basketSymbols.length < 2) return { label: 'USD/BRL × EM Basket', corr: null, n: 0 }

    const seriesByT = basketSymbols.map(x => ({
      w: x.w,
      map: new Map(buildReturnSeries(params.market, x.symbol, windowPoints).map(p => [p.tMs, p.r])),
    }))
    const wSum = seriesByT.reduce((s, x) => s + x.w, 0)
    if (!(wSum > 0)) return { label: 'USD/BRL × EM Basket', corr: null, n: 0 }

    const ref = buildReturnSeries(params.market, s.symUSDBRL, windowPoints)
    const basket: Array<{ tMs: number; r: number }> = []
    for (const p of ref) {
      if (!p || !Number.isFinite(p.tMs)) continue
      let sum = 0
      let w = 0
      let n = 0
      for (const s of seriesByT) {
        const r = s.map.get(p.tMs)
        if (!isFiniteNumber(r)) continue
        sum += r * s.w
        w += s.w
        n += 1
      }
      if (n < 2 || !(w > 0)) continue
      const v = sum / w
      if (!Number.isFinite(v)) continue
      basket.push({ tMs: p.tMs, r: v })
    }
    const out = correlationAligned(ref, basket)
    return { label: 'USD/BRL × EM Basket', corr: out.corr, n: out.n }
  })()

  const items = [
    corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × Brent`, s.symBrent),
    corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × DXY`, s.symDXY),
    corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × USD/BRL`, s.symUSDBRL),
    corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × EWZ`, s.symEWZ),
    corrBrlEmBasket,
  ]

  return { baseSymbol, windowPoints, items }
}
