import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { parseCsv } from './lib/csv.js'
import { pruneOldPoints, readExisting } from './lib/history.js'
import { computeFlowSentinel } from './lib/flow-sentinel.js'
import { toISO } from './lib/parse.js'
import type { Asset, MarketPoint, MarketQuotes } from './types.js'
import { validateCoverageOrThrow } from './market-history/coverage.js'
import { applyPortfolioParseStats, createPortfolioStats, parsePortfolioRow } from './market-history/portfolio.js'

type BuildMarketHistoryInput = {
  csvPath: string
  outDir: string
  intervalMinutes?: number
  retentionDays?: number
  timestamp?: string
}

export async function buildMarketHistory(input: BuildMarketHistoryInput) {
  const csvPath = input.csvPath
  const outDir = input.outDir
  const intervalMinutes = Number(input.intervalMinutes ?? 30)
  const retentionDays = Number(input.retentionDays ?? 5)
  const generatedAt = toISO(input.timestamp, new Date())

  const retentionMs = retentionDays * 24 * 60 * 60 * 1000
  const cutoffMs = new Date(generatedAt).getTime() - retentionMs

  const csvText = await readFile(csvPath, 'utf-8')
  const parsedRows = parseCsv(csvText)

  const existing = await readExisting(outDir)
  const series: Record<string, MarketPoint[]> = existing?.series || {}
  const prevDiUpdatedAt =
    existing && existing.meta && typeof existing.meta.diUpdatedAt === 'string'
      ? existing.meta.diUpdatedAt
      : undefined

  const assetsBySymbol = new Map<string, Asset>()
  const usdxBestPriority = { value: -1 }
  const portfolioStats = createPortfolioStats(parsedRows.length)

  for (const row of parsedRows) {
    const parsed = parsePortfolioRow({ row: row as Record<string, string>, generatedAt, usdxBestPriority })
    applyPortfolioParseStats(portfolioStats, parsed)
    if (!('symbol' in parsed) || !('asset' in parsed)) continue

    if (assetsBySymbol.has(parsed.symbol)) portfolioStats.duplicateSymbols += 1
    assetsBySymbol.set(parsed.symbol, parsed.asset)
    if (!parsed.ok) continue

    const point: MarketPoint = parsed.point
    const existingPoints = series[parsed.symbol] || []
    const last = existingPoints.length ? existingPoints[existingPoints.length - 1] : null
    const nextPoints =
      last && last.t === point.t
        ? existingPoints.slice(0, -1).concat([point])
        : existingPoints.concat([point])

    series[parsed.symbol] = pruneOldPoints(nextPoints, cutoffMs)
  }

  portfolioStats.uniqueSymbols = assetsBySymbol.size

  for (const sym of Object.keys(series)) {
    series[sym] = pruneOldPoints(series[sym], cutoffMs)
    if (!series[sym].length) delete series[sym]
  }

  const assets = Array.from(assetsBySymbol.values()).sort((a, b) =>
    a.symbol.localeCompare(b.symbol),
  )

  const coverage = validateCoverageOrThrow(assets)
  const flowSentinel = computeFlowSentinel({ assets, series, generatedAt })

  const payload: MarketQuotes = {
    meta: {
      generatedAt,
      intervalMinutes: Number.isFinite(intervalMinutes) ? intervalMinutes : 30,
      retentionDays: Number.isFinite(retentionDays) ? retentionDays : 10,
      warnings: [],
      source: path.basename(csvPath),
      portfolioUpdatedAt: generatedAt,
      portfolioStats,
      ...(prevDiUpdatedAt ? { diUpdatedAt: prevDiUpdatedAt } : {}),
      coverage: {
        ...coverage,
        ok: true,
      },
      flowSentinel,
    },
    assets,
    series,
  }

  await mkdir(outDir, { recursive: true })
  await writeFile(path.join(outDir, 'market_quotes.json'), JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(payload)};`, 'utf-8')

  return payload
}
