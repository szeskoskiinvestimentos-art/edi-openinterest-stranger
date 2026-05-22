export type UsTsyFutureItem = {
  tenor: string
  rootSymbol: string
  vertex: string
  yahooSymbol: string
  expiration: number
  expirationFmt: string
  lastPrice: number
  dayChange?: number | null
  dayChangePct?: number | null
}

export type UsTsyExtraItem = {
  label: string
  yahooSymbol: string
  price: number | null
  dayChange?: number | null
  dayChangePct?: number | null
  intradayRangePct?: number | null
  signalScore?: number | null
  asOf?: string | null
}

export type UsTsyCreditVsTreasury = {
  ok: boolean
  mode: string
  avgSpreadScore: number | null
  legs: { TLT: number | null; HYG: number | null; LQD: number | null; JNK: number | null; SHYG: number | null }
  spreads: Array<{ key: string; spreadScore: number }>
}

export type UsTsyFuturesPayload = {
  generatedAt: string
  source: 'yahoo_finance_spark'
  warnings: string[]
  roots: string[]
  basis: 'futuresChain_or_spark'
  items: UsTsyFutureItem[]
  extras: UsTsyExtraItem[]
  creditVsTreasury: UsTsyCreditVsTreasury
  avgChangePct: number | null
  slopeChangePct: number | null
  riskMode: string
  shape: string
}

export function buildUsTsyFuturesPayload(params: {
  roots: string[]
  items: UsTsyFutureItem[]
  extras: UsTsyExtraItem[]
  creditVsTreasury: UsTsyCreditVsTreasury
  avgChangePct: number | null
  slopeChangePct: number | null
  riskMode: string
  shape: string
}): UsTsyFuturesPayload {
  return {
    generatedAt: new Date().toISOString(),
    source: 'yahoo_finance_spark',
    warnings: [],
    roots: params.roots,
    basis: 'futuresChain_or_spark',
    items: params.items,
    extras: params.extras,
    creditVsTreasury: params.creditVsTreasury,
    avgChangePct: params.avgChangePct,
    slopeChangePct: params.slopeChangePct,
    riskMode: params.riskMode,
    shape: params.shape,
  }
}

