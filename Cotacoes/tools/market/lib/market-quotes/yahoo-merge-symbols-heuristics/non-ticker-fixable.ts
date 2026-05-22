import type { YahooMergeDeps } from '../yahoo-merge-deps.js'

let cachedNonTickerFixableCfg: { symbols: Set<string>; categories: Set<string> } | null = null

function getNonTickerFixableCfg(deps: YahooMergeDeps) {
  if (cachedNonTickerFixableCfg) return cachedNonTickerFixableCfg
  const symbols = new Set(deps.parseList(deps.env('MARKET_YAHOO_NONFIXABLE_SYMBOLS')).map(x => x.trim()).filter(Boolean))
  const categories = new Set(
    deps
      .parseList(deps.env('MARKET_YAHOO_NONFIXABLE_CATEGORIES'))
      .map(x => x.trim().toLowerCase())
      .filter(Boolean),
  )
  cachedNonTickerFixableCfg = { symbols, categories }
  return cachedNonTickerFixableCfg
}

export function isNonTickerFixableMissing(
  deps: YahooMergeDeps,
  category: string | undefined,
  yahooSymbol: string | undefined,
  reason: string | undefined,
) {
  const cat = String(category || '').toLowerCase()
  const y = String(yahooSymbol || '').trim()
  const r = String(reason || '').trim()
  if (r !== 'no_price' && r !== 'not_returned') return false
  const cfg = getNonTickerFixableCfg(deps)
  if (cfg.symbols.has(y)) return true
  if (cfg.categories.has(cat)) return true
  if (y.startsWith('^')) return true
  if (cat === 'volatility' || cat === 'rates' || cat === 'bonds') return true
  const hard = new Set(['^GVZ', '^OVX', '^SKEW', '^VXN', '^VIX9D', '^VVIX', '^TNX'])
  if (hard.has(y)) return true
  return false
}
