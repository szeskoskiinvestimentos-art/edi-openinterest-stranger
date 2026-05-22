import type { Asset } from '../../types.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import type { YahooMergeAuditItem } from './yahoo-merge-apply.js'
import { yahooSearchByName } from './yahoo-merge-yahoo.js'
import { isNonTickerFixableMissing, suggestYahooOverrideFromAuditItem, yahooSymbolForAsset } from './yahoo-merge-symbols.js'

export async function emitYahooMergeSuggestions(params: {
  deps: YahooMergeDeps
  auditItems: YahooMergeAuditItem[]
  overrides: Map<string, string>
  assetBySymbol: Map<string, Asset>
  requiredCritical: string[]
  timeoutMs: number
}) {
  try {
    const criticalFromEnv = new Set(params.deps.parseList(params.deps.env('MARKET_COVERAGE_CRITICAL')).map(x => x.trim()).filter(Boolean))
    for (const s of params.requiredCritical) criticalFromEnv.add(s)

    const categoryRank = (cat: string) => {
      const c = String(cat || '').toLowerCase()
      if (c === 'fx_g10' || c === 'fx') return 1
      if (c === 'equities') return 2
      if (c === 'metals' || c === 'commodities' || c === 'energy' || c === 'agro') return 3
      if (c === 'crypto') return 4
      if (c === 'rates' || c === 'bonds') return 5
      if (c === 'volatility') return 6
      return 9
    }

    const byKey = new Map<
      string,
      { k: string; v: string; assetSymbol: string; category: string; isCritical: boolean; catRank: number }
    >()

    for (const it of params.auditItems) {
      const anyIt = it as unknown as {
        assetSymbol?: string
        category?: string
        yahooSymbol?: string
        status?: string
        reason?: string
        nonTickerFixable?: boolean
      }
      if (
        anyIt &&
        anyIt.status === 'missing' &&
        (anyIt.nonTickerFixable === true ||
          isNonTickerFixableMissing(params.deps, anyIt.category, anyIt.yahooSymbol, anyIt.reason))
      ) {
        continue
      }
      const pair = suggestYahooOverrideFromAuditItem(
        it as unknown as { assetSymbol: string; yahooSymbol: string; status: 'updated' | 'missing'; reason?: string },
      )
      if (!pair) continue
      const idx = pair.indexOf('=')
      if (idx <= 0) continue
      const k = pair.slice(0, idx).trim()
      const v = pair.slice(idx + 1).trim()
      if (!k || !v) continue
      if (params.overrides.has(k)) continue
      if (k === v) continue
      const anyCat = String((it as unknown as { category?: unknown }).category || '')
      const current = yahooSymbolForAsset(params.deps, k, anyCat, undefined, params.overrides)
      if (current && current === v) continue

      const assetSymbol = String(
        (it as unknown as { assetSymbol?: unknown }).assetSymbol ? (it as unknown as { assetSymbol: unknown }).assetSymbol : k,
      ).trim()
      const category = String((it as unknown as { category?: unknown }).category || '').trim()
      const isCritical = criticalFromEnv.has(assetSymbol) || criticalFromEnv.has(k)
      const catRank = categoryRank(category)

      const prev = byKey.get(k)
      if (!prev) {
        byKey.set(k, { k, v, assetSymbol, category, isCritical, catRank })
        continue
      }
      const prevScore = (prev.isCritical ? 0 : 100) + prev.catRank
      const nextScore = (isCritical ? 0 : 100) + catRank
      if (nextScore < prevScore) byKey.set(k, { k, v, assetSymbol, category, isCritical, catRank })
    }

    const ordered = Array.from(byKey.values())
      .sort((a, b) => {
        if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1
        if (a.catRank !== b.catRank) return a.catRank - b.catRank
        return a.assetSymbol.localeCompare(b.assetSymbol)
      })
      .slice(0, 60)

    if (ordered.length) {
      const criticalCount = ordered.filter(x => x.isCritical).length
      process.stdout.write(
        `SUGGEST • MARKET_YAHOO_SYMBOL_OVERRIDES (critical_first) total=${ordered.length} critical=${criticalCount}:\n`,
      )
      process.stdout.write(`${ordered.map(x => `${x.k}=${x.v}`).join(' ; ')}\n`)
    }

    const nameSearchEnabled = params.deps.envBool('MARKET_YAHOO_NAME_SEARCH_ENABLED', false)
    const nameSearchMax = Math.max(0, Math.min(200, params.deps.envNumber('MARKET_YAHOO_NAME_SEARCH_MAX', 20)))
    if (nameSearchEnabled && nameSearchMax > 0) {
      const already = new Set(ordered.map(x => x.k))
      let used = 0
      for (const it of params.auditItems) {
        if (used >= nameSearchMax) break
        const anyIt = it as unknown as {
          assetSymbol?: string
          category?: string
          yahooSymbol?: string
          status?: string
          reason?: string
          nonTickerFixable?: boolean
        }
        if (!anyIt || anyIt.status !== 'missing') continue
        if (anyIt.nonTickerFixable) continue
        const k = String(anyIt.assetSymbol || '').trim()
        if (!k || params.overrides.has(k) || already.has(k)) continue
        const asset = params.assetBySymbol.get(k)
        const name = asset && asset.name ? String(asset.name).trim() : ''
        if (!name) continue
        const quotes = await yahooSearchByName(params.deps, name, params.timeoutMs)
        const cand = Array.isArray(quotes)
          ? quotes.find((q): q is Record<string, unknown> => {
              if (!q || typeof q !== 'object') return false
              const qo = q as Record<string, unknown>
              const hasSym = typeof qo.symbol === 'string' || typeof qo.ticker === 'string'
              const hasName = typeof qo.longname === 'string' || typeof qo.shortname === 'string' || typeof qo.name === 'string'
              return hasSym && hasName
            })
          : null
        const sym = cand
          ? String(typeof cand.symbol === 'string' ? cand.symbol : typeof cand.ticker === 'string' ? cand.ticker : '').trim()
          : ''
        if (sym && !params.overrides.has(k) && !already.has(k)) {
          already.add(k)
          used++
          process.stdout.write(`SUGGEST • NAME_MATCH ${k}=${sym}\n`)
        }
      }
    }
  } catch {
    void 0
  }
}

