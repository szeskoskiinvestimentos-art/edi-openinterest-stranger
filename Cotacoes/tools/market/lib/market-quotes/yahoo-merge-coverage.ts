import type { YahooMergeByCategoryCounters } from './yahoo-merge-apply.js'

export function buildYahooCoverageMeta(params: {
  nowIso: string
  enabled: boolean
  attemptedAssets: number
  uniqueYahooSymbols: number
  returnedYahooSymbols: number
  updatedAssets: number
  missingAssets: number
  byCategory: Map<string, YahooMergeByCategoryCounters>
  updatedSymbols: string[]
  missingSymbols: string[]
  overrides: Map<string, string>
  dailyFallbackUsed: number
  quoteFallbackUsed: number
  skippedAssets: number
  nameResolvedUsed: number
  tradingViewUsed: number
}) {
  return {
    enabled: params.enabled,
    lastRunAt: params.nowIso,
    attemptedAssets: params.attemptedAssets,
    uniqueYahooSymbols: params.uniqueYahooSymbols,
    returnedYahooSymbols: params.returnedYahooSymbols,
    updatedAssets: params.updatedAssets,
    missingAssets: params.missingAssets,
    byCategory: Object.fromEntries(Array.from(params.byCategory.entries())),
    updatedSymbols: params.updatedSymbols.slice(0, 140),
    missingSymbols: params.missingSymbols.slice(0, 140),
    symbolOverrides: {
      count: params.overrides.size,
      items: Array.from(params.overrides.entries())
        .map(([k, v]) => `${k}=${v}`)
        .slice(0, 60),
    },
    dailyFallbackUsed: params.dailyFallbackUsed,
    quoteFallbackUsed: params.quoteFallbackUsed,
    skippedAssets: params.skippedAssets,
    nameResolvedUsed: params.nameResolvedUsed,
    tradingViewUsed: params.tradingViewUsed,
  }
}

