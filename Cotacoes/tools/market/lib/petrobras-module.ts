import type { MarketQuotes } from '../types.js'
import { buildMissingCorrelated } from './petrobras-module/missing.js'
import { avgPctForSymbols, findSymbol, findSymbolByMatchers, lastPoint, pctFromPoint } from './petrobras-module/market.js'
import { computePetrobrasFlowCorr } from './petrobras-module/flow-corr.js'
import { buildPetrobrasRows } from './petrobras-module/rows.js'
import { resolvePetrobrasSymbols } from './petrobras-module/symbols.js'
import { clamp, isFiniteNumber } from './petrobras-module/stats.js'

export type WebNewsModule = {
  ok?: boolean
  generatedAt?: string
  windowHours?: number
  items?: Array<{
    title?: string
    url?: string
    publishedAt?: string | null
    bucket?: string
    confidence?: string
  }>
}

type PetrobrasModuleRow = {
  key: string
  label: string
  phase: 'pre' | 'regular' | 'any'
  symbol: string | null
  asOf: string | null
  value: number | null
  unit: '%' | 'score'
  capAbs: number
  weight: number
  contribution: number | null
  note: string
}

export type PetrobrasModulePayload = {
  ok: boolean
  provider: 'petrobras_module'
  warnings: string[]
  generatedAt: string
  phase: { nowLabel: string; cutoffLocal: string }
  score: { value: number; bias: 'COMPRA' | 'VENDA' | 'NEUTRO'; confidence: number }
  metrics: {
    usedRows: number
    breadth: { pos: number; neg: number; zero: number }
    contribution: { posSum: number; negSum: number; net: number }
    pnlLike: { posSum: number; negSum: number; net: number }
    flowCorr?: {
      baseSymbol: string | null
      windowPoints: number
      items: Array<{ label: string; corr: number | null; n: number }>
    }
  }
  rows: PetrobrasModuleRow[]
  missingCorrelated: Array<{ label: string; patterns: string[] }>
  news: { used: boolean; matched: number; score: number; top: Array<{ title: string; url: string }> }
}

export function buildPetrobrasModule(input: {
  market: MarketQuotes
  webNews?: WebNewsModule | null
  now?: Date
}): PetrobrasModulePayload {
  const market = input.market
  const now = input.now || new Date()
  const generatedAt = market && market.meta && typeof market.meta.generatedAt === 'string' ? market.meta.generatedAt : new Date().toISOString()

  const cutoffHour = 10
  const isPre = now.getHours() < cutoffHour
  let phaseLabel = isPre ? 'PRÉ (até 10:00)' : 'REGULAR'

  const symbols = resolvePetrobrasSymbols({ market, findSymbol, findSymbolByMatchers, avgPctForSymbols })
  const { symPETR4, symPETR3 } = symbols

  const { rows, news } = buildPetrobrasRows({ market, isPre, symbols, webNews: input.webNews })

  const phaseKey = isPre ? 'pre' : 'regular'
  const usedRows = rows.filter(r => r.phase === 'any' || r.phase === phaseKey)
  const contribs = usedRows.map(r => (isFiniteNumber(r.contribution) ? r.contribution : 0))
  const scoreRaw = contribs.reduce((a, b) => a + b, 0)
  let score = clamp(scoreRaw, -10, 10)

  const wAll = usedRows.reduce((acc, r) => acc + (isFiniteNumber(r.weight) ? Math.abs(r.weight) : 0), 0) || 1
  const wHave = usedRows.reduce((acc, r) => acc + (r.contribution === null ? 0 : Math.abs(r.weight)), 0)
  const confidence = clamp(wHave / wAll, 0, 1)

  let bias: PetrobrasModulePayload['score']['bias'] = score > 1.6 ? 'COMPRA' : score < -1.6 ? 'VENDA' : 'NEUTRO'
  if (!isPre) {
    const tapeSym = symPETR4 || symPETR3
    const tapePct = tapeSym ? pctFromPoint(lastPoint(market, tapeSym), false) : null
    if (isFiniteNumber(tapePct) && Math.abs(tapePct) >= 0.9) {
      const tapeBias: PetrobrasModulePayload['score']['bias'] = tapePct > 0 ? 'COMPRA' : 'VENDA'
      if (bias === 'NEUTRO' || bias === tapeBias) {
        bias = tapeBias
        score = tapePct > 0 ? Math.max(score, 1.8) : Math.min(score, -1.8)
        score = clamp(score, -10, 10)
        phaseLabel = `${phaseLabel} • TAPE`
      } else {
        phaseLabel = `${phaseLabel} • TAPE (diverg.)`
      }
    }
  }

  const metrics: PetrobrasModulePayload['metrics'] = (() => {
    const breadth = { pos: 0, neg: 0, zero: 0 }
    const contribution = { posSum: 0, negSum: 0, net: 0 }
    const pnlLike = { posSum: 0, negSum: 0, net: 0 }

    for (const r of usedRows) {
      const c = isFiniteNumber(r.contribution) ? r.contribution : null
      if (c !== null) {
        contribution.net += c
        if (c > 0) {
          breadth.pos += 1
          contribution.posSum += c
        } else if (c < 0) {
          breadth.neg += 1
          contribution.negSum += c
        } else {
          breadth.zero += 1
        }
      }

      const v = isFiniteNumber(r.value) ? r.value : null
      if (v !== null && isFiniteNumber(r.capAbs) && r.capAbs > 0 && isFiniteNumber(r.weight)) {
        const pnl = r.weight * clamp(v, -r.capAbs, r.capAbs)
        pnlLike.net += pnl
        if (pnl > 0) pnlLike.posSum += pnl
        else if (pnl < 0) pnlLike.negSum += pnl
      }
    }

    return { usedRows: usedRows.length, breadth, contribution, pnlLike }
  })()

  metrics.flowCorr = computePetrobrasFlowCorr({ market, isPre, symbols })

  const missingCorrelated = buildMissingCorrelated(symbols)

  return {
    ok: true,
    provider: 'petrobras_module',
    warnings: [],
    generatedAt,
    phase: { nowLabel: phaseLabel, cutoffLocal: '10:00' },
    score: { value: score, bias, confidence },
    metrics,
    rows,
    missingCorrelated,
    news: { used: news.used, matched: news.matched, score: news.score, top: news.top },
  }
}
