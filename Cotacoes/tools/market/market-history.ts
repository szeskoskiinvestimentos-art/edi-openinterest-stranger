import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { parseCsv } from './lib/csv.js'
import { classifyAsset } from './lib/classify.js'
import { pruneOldPoints, readExisting } from './lib/history.js'
import { computeFlowSentinel } from './lib/flow-sentinel.js'
import { parseNumber, parsePercent, toISO } from './lib/parse.js'
import type { Asset, MarketPoint, MarketQuotes } from './types.js'

type BuildMarketHistoryInput = {
  csvPath: string
  outDir: string
  intervalMinutes?: number
  retentionDays?: number
  timestamp?: string
}

function getFirst(row: Record<string, string>, keys: string[]) {
  for (const k of keys) {
    const v = (row[k] || '').trim()
    if (v) return v
  }
  return ''
}

function parseAsOfIso(raw: string, referenceIso: string) {
  const s = String(raw || '').trim()
  if (!s || s === '-' || s === '--') return null
  const ref = new Date(referenceIso)
  if (!Number.isFinite(ref.getTime())) return null

  const time = s.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (time) {
    const hh = Number(time[1])
    const mi = Number(time[2])
    const ss = Number(time[3] || '0')
    if (![hh, mi, ss].every(Number.isFinite)) return null
    const dt = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), hh, mi, ss)
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : null
  }

  const dmy = s.match(/^(\d{2})\/(\d{2})(?:\/(\d{2}|\d{4}))?$/)
  if (dmy) {
    const dd = Number(dmy[1])
    const mm = Number(dmy[2])
    const yyRaw = dmy[3]
    const refYear = ref.getFullYear()
    let yyyy = refYear
    if (yyRaw) {
      const y = Number(yyRaw)
      if (!Number.isFinite(y)) return null
      yyyy = yyRaw.length === 2 ? 2000 + y : y
    }
    if (![dd, mm, yyyy].every(Number.isFinite)) return null
    let dt = new Date(yyyy, mm - 1, dd, 0, 0, 0)
    if (!Number.isFinite(dt.getTime())) return null
    if (!yyRaw) {
      const driftDays = (dt.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000)
      if (driftDays > 7) dt = new Date(refYear - 1, mm - 1, dd, 0, 0, 0)
    }
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : null
  }

  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) {
    const yyyy = Number(ymd[1])
    const mm = Number(ymd[2])
    const dd = Number(ymd[3])
    if (![dd, mm, yyyy].every(Number.isFinite)) return null
    const dt = new Date(yyyy, mm - 1, dd, 0, 0, 0)
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : null
  }

  return null
}

