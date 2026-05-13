export type CsvRow = Record<string, string>

export type MarketPoint = {
  t: string
  price: number
  asOf?: string
  change?: number
  changePct?: number
  extendedPrice?: number
  extendedChangePct?: number
}

export type Asset = {
  symbol: string
  name: string
  exchange?: string
  category: string
  tags?: string[]
}

export type FlowSentinelUsdActionState = 'sell-usd' | 'buy-usd' | 'neutral'

export type FlowSentinelMode = 'risk_on' | 'risk_off' | 'mixed' | 'n/d'

export type FlowSentinelItem = {
  label: string
  symbol: string | null
  pct: number | null
  val: number | null
}

export type FlowSentinelSnapshot = {
  generatedAt?: string
  neutralThreshold: number
  regimeThreshold: number
  oilStrongThreshold: number
  cadRubConfirmThreshold: number
  oilAdjReinforce: number
  strongThreshold: number
  riskBlock: {
    score: number | null
    action: { state: FlowSentinelUsdActionState; label: string }
    observed: number
    items: FlowSentinelItem[]
  }
  protectionBlock: {
    score: number | null
    action: { state: FlowSentinelUsdActionState; label: string }
    observed: number
    items: FlowSentinelItem[]
  }
  oil: {
    score: number | null
    brentPct: number | null
    wtiPct: number | null
    intel: string
    adj: number
    upStrong: boolean
    cadRubConfirm: boolean
  }
  delta: number | null
  composite: number | null
  divergence: {
    active: boolean
    reason: string | null
  }
  neutrality: {
    isTrueNeutral: boolean
    reason: string
  }
  regime: { mode: FlowSentinelMode; label: string; action: string }
  thermo: { score10: number | null; pct: number | null; label: string }
  alerts: string[]
}

export type PortfolioStats = {
  rowsTotal: number
  rowsMissingSymbolOrName: number
  rowsInvalidSymbol: number
  rowsSkippedByPriority: number
  rowsMissingPrice: number
  rowsWithPrice: number
  uniqueSymbols: number
  duplicateSymbols: number
  sampleMissingPriceSymbols: string[]
}

export type MarketQuotes = {
  meta: {
    generatedAt: string
    intervalMinutes: number
    retentionDays: number
    source: string
    portfolioUpdatedAt?: string
    portfolioStats?: PortfolioStats
    diUpdatedAt?: string
    yahooUpdatedAt?: string
    yahooCoverage?: {
      enabled: boolean
      lastRunAt: string
      attemptedAssets: number
      uniqueYahooSymbols: number
      returnedYahooSymbols: number
      updatedAssets: number
      missingAssets: number
      byCategory: Record<string, { assets: number; attempted: number; updated: number; missing: number }>
      updatedSymbols?: string[]
      missingSymbols?: string[]
      symbolOverrides?: { count: number; items: string[] }
      dailyFallbackUsed?: number
      quoteFallbackUsed?: number
      skippedAssets?: number
      nameResolvedUsed?: number
      tradingViewUsed?: number
    }
    coverage?: {
      assets: number
      requiredCritical: string[]
      missingCritical: string[]
      ok: boolean
    }
    flowSentinel?: FlowSentinelSnapshot
  }
  assets: Asset[]
  series: Record<string, MarketPoint[]>
}
