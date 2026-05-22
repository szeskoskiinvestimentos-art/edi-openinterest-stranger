import type { MarketQuotes } from '../../types.js'
import { asOfFromPoint, lastPoint, pctFromPoint } from './market.js'
import { clamp, isFiniteNumber } from './stats.js'
import type { PetrobrasModuleRow } from './rows-types.js'

export function addPctRow(
  market: MarketQuotes,
  rows: PetrobrasModuleRow[],
  cfg: {
    key: string
    label: string
    phase: PetrobrasModuleRow['phase']
    symbol: string | null
    preferExtended: boolean
    weight: number
    capAbs: number
    invert?: boolean
    note: string
  },
) {
  const pt = cfg.symbol ? lastPoint(market, cfg.symbol) : null
  const pct = cfg.symbol ? pctFromPoint(pt, cfg.preferExtended) : null
  const v = isFiniteNumber(pct) ? (cfg.invert ? -pct : pct) : null
  const contrib = v === null ? null : cfg.weight * (cfg.capAbs > 0 ? clamp(v, -cfg.capAbs, cfg.capAbs) / cfg.capAbs : 0)
  rows.push({
    key: cfg.key,
    label: cfg.label,
    phase: cfg.phase,
    symbol: cfg.symbol,
    asOf: asOfFromPoint(pt),
    value: v,
    unit: '%',
    capAbs: cfg.capAbs,
    weight: cfg.weight,
    contribution: contrib,
    note: cfg.note,
  })
}

export function addSpreadRow(
  market: MarketQuotes,
  rows: PetrobrasModuleRow[],
  cfg: {
    key: string
    label: string
    phase: PetrobrasModuleRow['phase']
    symbolA: string | null
    preferA: boolean
    symbolB: string | null
    preferB: boolean
    weight: number
    capAbs: number
    invert?: boolean
    note: string
  },
) {
  const ptA = cfg.symbolA ? lastPoint(market, cfg.symbolA) : null
  const ptB = cfg.symbolB ? lastPoint(market, cfg.symbolB) : null
  const pctA = cfg.symbolA ? pctFromPoint(ptA, cfg.preferA) : null
  const pctB = cfg.symbolB ? pctFromPoint(ptB, cfg.preferB) : null
  let v: number | null = null
  if (isFiniteNumber(pctA) && isFiniteNumber(pctB)) v = pctA - pctB
  if (cfg.invert && v !== null) v = -v
  const contrib = v === null ? null : cfg.weight * (cfg.capAbs > 0 ? clamp(v, -cfg.capAbs, cfg.capAbs) / cfg.capAbs : 0)
  rows.push({
    key: cfg.key,
    label: cfg.label,
    phase: cfg.phase,
    symbol: cfg.symbolA || cfg.symbolB,
    asOf: asOfFromPoint(ptA || ptB),
    value: v,
    unit: '%',
    capAbs: cfg.capAbs,
    weight: cfg.weight,
    contribution: contrib,
    note: cfg.note,
  })
}