function cleanDisplayName(symbol: string, name: string) {
  const sym = String(symbol || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  const symCore = sym.split(' - ')[0]?.trim() || sym
  let out = String(name || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  if (!out) return out

  for (let i = 0; i < 3; i++) {
    const m = out.match(/^(.+?)\s+\1$/)
    if (!m) break
    out = String(m[1] || '').trim()
  }

  if (sym && out === sym) {
    const parts = sym.split(' - ')
    const tail = parts.length > 1 ? parts.slice(1).join(' - ').trim() : ''
    if (symCore && tail && symCore !== sym) return `${symCore} — ${tail}`
    return symCore || out
  }

  if (symCore && out.startsWith(`${symCore} - `)) {
    out = `${symCore} — ${out.slice((symCore + ' - ').length).trim()}`
  }

  return out
}

function normalizeSymbol(rawSymbol: string, rawName: string) {
  const sym = String(rawSymbol || '').trim()
  const up = sym.toUpperCase()
  const name = String(rawName || '').trim()

  if (
    up === 'DX' ||
    up === '.DXY' ||
    up === 'USDIDX' ||
    up === 'DX=F' ||
    /^DXC\d+$/i.test(up) ||
    (/\b(?:indice|índice)\s+d[oó]lar\b/i.test(name) && (up === 'DX' || up === '.DXY' || up === 'USDIDX'))
  ) {
    return 'USDX'
  }

  return sym
}

function envBool(name: string, fallback: boolean) {
  const raw = process.env[name]
  if (raw === undefined || raw === null || raw === '') return fallback
  const v = String(raw).trim().toLowerCase()
  if (v === '1' || v === 'true' || v === 'yes' || v === 'y' || v === 'on') return true
  if (v === '0' || v === 'false' || v === 'no' || v === 'n' || v === 'off') return false
  return fallback
}

function envNumber(name: string, fallback: number) {
  const raw = process.env[name]
  if (raw === undefined || raw === null || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function envList(name: string) {
  const raw = process.env[name]
  if (raw === undefined || raw === null || raw === '') return []
  return String(raw)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function hasAssetMatch(assets: Asset[], re: RegExp) {
  for (const a of assets) {
    const sym = String(a && a.symbol ? a.symbol : '')
    const name = String(a && a.name ? a.name : '')
    if (re.test(sym) || re.test(name)) return true
  }
  return false
}

function validateCoverageOrThrow(assets: Asset[]) {
  const enabled = envBool('MARKET_COVERAGE_ENABLED', true)
  if (!enabled) {
    return {
      ok: true,
      assets: assets.length,
      requiredCritical: [],
      missingCritical: [],
    }
  }

  const minAssets = Math.max(0, envNumber('MARKET_COVERAGE_MIN_ASSETS', 25))
  if (minAssets > 0 && assets.length < minAssets) {
    throw new Error(`Cobertura baixa: assets=${assets.length} (mínimo=${minAssets})`)
  }

  const patterns = {
    'USD/BRL': /^USD\/BRL\b/i,
    WDO: /^WDO/i,
    WIN: /^WIN/i,
    IBOV: /(^\.BVSP$|\bIbovespa\b)/i,
    EWZ: /^EWZ$/i,
    DXY: /(^\.DXY$|\bDXY\b|US Dollar Index)/i,
  } as const

  const requiredCritical = envList('MARKET_COVERAGE_CRITICAL').length
    ? envList('MARKET_COVERAGE_CRITICAL')
    : ['USD/BRL', 'WDO', 'WIN', 'IBOV']

  const missingCritical = requiredCritical.filter(label => {
    const re = (patterns as Record<string, RegExp>)[label]
    if (!re) return false
    return !hasAssetMatch(assets, re)
  })

  if (missingCritical.length) {
    throw new Error(`Críticos ausentes: ${missingCritical.join(', ')}`)
  }

  return {
    ok: true,
    assets: assets.length,
    requiredCritical,
    missingCritical: [],
  }
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
  let usdxBestPriority = -1
  const portfolioStats = {
    rowsTotal: parsedRows.length,
    rowsMissingSymbolOrName: 0,
    rowsInvalidSymbol: 0,
    rowsSkippedByPriority: 0,
    rowsMissingPrice: 0,
    rowsWithPrice: 0,
    uniqueSymbols: 0,
    duplicateSymbols: 0,
    sampleMissingPriceSymbols: [] as string[],
  }

  for (const row of parsedRows) {
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
    if (!rawSymbol || !name) {
      portfolioStats.rowsMissingSymbolOrName += 1
      continue
    }

    const symbol = normalizeSymbol(rawSymbol, name)
    if (!symbol) {
      portfolioStats.rowsInvalidSymbol += 1
      continue
    }

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

    const extendedPriceRaw = getFirst(row, [
      'Negociação Estendida',
      'Negociacao Estendida',
      'Extended Hours',
      'Extended',
    ])
    const extendedPrice = parseNumber(extendedPriceRaw)

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

    const extendedChangePctRaw = getFirst(row, [
      'Negociação Estendida (%)',
      'Negociacao Estendida (%)',
      'Extended Hours (%)',
      'Extended (%)',
    ])
    let extendedChangePct = parsePercent(extendedChangePctRaw)
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

    series[symbol] = pruneOldPoints(nextPoints, cutoffMs)
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
