import { classifyAsset } from '../lib/classify.js'
import { parseNumber, parsePercent } from '../lib/parse.js'
import type { Asset, MarketPoint } from '../types.js'

import { parseAsOfIso } from './asof.js'
import { cleanDisplayName, normalizeSymbol } from './normalize.js'
import { getFirst } from './rows.js'

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

export type PortfolioRowParseOk = { ok: true; symbol: string; asset: Asset; point: MarketPoint }
export type PortfolioRowParseNoPoint = { ok: false; symbol: string; asset: Asset; reason: 'missing_price' }
export type PortfolioRowParseSkip =
  | { ok: false; reason: 'missing_symbol_or_name' }
  | { ok: false; reason: 'invalid_symbol' }
  | { ok: false; reason: 'skipped_by_priority' }

export type PortfolioRowParseResult = PortfolioRowParseOk | PortfolioRowParseNoPoint | PortfolioRowParseSkip

export function createPortfolioStats(rowsTotal: number): PortfolioStats {
  return {
    rowsTotal,
    rowsMissingSymbolOrName: 0,
    rowsInvalidSymbol: 0,
    rowsSkippedByPriority: 0,
    rowsMissingPrice: 0,
    rowsWithPrice: 0,
    uniqueSymbols: 0,
    duplicateSymbols: 0,
    sampleMissingPriceSymbols: [],
  }
}

export function applyPortfolioParseStats(stats: PortfolioStats, res: PortfolioRowParseResult) {
  if (res.ok) {
    stats.rowsWithPrice += 1
    return
  }
  if (!('reason' in res)) return
  const reason = res.reason
  if (reason === 'missing_symbol_or_name') stats.rowsMissingSymbolOrName += 1
  if (reason === 'invalid_symbol') stats.rowsInvalidSymbol += 1
  if (reason === 'skipped_by_priority') stats.rowsSkippedByPriority += 1
  if (reason === 'missing_price') {
    stats.rowsMissingPrice += 1
    if (stats.sampleMissingPriceSymbols.length < 20 && 'symbol' in res) stats.sampleMissingPriceSymbols.push(res.symbol)
  }
}

function resolveUsdxPriority(rawSymbol: string) {
  const up = String(rawSymbol || '').trim().toUpperCase()
  return up === 'DX' ? 3 : up === '.DXY' ? 2 : up === 'USDIDX' ? 1 : 0
}

export function parsePortfolioRow(params: {
  row: Record<string, string>
  generatedAt: string
  usdxBestPriority: { value: number }
}): PortfolioRowParseResult {
  const row = params.row

  const rawSymbol = getFirst(row, [
    'Symbol',
    'Símbolo',
    'Simbolo',
    'Ticker',
    'Ativo',
    'Código',
    'Codigo',
    'Códigos',
    'Codigos',
  ])
  const name = getFirst(row, ['Name', 'Nome', 'Ativo (Nome)', 'Instrumento'])
  const exchange = getFirst(row, ['Exchange', 'Bolsa', 'Mercado'])
  if (!rawSymbol || !name) return { ok: false, reason: 'missing_symbol_or_name' }

  const symbol = normalizeSymbol(rawSymbol, name)
  if (!symbol) return { ok: false, reason: 'invalid_symbol' }

  if (symbol === 'USDX') {
    const pr = resolveUsdxPriority(rawSymbol)
    if (pr < params.usdxBestPriority.value) return { ok: false, reason: 'skipped_by_priority' }
    params.usdxBestPriority.value = pr
  }

  let cleanedName = cleanDisplayName(symbol, name)
  if (symbol === 'USDX') cleanedName = 'Índice Dólar (DXY)'
  const { category, tags } = classifyAsset({ Name: cleanedName, Symbol: symbol, Exchange: exchange })
  const asset: Asset = { symbol, name: cleanedName, exchange, category, tags }

  const priceRaw = getFirst(row, ['Last', 'Último', 'Ultimo', 'Últ. Preço', 'Ult. Preço', 'Preço', 'Preco'])
  const price = parseNumber(priceRaw)
  if (price === null) return { ok: false, reason: 'missing_price', symbol, asset }

  const preMarketPriceRaw = getFirst(row, ['Pré-mercado', 'Pre-market', 'Pre Market', 'Premarket', 'Pré Mercado', 'PreMarket'])
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
  const asOfIso = parseAsOfIso(asOfRaw, params.generatedAt)

  const point: MarketPoint = { t: params.generatedAt, price }
  if (asOfIso) point.asOf = asOfIso
  if (change !== null) point.change = change
  if (changePct !== null) point.changePct = changePct
  if (extendedPrice !== null) point.extendedPrice = extendedPrice
  if (extendedChangePct !== null) point.extendedChangePct = extendedChangePct

  return { ok: true, symbol, asset, point }
}
