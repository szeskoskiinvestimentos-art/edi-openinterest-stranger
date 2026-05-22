import type { Asset } from '../../../types.js'
import type { YahooMergeDeps } from '../yahoo-merge-deps.js'
import type { YahooMergeAuditItem, YahooNameFallback, YahooTradingViewFallback } from '../yahoo-merge-apply-types.js'
import { isNonTickerFixableMissing } from '../yahoo-merge-symbols.js'
import {
  tryUpdateFromNameFallback,
  tryUpdateFromTradingViewFallback,
  tryUpdateFromYahooQuote,
} from '../yahoo-merge-apply-item-helpers.js'

export async function resolveWhenNoPrice(params: {
  deps: YahooMergeDeps
  asset: Asset | undefined
  assetSymbol: string
  category: string
  yahooSymbol: string
  usedInterval: '5m' | '1d'
  nowIso: string
  byYahooQuote: Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>
  nameFallback: YahooNameFallback
  tradingViewFallback: YahooTradingViewFallback
  recordUpdated: (audit: YahooMergeAuditItem, point: import('../../../types.js').MarketPoint, dayFallbackUsed: boolean, quoteFallbackUsed: boolean) => void
  recordMissing: (audit: YahooMergeAuditItem) => void
}) {
  if (
    tryUpdateFromYahooQuote({
      assetSymbol: params.assetSymbol,
      category: params.category,
      yahooSymbol: params.yahooSymbol,
      dataInterval: params.usedInterval,
      nowIso: params.nowIso,
      byYahooQuote: params.byYahooQuote,
      recordUpdated: params.recordUpdated,
    })
  )
    return true

  if (
    await tryUpdateFromNameFallback({
      asset: params.asset,
      assetSymbol: params.assetSymbol,
      category: params.category,
      attemptedYahooSymbol: params.yahooSymbol,
      nowIso: params.nowIso,
      nameFallback: params.nameFallback,
      recordUpdated: params.recordUpdated,
    })
  )
    return true

  if (
    await tryUpdateFromTradingViewFallback({
      asset: params.asset,
      assetSymbol: params.assetSymbol,
      category: params.category,
      attemptedYahooSymbol: params.yahooSymbol,
      usedInterval: params.usedInterval,
      nowIso: params.nowIso,
      dayFallbackUsed: false,
      tradingViewFallback: params.tradingViewFallback,
      recordUpdated: params.recordUpdated,
    })
  )
    return true

  params.recordMissing({
    assetSymbol: params.assetSymbol,
    category: params.category,
    yahooSymbol: params.yahooSymbol,
    status: 'missing',
    reason: 'no_price',
    nonTickerFixable: isNonTickerFixableMissing(params.deps, params.category, params.yahooSymbol, 'no_price'),
    dataInterval: params.usedInterval,
    resolvedBy: 'symbol',
  })
  return true
}

