import type { Asset, MarketPoint } from '../../types.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import { getPriceScaleBoundsForCategory, normalizeInvestingYahooCandidate } from './yahoo-merge-symbols.js'
import type { TradingViewSearchItem } from './yahoo-merge-tradingview.js'
import {
  normalizeLooseText,
  tradingViewPreferredExchanges,
  tradingViewPreferredType,
  tradingViewQueryHints,
  tradingViewScanLastPrice,
  tradingViewSymbolSearch,
} from './yahoo-merge-tradingview.js'

export function createTradingViewFallback(params: {
  deps: YahooMergeDeps
  series: Record<string, MarketPoint[]>
  tradingViewOverrides: Map<string, string>
  suggestedOverrides: Set<string>
  enabled: boolean
  maxResolved: number
  timeoutMs: number
}) {
  let used = 0
  const resolvedCache = new Map<string, string>()

  async function resolve(asset: Asset | undefined | null, category: string) {
    if (!params.enabled) return null as null | { tradingViewSymbol: string; price: number; usedColumn: string; updateMode: string | null }
    if (!asset || !asset.symbol) return null
    if (used >= params.maxResolved) return null
    const assetKey = String(asset.symbol || '').trim()
    if (!assetKey) return null

    const cached = resolvedCache.get(assetKey)
    let tv = cached || ''
    let usedExplicitOverride = false
    if (!tv) {
      const direct =
        params.tradingViewOverrides.get(assetKey) ||
        params.tradingViewOverrides.get(normalizeInvestingYahooCandidate(assetKey)) ||
        params.tradingViewOverrides.get(String(assetKey).toUpperCase())
      if (direct) {
        tv = String(direct).trim()
        usedExplicitOverride = true
      }
    }

    const preferredType = tradingViewPreferredType(category)
    const preferredExchanges = tradingViewPreferredExchanges(asset)
    const nameNorm = normalizeLooseText(String(asset.name || ''))
    const hints = tradingViewQueryHints(asset)

    if (!tv) {
      let best: { fullName: string; score: number } | null = null
      const rank = (it: TradingViewSearchItem) => {
        const full = String(it.full_name || '').trim()
        if (!full || !full.includes(':')) return null
        const sym = String(it.symbol || '').trim()
        const ex = String(it.exchange || '').trim().toUpperCase()
        const tp = String(it.type || '').trim().toLowerCase()
        const desc = normalizeLooseText(String(it.description || ''))
        let score = 0
        if (preferredType && tp === preferredType) score += 30
        if (preferredType && tp && tp !== preferredType) score -= 10
        if (preferredExchanges.length && preferredExchanges.includes(ex)) score += 60
        if (sym && normalizeLooseText(sym) === normalizeLooseText(assetKey)) score += 25
        if (desc && nameNorm && desc.includes(nameNorm.slice(0, 8))) score += 10
        return { fullName: full, score }
      }

      for (const q of hints) {
        if (best && best.score >= 95) break
        for (const ex of (preferredExchanges.length ? preferredExchanges : [''])) {
          const items = await tradingViewSymbolSearch(params.deps, q, { timeoutMs: params.timeoutMs, exchange: ex || null })
          for (const it of items.slice(0, 60)) {
            const ranked = rank(it)
            if (!ranked) continue
            if (!best || ranked.score > best.score) best = ranked
          }
          if (best && best.score >= 95) break
        }
      }

      tv = best ? best.fullName : ''
    }

    if (!tv) return null
    resolvedCache.set(assetKey, tv)
    if (!usedExplicitOverride) {
      const k = String(assetKey || '').trim()
      if (k && !params.tradingViewOverrides.has(k) && tv.includes(':')) params.suggestedOverrides.add(`${k}=${tv}`)
    }

    const scan = await tradingViewScanLastPrice(params.deps, tv, params.timeoutMs)
    if (!scan) return null

    const prevPoints = Array.isArray(params.series[assetKey]) ? params.series[assetKey] : []
    const prev = prevPoints.length ? prevPoints[prevPoints.length - 1] : null
    if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price > 0) {
      const bounds = getPriceScaleBoundsForCategory(params.deps, category)
      const ratio = scan.price / prev.price
      if (!Number.isFinite(ratio) || ratio < bounds[0] || ratio > bounds[1]) return null
    }

    used += 1
    return { tradingViewSymbol: tv, price: scan.price, usedColumn: scan.usedColumn, updateMode: scan.updateMode }
  }

  return {
    resolve,
    getUsed() {
      return used
    },
  }
}

