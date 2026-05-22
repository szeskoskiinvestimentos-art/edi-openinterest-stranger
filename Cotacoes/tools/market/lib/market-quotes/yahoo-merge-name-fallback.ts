import type { Asset, MarketPoint } from '../../types.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import type { YahooSparkChartLike } from './yahoo-merge-yahoo.js'
import { yahooSearchByName } from './yahoo-merge-yahoo.js'
import { extractSpark } from './yahoo-merge-fetch.js'
import { getPriceScaleBoundsForCategory } from './yahoo-merge-symbols.js'

export function createNameSearchFallback(params: {
  deps: YahooMergeDeps
  series: Record<string, MarketPoint[]>
  overrides: Map<string, string>
  suggestedOverrides: Set<string>
  enabled: boolean
  maxResolved: number
  timeoutMs: number
  fetchBestChartForSymbol: (symbol: string) => Promise<{ chart: YahooSparkChartLike | null; dataInterval: '5m' | '1d' }>
}) {
  let used = 0
  const cache = new Map<string, string>()
  const allowed = new Set(['EQUITY', 'ETF', 'INDEX', 'CURRENCY', 'CRYPTOCURRENCY', 'FUTURE'])

  async function resolve(asset: Asset | undefined | null, category: string, attemptedYahooSymbol: string) {
    if (!params.enabled) return null as null | { yahooSymbol: string; chart: YahooSparkChartLike; dataInterval: '5m' | '1d' }
    if (!asset || !asset.name) return null
    if (used >= params.maxResolved) return null
    const assetKey = String(asset.symbol || '').trim()
    if (!assetKey) return null
    if (params.overrides.has(assetKey)) return null

    const cached = cache.get(assetKey)
    let cand = cached || ''
    if (!cand) {
      const quotes = await yahooSearchByName(params.deps, String(asset.name || '').trim(), params.timeoutMs)
      const cat = String(category || '').trim().toLowerCase()
      const looksIndexLike =
        /(^|\b)(DE40|UK100|HK50|JP225|CHINA50|US30|US500|NAS100|EUR50|SX5E|VIX)(\b|$)/i.test(assetKey) ||
        /\b\d{2,3}\b/.test(assetKey)
      const wantsIndex = looksIndexLike || cat === 'volatility'
      const wantsFuture = cat === 'commodities' || cat === 'agriculture' || cat === 'energy' || cat === 'metals'
      const wantsCrypto = /\/(USD|USDT)\b/i.test(assetKey) && !(cat === 'fx_g10' || cat === 'fx_emerging')

      let best: { sym: string; score: number; qt: string } | null = null
      for (const q of quotes) {
        if (!q || typeof q !== 'object') continue
        const qo = q as Record<string, unknown>
        const sym = String(typeof qo.symbol === 'string' ? qo.symbol : '').trim()
        if (!sym || /\s/.test(sym)) continue
        const qt = String(typeof qo.quoteType === 'string' ? qo.quoteType : '').trim().toUpperCase()
        if (qt && !allowed.has(qt)) continue

        let score = 1000
        if (sym.startsWith('^')) score -= 120
        if (qt === 'INDEX') score -= 100
        if (qt === 'CURRENCY') score -= 60
        if (qt === 'CRYPTOCURRENCY') score -= 60
        if (qt === 'FUTURE') score -= 40
        if (qt === 'ETF') score -= 10
        if (qt === 'EQUITY') score -= 5

        if (wantsIndex) {
          if (qt !== 'INDEX' && !sym.startsWith('^')) score += 200
        }
        if (wantsCrypto) {
          if (qt !== 'CRYPTOCURRENCY' && !/-USD$/.test(sym)) score += 120
        }
        if (wantsFuture) {
          if (qt !== 'FUTURE' && !/=F$/.test(sym)) score += 120
        }

        const nameRaw =
          typeof qo.shortname === 'string'
            ? qo.shortname
            : typeof qo.longname === 'string'
              ? qo.longname
              : typeof qo.name === 'string'
                ? qo.name
                : ''
        const anyName = String(nameRaw).toLowerCase()
        if (anyName && anyName.includes(String(asset.name || '').trim().toLowerCase().slice(0, 6))) score -= 10

        if (!best || score < best.score) best = { sym, score, qt }
      }
      cand = best ? best.sym : ''
      if (cand && wantsIndex && !(cand.startsWith('^') || best?.qt === 'INDEX')) cand = ''
      if (!cand) return null
      cache.set(assetKey, cand)
    }

    const normalizedAttempt = String(attemptedYahooSymbol || '').trim()
    if (cand === assetKey || cand === normalizedAttempt) return null

    const got = await params.fetchBestChartForSymbol(cand)
    if (!got.chart) return null
    const ex = extractSpark(got.chart)
    if (ex.price === null) return null

    const prevPoints = Array.isArray(params.series[assetKey]) ? params.series[assetKey] : []
    const prev = prevPoints.length ? prevPoints[prevPoints.length - 1] : null
    if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price > 0) {
      const bounds = getPriceScaleBoundsForCategory(params.deps, category)
      const ratio = ex.price / prev.price
      if (!Number.isFinite(ratio) || ratio < bounds[0] || ratio > bounds[1]) return null
    }

    params.overrides.set(assetKey, cand)
    params.suggestedOverrides.add(`${assetKey}=${cand}`)
    used += 1
    return { yahooSymbol: cand, chart: got.chart, dataInterval: got.dataInterval }
  }

  return {
    resolve,
    getUsed() {
      return used
    },
  }
}
