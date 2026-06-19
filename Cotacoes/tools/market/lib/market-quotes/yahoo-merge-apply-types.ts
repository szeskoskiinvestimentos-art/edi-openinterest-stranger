import type { Asset } from '../../types.js'
import type { YahooSparkChartLike } from './yahoo-merge-yahoo.js'

export type YahooMergeAuditItem = {
  assetSymbol: string
  category: string
  yahooSymbol: string
  status: 'updated' | 'missing'
  reason?: 'not_returned' | 'no_price' | 'price_mismatch'
  price?: number
  nonTickerFixable?: boolean
  dataInterval?: '5m' | '1d'
  resolvedBy?: 'symbol' | 'name' | 'tradingview'
  tradingViewSymbol?: string
  tradingViewUsedColumn?: string
  tradingViewUpdateMode?: string | null
  changePctSource?: 'field' | 'derived' | 'missing'
  changePctDerivedFrom?: 'prev_price'
  changePctSuppressed?: boolean
  changePctSuppressedKind?: 'field' | 'derived'
  changePctSuppressedValue?: number
  changePctSuppressedThreshold?: number
}

export type YahooMergeByCategoryCounters = { assets: number; attempted: number; updated: number; missing: number }

export type YahooNameFallback = {
  resolve(
    asset: Asset | undefined | null,
    category: string,
    attemptedYahooSymbol: string,
  ): Promise<null | { yahooSymbol: string; chart: YahooSparkChartLike; dataInterval: '5m' | '1d' }>
}

export type YahooTradingViewFallback = {
  resolve(
    asset: Asset | undefined | null,
    category: string,
  ): Promise<
    | null
    | {
        tradingViewSymbol: string
        price: number
        usedColumn: string
        updateMode: string | null
      }
  >
}

export type YahooMergeApplyResult = {
  updated: number
  covered: number
  dailyFallbackUsed: number
  quoteFallbackUsed: number
  updatedSymbols: string[]
  missingSymbols: string[]
  auditItems: YahooMergeAuditItem[]
}
