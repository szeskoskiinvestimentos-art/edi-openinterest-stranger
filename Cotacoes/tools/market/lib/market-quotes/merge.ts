import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Asset, MarketPoint, MarketQuotes } from '../../types.js'
import { atomicWriteText } from '../io.js'

export type DiQuote = {
  symbol: string
  rate: number
  changePct?: number | null
}

export async function mergeDiIntoMarketQuotes(outDir: string, di: DiQuote[]) {
  if (!di.length) return

  const jsonPath = path.join(outDir, 'market_quotes.json')
  const raw = await readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as MarketQuotes
  if (!parsed || !Array.isArray(parsed.assets) || !parsed.series || !parsed.meta) return

  const generatedAt = String(parsed.meta.generatedAt || new Date().toISOString())
  const assets: Asset[] = parsed.assets
  const series: Record<string, MarketPoint[]> = parsed.series

  const hasAsset = new Set(assets.map(a => String(a && a.symbol ? a.symbol : '')))

  for (const q of di) {
    if (!hasAsset.has(q.symbol)) {
      assets.push({
        symbol: q.symbol,
        name: `Brazil DI Future ${q.symbol}`,
        exchange: 'B3',
        category: 'rates',
        tags: ['risk_off'],
      })
      hasAsset.add(q.symbol)
    }

    const points = Array.isArray(series[q.symbol]) ? series[q.symbol] : []
    const prev = points.length ? points[points.length - 1] : null
    const point: MarketPoint = { t: generatedAt, price: q.rate }
    if (typeof q.changePct === 'number' && Number.isFinite(q.changePct) && q.changePct !== 0) {
      point.changePct = q.changePct
    } else if (prev && typeof prev.price === 'number') {
      const change = q.rate - prev.price
      if (Number.isFinite(change) && change !== 0) point.change = change
      if (prev.price !== 0) {
        const changePct = (change / prev.price) * 100
        if (Number.isFinite(changePct) && changePct !== 0) point.changePct = changePct
      }
    }

    const next =
      prev && prev.t === point.t
        ? points.slice(0, -1).concat([point])
        : points.concat([point])

    series[q.symbol] = next
  }

  assets.sort((a, b) => String(a.symbol || '').localeCompare(String(b.symbol || '')))
  parsed.assets = assets
  parsed.series = series
  parsed.meta.diUpdatedAt = new Date().toISOString()

  await atomicWriteText(jsonPath, JSON.stringify(parsed, null, 2))
  await atomicWriteText(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`)
}

export async function mergeSinaQuoteIntoMarketQuotes(
  outDir: string,
  input: {
    seriesKey: string
    asset: Asset
    price: number
    change?: number | null
    changePct?: number | null
    basePrice?: number | null
  },
) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const raw = await readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as MarketQuotes
  if (!parsed || !Array.isArray(parsed.assets) || !parsed.series || !parsed.meta) return

  const generatedAt = String(parsed.meta.generatedAt || new Date().toISOString())
  const assets: Asset[] = parsed.assets
  const series: Record<string, MarketPoint[]> = parsed.series
  const key = String(input.seriesKey || '').trim()
  if (!key) return

  const hasAsset = new Set(assets.map(a => String(a && a.symbol ? a.symbol : '')))
  if (!hasAsset.has(key)) {
    assets.push(input.asset)
    hasAsset.add(key)
  }

  const points = Array.isArray(series[key]) ? series[key] : []
  const cleanedPoints =
    key === 'DCE_I0'
      ? points.filter(p => {
          const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null
          const chg = p && typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null
          const chgPct = p && typeof p.changePct === 'number' && Number.isFinite(p.changePct) ? p.changePct : null
          if (price === null || chg === null || chgPct === null) return true
          if (Math.abs(chgPct) <= 30) return true
          if (Math.abs(chg) <= price * 0.3) return true
          return false
        })
      : points
  const prev = cleanedPoints.length ? cleanedPoints[cleanedPoints.length - 1] : null
  const point: MarketPoint = { t: generatedAt, price: input.price }

  const base =
    typeof input.basePrice === 'number' && Number.isFinite(input.basePrice) && input.basePrice !== 0 ? input.basePrice : null
  if (base !== null) {
    const change = input.price - base
    const pct = (change / base) * 100
    if (Number.isFinite(change) && change !== 0) point.change = change
    if (Number.isFinite(pct) && pct !== 0) point.changePct = pct
  } else if (typeof input.change === 'number' && Number.isFinite(input.change) && input.change !== 0) {
    point.change = input.change
    if (typeof input.changePct === 'number' && Number.isFinite(input.changePct) && input.changePct !== 0) {
      point.changePct = input.changePct
    } else if (prev && typeof prev.price === 'number' && prev.price !== 0) {
      const pct = (input.change / prev.price) * 100
      if (Number.isFinite(pct) && pct !== 0) point.changePct = pct
    }
  } else if (prev && typeof prev.price === 'number') {
    const change = input.price - prev.price
    if (Number.isFinite(change) && change !== 0) point.change = change
    if (prev.price !== 0) {
      const pct = (change / prev.price) * 100
      if (Number.isFinite(pct) && pct !== 0) point.changePct = pct
    }
  }

  const next = prev && prev.t === point.t ? cleanedPoints.slice(0, -1).concat([point]) : cleanedPoints.concat([point])
  series[key] = next

  assets.sort((a, b) => String(a.symbol || '').localeCompare(String(b.symbol || '')))
  parsed.assets = assets
  parsed.series = series

  await atomicWriteText(jsonPath, JSON.stringify(parsed, null, 2))
  await atomicWriteText(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`)
}
