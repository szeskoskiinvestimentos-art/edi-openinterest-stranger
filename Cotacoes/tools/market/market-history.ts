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

    if (symbol === 'USDX') {
      const up = String(rawSymbol || '').trim().toUpperCase()
      const pr = up === 'DX' ? 3 : up === '.DXY' ? 2 : up === 'USDIDX' ? 1 : 0
      if (pr < usdxBestPriority) {
        portfolioStats.rowsSkippedByPriority += 1
        continue
      }
      usdxBestPriority = pr
    }

    let cleanedName = cleanDisplayName(symbol, name)
    if (symbol === 'USDX') cleanedName = 'Índice Dólar (DXY)'
    const { category, tags } = classifyAsset({ Name: cleanedName, Symbol: symbol, Exchange: exchange })
    if (assetsBySymbol.has(symbol)) portfolioStats.duplicateSymbols += 1
    assetsBySymbol.set(symbol, { symbol, name: cleanedName, exchange, category, tags })

    const priceRaw = getFirst(row, [
      'Last',
      'Último',
      'Ultimo',
      'Últ. Preço',
      'Ult. Preço',
      'Preço',
      'Preco',
    ])
    const price = parseNumber(priceRaw)
    if (price === null) {
      portfolioStats.rowsMissingPrice += 1
      if (portfolioStats.sampleMissingPriceSymbols.length < 20) {
        portfolioStats.sampleMissingPriceSymbols.push(symbol)
      }
      continue
    }
    portfolioStats.rowsWithPrice += 1

    const preMarketPriceRaw = getFirst(row, [
      'Pré-mercado',
      'Pre-market',
      'Pre Market',
      'Premarket',
      'Pré Mercado',
      'PreMarket',
    ])
    const afterHoursPriceRaw = getFirst(row, [
      'Negociação Estendida',
      'Negociacao Estendida',
      'Extended Hours',
      'Extended',
      'After Hours',
      'After-Hours',
      'After hours',
      'Pós-mercado',
      'Pos-mercado',
      'Pós Mercado',
      'Pos Mercado',
    ])
    const preMarketPrice = parseNumber(preMarketPriceRaw)
    const afterHoursPrice = parseNumber(afterHoursPriceRaw)
    const extendedPrice = preMarketPrice !== null ? preMarketPrice : afterHoursPrice

    const changeRaw = getFirst(row, ['Chg.', 'Var.', 'Variação', 'Variacao', 'Var'])
    const changePctRaw = getFirst(row, [
      'Chg. %',
      'Chg%',
      'Chg %',
      'Change %',
      'Change%',
      'Var. %',
      'Var.%',
      'Var%',
      'Var %',
      'Variação%',
      'Variação %',
      'Variacao%',
      'Variacao %',
    ])
    const change = parseNumber(changeRaw)
    const changePct = parsePercent(changePctRaw)

    const preMarketChangePctRaw = getFirst(row, [
      'Pré-mercado (%)',
      'Pre-market (%)',
      'Pre Market (%)',
      'Premarket (%)',
      'Pré Mercado (%)',
      'PreMarket (%)',
      'Pré-mercado %',
      'Pre-market %',
      'Pre Market %',
      'Premarket %',
      'Pré Mercado %',
      'PreMarket %',
    ])
    const afterHoursChangePctRaw = getFirst(row, [
      'Negociação Estendida (%)',
      'Negociacao Estendida (%)',
      'Extended Hours (%)',
      'Extended (%)',
      'After Hours (%)',
      'After-Hours (%)',
      'Pós-mercado (%)',
      'Pos-mercado (%)',
      'Pós Mercado (%)',
      'Pos Mercado (%)',
      'After Hours %',
      'After-Hours %',
      'Pós-mercado %',
      'Pos-mercado %',
      'Pós Mercado %',
      'Pos Mercado %',
    ])
    const preMarketChangePct = parsePercent(preMarketChangePctRaw)
    const afterHoursChangePct = parsePercent(afterHoursChangePctRaw)
    let extendedChangePct = preMarketChangePct !== null ? preMarketChangePct : afterHoursChangePct
    if (extendedChangePct === null && typeof extendedPrice === 'number' && Number.isFinite(extendedPrice)) {
      const prevRaw = getFirst(row, ['Prévio', 'Prev', 'Previous', 'Previous Close', 'Prev Close'])
      const prev = parseNumber(prevRaw)
      if (typeof prev === 'number' && Number.isFinite(prev) && prev !== 0) {
        extendedChangePct = ((extendedPrice - prev) / prev) * 100
      }
    }

    const asOfRaw = getFirst(row, ['Hora', 'Time', 'Horário', 'Horario'])
    const asOfIso = parseAsOfIso(asOfRaw, generatedAt)

    const point: MarketPoint = { t: generatedAt, price }
    if (asOfIso) point.asOf = asOfIso
    if (change !== null) point.change = change
    if (changePct !== null) point.changePct = changePct
    if (extendedPrice !== null) point.extendedPrice = extendedPrice
    if (extendedChangePct !== null) point.extendedChangePct = extendedChangePct

    const existingPoints = series[symbol] || []
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
