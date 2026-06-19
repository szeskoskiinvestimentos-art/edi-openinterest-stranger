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
  const outliers: { symbol: string; kind: 'changePct' | 'extendedChangePct' | 'price' | 'priceJump'; value: number; at: string }[] = []
  const runBestPointBySymbol = new Map<string, MarketPoint>()

  const isYieldLikeSymbol = (symbol: string) => {
    const s = String(symbol || '')
    return /(=RR|=R)\b/i.test(s)
  }

  const isPlausiblePrice = (symbol: string, price: unknown) => {
    const p = typeof price === 'number' ? price : Number(price)
    if (!Number.isFinite(p)) return false
    const s = String(symbol || '')
    if (isYieldLikeSymbol(s)) return p > -100 && p < 100
    if (s.includes('/')) return p > 0
    return p > 0
  }

  const stripImplausiblePct = (point: MarketPoint, symbol: string) => {
    const p = point
    if (typeof p.changePct === 'number' && Number.isFinite(p.changePct) && Math.abs(p.changePct) > 50) {
      outliers.push({ symbol, kind: 'changePct', value: p.changePct, at: p.t })
      delete p.changePct
      delete p.change
    }
    if (typeof p.extendedChangePct === 'number' && Number.isFinite(p.extendedChangePct) && Math.abs(p.extendedChangePct) > 50) {
      outliers.push({ symbol, kind: 'extendedChangePct', value: p.extendedChangePct, at: p.t })
      delete p.extendedChangePct
    }
  }

  const msOf = (iso?: string) => {
    const t = iso ? new Date(iso).getTime() : NaN
    return Number.isFinite(t) ? t : null
  }

  const hasAnyPct = (p: MarketPoint) =>
    (typeof p.changePct === 'number' && Number.isFinite(p.changePct)) ||
    (typeof p.extendedChangePct === 'number' && Number.isFinite(p.extendedChangePct))

  const pctOf = (p: MarketPoint) => {
    if (typeof p.changePct === 'number' && Number.isFinite(p.changePct)) return p.changePct
    if (typeof p.extendedChangePct === 'number' && Number.isFinite(p.extendedChangePct)) return p.extendedChangePct
    return null
  }

  const pricesClose = (a: number, b: number) => {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false
    const abs = Math.abs(a)
    const tol = Math.max(1e-9, abs * 1e-6)
    return Math.abs(a - b) <= tol
  }

  const isPctConflict = (a: MarketPoint, b: MarketPoint) => {
    const pa = pctOf(a)
    const pb = pctOf(b)
    if (pa === null || pb === null) return false
    const diff = Math.abs(pa - pb)
    return Number.isFinite(diff) && diff >= 12
  }

  const betterPoint = (a: MarketPoint, b: MarketPoint) => {
    const aAsOf = msOf(a.asOf)
    const bAsOf = msOf(b.asOf)
    const aT = msOf(a.t)
    const bT = msOf(b.t)
    const aRef = aAsOf ?? aT ?? -Infinity
    const bRef = bAsOf ?? bT ?? -Infinity
    if (aRef !== bRef) return aRef > bRef ? a : b
    const aHas = hasAnyPct(a) ? 1 : 0
    const bHas = hasAnyPct(b) ? 1 : 0
    if (aHas !== bHas) return aHas > bHas ? a : b
    return b
  }

  const compactInternalConflicts = (sym: string, points: MarketPoint[]) => {
    if (isYieldLikeSymbol(sym)) return points
    const xs = Array.isArray(points) ? points : []
    if (xs.length < 2) return xs
    const out: MarketPoint[] = []
    for (const p of xs) {
      if (!p) continue
      const last = out.length ? out[out.length - 1] : null
      if (!last) {
        out.push(p)
        continue
      }
      if (last.t === p.t) {
        out[out.length - 1] = betterPoint(last, p)
        continue
      }
      if (
        isPlausiblePrice(sym, last.price) &&
        isPlausiblePrice(sym, p.price) &&
        pricesClose(last.price, p.price) &&
        isPctConflict(last, p)
      ) {
        const keep = betterPoint(last, p)
        if (keep !== last) out[out.length - 1] = p
        continue
      }
      out.push(p)
    }
    return out
  }

  for (let rowIndex = 0; rowIndex < parsedRows.length; rowIndex += 1) {
    const row = parsedRows[rowIndex]
    const parsed = parsePortfolioRow({ row: row as Record<string, string>, rowIndex, generatedAt, usdxBestPriority })
    applyPortfolioParseStats(portfolioStats, parsed)
    if (!('symbol' in parsed) || !('asset' in parsed)) continue

    const sym = parsed.symbol
    if (assetsBySymbol.has(sym)) {
      portfolioStats.duplicateSymbols += 1
      if (portfolioStats.sampleDuplicateSymbols.length < 20) {
        portfolioStats.sampleDuplicateSymbols.push({
          symbol: sym,
          rawSymbol: 'rawSymbol' in parsed ? (parsed.rawSymbol as string | undefined) : undefined,
          rawName: 'rawName' in parsed ? (parsed.rawName as string | undefined) : parsed.asset.name,
          exchange: 'exchange' in parsed ? (parsed.exchange as string | undefined) : parsed.asset.exchange,
          csvRowIndex: 'csvRowIndex' in parsed ? (parsed.csvRowIndex as number | undefined) : undefined,
          csvLine: 'csvLine' in parsed ? (parsed.csvLine as number | undefined) : undefined,
        })
      }
    }
    assetsBySymbol.set(sym, parsed.asset)
    if (!parsed.ok) continue

    const point: MarketPoint = { ...parsed.point }
    if (!isPlausiblePrice(sym, point.price)) {
      outliers.push({ symbol: sym, kind: 'price', value: typeof point.price === 'number' && Number.isFinite(point.price) ? point.price : 0, at: point.t })
      continue
    }
    stripImplausiblePct(point, sym)

    const cur = runBestPointBySymbol.get(sym)
    if (!cur) runBestPointBySymbol.set(sym, point)
    else runBestPointBySymbol.set(sym, betterPoint(cur, point))
  }

  portfolioStats.uniqueSymbols = assetsBySymbol.size

  for (const [sym, point] of runBestPointBySymbol.entries()) {
    const existingPoints = series[sym] || []
    const last = existingPoints.length ? existingPoints[existingPoints.length - 1] : null
    if (last && isPlausiblePrice(sym, last.price) && isPlausiblePrice(sym, point.price) && !isYieldLikeSymbol(sym)) {
      const base = Math.abs(last.price) || 0
      if (base > 0) {
        const jumpPct = ((point.price - last.price) / base) * 100
        if (Number.isFinite(jumpPct) && Math.abs(jumpPct) > 50) {
          outliers.push({ symbol: sym, kind: 'priceJump', value: jumpPct, at: point.t })
          continue
        }
      }
    }
    const nextPoints =
      last && last.t === point.t
        ? existingPoints.slice(0, -1).concat([point])
        : existingPoints.concat([point])
    series[sym] = compactInternalConflicts(sym, pruneOldPoints(nextPoints, cutoffMs))
  }

  for (const sym of Object.keys(series)) {
    series[sym] = compactInternalConflicts(sym, pruneOldPoints(series[sym], cutoffMs))
    if (!series[sym].length) delete series[sym]
  }

  const inferCategoryForSeriesOnlyAsset = (symbol: string) => {
    const s = String(symbol || '')
    if (isYieldLikeSymbol(s) || /^DI1[FGHJKMNQUVXZ]\d{2}$/i.test(s) || /^DDIC\d+$/i.test(s) || /^DAPC\d+$/i.test(s)) return 'rates'
    if (s.includes('/')) return 'fx_g10'
    return 'unknown'
  }

  for (const sym of Object.keys(series)) {
    if (assetsBySymbol.has(sym)) continue
    assetsBySymbol.set(sym, { symbol: sym, name: sym, category: inferCategoryForSeriesOnlyAsset(sym) })
  }

  portfolioStats.uniqueSymbols = assetsBySymbol.size

  const assets = Array.from(assetsBySymbol.values()).sort((a, b) =>
    a.symbol.localeCompare(b.symbol),
  )

  const coverage = validateCoverageOrThrow(assets)
  const flowSentinel = computeFlowSentinel({ assets, series, generatedAt })

  const duplicateSymbols = (portfolioStats.sampleDuplicateSymbols || [])
    .map((x) => ({
      symbol: x.symbol,
      rawSymbol: x.rawSymbol,
      rawName: x.rawName,
      exchange: x.exchange,
      csvRowIndex: x.csvRowIndex,
      csvLine: x.csvLine,
    }))
    .slice(0, 20)

  const missingPriceRows = (portfolioStats.sampleMissingPriceRows || [])
    .map((x) => ({
      symbol: x.symbol,
      rawSymbol: x.rawSymbol,
      rawName: x.rawName,
      exchange: x.exchange,
      csvRowIndex: x.csvRowIndex,
      csvLine: x.csvLine,
    }))
    .slice(0, 20)

  const audit = {
    missingPriceSymbols: portfolioStats.sampleMissingPriceSymbols.slice(0, 20),
    missingPriceRows,
    duplicateSymbols,
    outliers: outliers.slice(0, 40),
  }

  const payload: MarketQuotes = {
    meta: {
      generatedAt,
      intervalMinutes: Number.isFinite(intervalMinutes) ? intervalMinutes : 30,
      retentionDays: Number.isFinite(retentionDays) ? retentionDays : 10,
      warnings: [],
      source: path.basename(csvPath),
      portfolioUpdatedAt: generatedAt,
      portfolioStats,
      audit,
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
