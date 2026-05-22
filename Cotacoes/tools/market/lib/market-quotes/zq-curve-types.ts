export type ZqCurveItem = {
  vertex: string
  yahooSymbol: string
  expiration: number
  expirationFmt: string
  lastPrice: number
  impliedRatePct: number
  dayChange?: number | null
  dayChangePct?: number | null
}

export type ZqCurvePayload = {
  generatedAt: string
  source: 'investing'
  warnings: string[]
  rootSymbol: string
  contractCount: number
  formula: 'implied_rate_pct = 100 - last_price'
  slopePct: number | null
  riskMode: 'RISK_OFF' | 'RISK_ON' | 'NEUTRO' | 'N/D'
  items: ZqCurveItem[]
}

export function buildZqCurvePayload(params: { rootSymbol: string; items: ZqCurveItem[] }): ZqCurvePayload {
  const items = params.items
  const first = items.length ? items[0] : null
  const last = items.length ? items[items.length - 1] : null
  const slope = first && last ? last.impliedRatePct - first.impliedRatePct : null
  const riskMode = slope === null ? 'N/D' : slope > 0.05 ? 'RISK_OFF' : slope < -0.05 ? 'RISK_ON' : 'NEUTRO'

  return {
    generatedAt: new Date().toISOString(),
    source: 'investing',
    warnings: [],
    rootSymbol: params.rootSymbol,
    contractCount: items.length,
    formula: 'implied_rate_pct = 100 - last_price',
    slopePct: slope,
    riskMode,
    items,
  }
}

