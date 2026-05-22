import type { FlowSentinelItem } from '../../types.js'

export function classifyRiskBlockAction(score: number | null, neutralThreshold: number) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral' as const, label: 'Neutro' }
  if (Math.abs(score) < neutralThreshold) return { state: 'neutral' as const, label: 'Neutro' }
  if (score > 0) return { state: 'sell-usd' as const, label: 'Vender USD / Comprar índice' }
  return { state: 'buy-usd' as const, label: 'Comprar USD / Vender índice' }
}

export function classifyProtectionBlockAction(score: number | null, neutralThreshold: number) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral' as const, label: 'Neutro' }
  if (Math.abs(score) < neutralThreshold) return { state: 'neutral' as const, label: 'Neutro' }
  if (score > 0) return { state: 'buy-usd' as const, label: 'Comprar USD / Vender índice' }
  return { state: 'sell-usd' as const, label: 'Vender USD / Comprar índice' }
}

export function item(label: string, symbol: string | null, pct: number | null, sign: 1 | -1): FlowSentinelItem {
  const val = typeof pct === 'number' && Number.isFinite(pct) ? sign * pct : null
  return { label, symbol, pct, val }
}

