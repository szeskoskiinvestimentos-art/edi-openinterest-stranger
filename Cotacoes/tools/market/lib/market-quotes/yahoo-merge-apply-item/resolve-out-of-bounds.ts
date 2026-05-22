import type { Asset, MarketPoint } from '../../../types.js'
import type { YahooMergeAuditItem, YahooTradingViewFallback } from '../yahoo-merge-apply-types.js'
import {
  synthPointFromChangePct,
  tryUpdateFromTradingViewFallback,
} from '../yahoo-merge-apply-item-helpers.js'

export async function resolveWhenOutOfBounds(params: {
  asset: Asset | undefined
  assetSymbol: string
  category: string
  yahooSymbol: string
  usedInterval: '5m' | '1d'
  nowIso: string
  prevPrice: number
  extracted: { changePct: number | null; asOf: string | null }
  tradingViewFallback: YahooTradingViewFallback
  recordUpdated: (audit: YahooMergeAuditItem, point: MarketPoint, dayFallbackUsed: boolean, quoteFallbackUsed: boolean) => void
  recordMissing: (audit: YahooMergeAuditItem) => void
}) {
  if (typeof params.extracted.changePct === 'number' && Number.isFinite(params.extracted.changePct)) {
    const point = synthPointFromChangePct({
      nowIso: params.nowIso,
      prevPrice: params.prevPrice,
      changePct: params.extracted.changePct,
      asOf: params.extracted.asOf,
    })
    if (point) {
      params.recordUpdated(
        {
          assetSymbol: params.assetSymbol,
          category: params.category,
          yahooSymbol: params.yahooSymbol,
          status: 'updated',
          price: point.price,
          dataInterval: params.usedInterval,
          resolvedBy: 'symbol',
        },
        point,
        params.usedInterval === '1d',
        false,
      )
      return true
    }
  }

  if (
    await tryUpdateFromTradingViewFallback({
      asset: params.asset,
      assetSymbol: params.assetSymbol,
      category: params.category,
      attemptedYahooSymbol: params.yahooSymbol,
      usedInterval: params.usedInterval,
      nowIso: params.nowIso,
      dayFallbackUsed: params.usedInterval === '1d',
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
    reason: 'price_mismatch',
    nonTickerFixable: false,
    dataInterval: params.usedInterval,
  })
  return true
}

