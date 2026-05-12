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
  const retentionDays = Number(input.retentionDays ?? 10)
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

  for (const row of parsedRows) {
    const symbol = getFirst(row, [
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
    if (!symbol || !name) continue

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
    if (price === null) continue

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

    const cleanedName = cleanDisplayName(symbol, name)
    const { category, tags } = classifyAsset({ Name: cleanedName, Symbol: symbol, Exchange: exchange })
    assetsBySymbol.set(symbol, { symbol, name: cleanedName, exchange, category, tags })

    const point: MarketPoint = { t: generatedAt, price }
    if (change !== null) point.change = change
    if (changePct !== null) point.changePct = changePct

    const existingPoints = series[symbol] || []
    const last = existingPoints.length ? existingPoints[existingPoints.length - 1] : null
    const nextPoints =
      last && last.t === point.t
        ? existingPoints.slice(0, -1).concat([point])
        : existingPoints.concat([point])

    series[symbol] = pruneOldPoints(nextPoints, cutoffMs)
  }

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
