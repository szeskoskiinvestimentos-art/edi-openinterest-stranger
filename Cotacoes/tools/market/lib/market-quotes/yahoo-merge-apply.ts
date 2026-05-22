import type { Asset, MarketPoint } from '../../types.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import type { YahooSparkChartLike } from './yahoo-merge-yahoo.js'
import { applyYahooMergeItem } from './yahoo-merge-apply-item.js'
export type {
  YahooMergeApplyResult,
  YahooMergeAuditItem,
  YahooMergeByCategoryCounters,
  YahooNameFallback,
  YahooTradingViewFallback,
} from './yahoo-merge-apply-types.js'
import type {
  YahooMergeApplyResult,
  YahooMergeByCategoryCounters,
  YahooNameFallback,
  YahooTradingViewFallback,
} from './yahoo-merge-apply-types.js'

export async function applyYahooMergePlan(params: {
  deps: YahooMergeDeps
  selectedPlan: Array<{ assetSymbol: string; yahooSymbol: string }>
  assetBySymbol: Map<string, Asset>
  byCategory: Map<string, YahooMergeByCategoryCounters>
  series: Record<string, MarketPoint[]>
  nowIso: string
  cutoffMs: number
  byYahoo: Map<string, YahooSparkChartLike>
  byYahooDaily: Map<string, YahooSparkChartLike>
  byYahooQuote: Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>
  nameFallback: YahooNameFallback
  tradingViewFallback: YahooTradingViewFallback
}): Promise<YahooMergeApplyResult> {
  let updated = 0
  let covered = 0
  let dailyFallbackUsed = 0
  let quoteFallbackUsed = 0
  const updatedSymbols: string[] = []
  const missingSymbols: string[] = []
  const auditItems: Array<import('./yahoo-merge-apply-types.js').YahooMergeAuditItem> = []

  for (const p of params.selectedPlan) {
    const item = await applyYahooMergeItem({
      deps: params.deps,
      planItem: p,
      assetBySymbol: params.assetBySymbol,
      series: params.series,
      nowIso: params.nowIso,
      cutoffMs: params.cutoffMs,
      byYahoo: params.byYahoo,
      byYahooDaily: params.byYahooDaily,
      byYahooQuote: params.byYahooQuote,
      nameFallback: params.nameFallback,
      tradingViewFallback: params.tradingViewFallback,
    })
    const cat = item.category
    const catRow = params.byCategory.get(cat) || { assets: 0, attempted: 0, updated: 0, missing: 0 }
    catRow.attempted += item.attempted
    catRow.updated += item.updated
    catRow.missing += item.missing
    params.byCategory.set(cat, catRow)
    updated += item.updated
    covered += item.covered
    dailyFallbackUsed += item.dailyFallbackUsed
    quoteFallbackUsed += item.quoteFallbackUsed
    updatedSymbols.push(...item.updatedSymbols)
    missingSymbols.push(...item.missingSymbols)
    auditItems.push(...item.auditItems)
  }

  return { updated, covered, dailyFallbackUsed, quoteFallbackUsed, updatedSymbols, missingSymbols, auditItems }
}
