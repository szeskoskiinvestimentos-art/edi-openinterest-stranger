import path from 'node:path'

import type { Asset, MarketPoint, MarketQuotes } from '../../types.js'
import { atomicWriteText } from '../io.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import type { YahooMergeAuditItem } from './yahoo-merge-apply.js'
import { buildYahooCoverageMeta } from './yahoo-merge-coverage.js'
import { emitYahooMergeSuggestions } from './yahoo-merge-suggest.js'

export async function writeYahooMergeOutputs(params: {
  outDir: string
  parsed: MarketQuotes
  series: Record<string, MarketPoint[]>
  nowIso: string
  deps: YahooMergeDeps
  timeoutMs: number
  plan: {
    selectedPlanLength: number
    uniqueYahooLength: number
    returnedYahooSize: number
    skippedAssets: number
    byCategory: Map<string, { assets: number; attempted: number; updated: number; missing: number }>
    overrides: Map<string, string>
    assetBySymbol: Map<string, Asset>
  }
  applied: {
    updated: number
    covered: number
    dailyFallbackUsed: number
    quoteFallbackUsed: number
    updatedSymbols: string[]
    missingSymbols: string[]
    auditItems: YahooMergeAuditItem[]
  }
  nameFallback: { getUsed: () => number }
  tradingViewFallback: { getUsed: () => number }
  nameOverrideSuggested: Set<string>
  tradingViewOverrideSuggested: Set<string>
}) {
  const jsonPath = path.join(params.outDir, 'market_quotes.json')

  params.parsed.series = params.series
  params.parsed.meta.generatedAt = params.nowIso
  if (!Array.isArray((params.parsed.meta as unknown as { warnings?: unknown }).warnings)) {
    ;(params.parsed.meta as unknown as { warnings: string[] }).warnings = []
  }
  params.parsed.meta.yahooUpdatedAt = params.nowIso

  const nameResolvedUsed = params.nameFallback.getUsed()
  const tradingViewUsed = params.tradingViewFallback.getUsed()

  params.parsed.meta.yahooCoverage = buildYahooCoverageMeta({
    nowIso: params.nowIso,
    enabled: true,
    attemptedAssets: params.plan.selectedPlanLength,
    uniqueYahooSymbols: params.plan.uniqueYahooLength,
    returnedYahooSymbols: params.plan.returnedYahooSize,
    updatedAssets: params.applied.updatedSymbols.length,
    missingAssets: params.applied.missingSymbols.length,
    byCategory: params.plan.byCategory,
    updatedSymbols: params.applied.updatedSymbols,
    missingSymbols: params.applied.missingSymbols,
    overrides: params.plan.overrides,
    dailyFallbackUsed: params.applied.dailyFallbackUsed,
    quoteFallbackUsed: params.applied.quoteFallbackUsed,
    skippedAssets: params.plan.skippedAssets,
    nameResolvedUsed,
    tradingViewUsed,
  })

  const jsonText = JSON.stringify(params.parsed, null, 2)
  JSON.parse(jsonText)
  await atomicWriteText(jsonPath, jsonText)
  await atomicWriteText(path.join(params.outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(params.parsed)};`)

  const audit = {
    generatedAt: params.nowIso,
    source: 'yahoo_quotes_audit',
    warnings: [] as string[],
    attemptedAssets: params.plan.selectedPlanLength,
    uniqueYahooSymbols: params.plan.uniqueYahooLength,
    returnedYahooSymbols: params.plan.returnedYahooSize,
    updatedAssets: params.applied.updatedSymbols.length,
    missingAssets: params.applied.missingSymbols.length,
    items: params.applied.auditItems,
    nonTickerFixableMissing: params.applied.auditItems.filter(
      x =>
        (x as unknown as { status?: string; nonTickerFixable?: boolean }).status === 'missing' &&
        (x as unknown as { nonTickerFixable?: boolean }).nonTickerFixable === true,
    ).length,
    operationalMissing: params.applied.auditItems.filter(
      x =>
        (x as unknown as { status?: string; nonTickerFixable?: boolean }).status === 'missing' &&
        !(x as unknown as { nonTickerFixable?: boolean }).nonTickerFixable,
    ).length,
    dailyFallbackUsed: params.applied.dailyFallbackUsed,
    quoteFallbackUsed: params.applied.quoteFallbackUsed,
    skippedAssets: params.plan.skippedAssets,
    nameResolvedUsed,
    tradingViewUsed,
  }
  const auditText = JSON.stringify(audit, null, 2)
  JSON.parse(auditText)
  await atomicWriteText(path.join(params.outDir, 'market_yahoo_audit.json'), auditText)
  await atomicWriteText(
    path.join(params.outDir, 'market_yahoo_audit.js'),
    `window.MARKET_YAHOO_AUDIT_DATA=${JSON.stringify(audit)};`,
  )

  process.stdout.write(
    `OK • Yahoo quotes: updated=${params.applied.updated} covered=${params.applied.covered}/${params.plan.selectedPlanLength} uniqueYahoo=${params.plan.uniqueYahooLength} dailyFallback=${params.applied.dailyFallbackUsed} quoteFallback=${params.applied.quoteFallbackUsed} skipped=${params.plan.skippedAssets}\n`,
  )

  if (params.nameOverrideSuggested.size) {
    const items = Array.from(params.nameOverrideSuggested).slice(0, 30)
    process.stdout.write(`SUGGEST • MARKET_YAHOO_SYMBOL_OVERRIDES (name_verified) ${items.length}:\n`)
    process.stdout.write(`${items.join(' ; ')}\n`)
  }

  if (params.tradingViewOverrideSuggested.size) {
    const items = Array.from(params.tradingViewOverrideSuggested).slice(0, 30)
    process.stdout.write(`SUGGEST • MARKET_TRADINGVIEW_SYMBOL_OVERRIDES (auto_resolved) ${items.length}:\n`)
    process.stdout.write(`${items.join(' ; ')}\n`)
  }

  const requiredCritical =
    params.parsed.meta &&
    params.parsed.meta.coverage &&
    Array.isArray((params.parsed.meta.coverage as unknown as { requiredCritical?: unknown }).requiredCritical)
      ? ((params.parsed.meta.coverage as unknown as { requiredCritical: unknown[] }).requiredCritical
          .map(x => String(x || '').trim())
          .filter(Boolean) as string[])
      : []

  await emitYahooMergeSuggestions({
    deps: params.deps,
    auditItems: params.applied.auditItems as YahooMergeAuditItem[],
    overrides: params.plan.overrides,
    assetBySymbol: params.plan.assetBySymbol,
    requiredCritical,
    timeoutMs: params.timeoutMs,
  })
}
