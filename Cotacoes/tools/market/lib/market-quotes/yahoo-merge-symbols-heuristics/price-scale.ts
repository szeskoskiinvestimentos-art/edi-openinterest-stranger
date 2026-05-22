import type { YahooMergeDeps } from '../yahoo-merge-deps.js'

function parseScaleBounds(raw: string | undefined): [number, number] | null {
  const s = String(raw || '').trim()
  if (!s) return null
  const m = s.split(',').map(x => Number(x.trim()))
  if (m.length !== 2) return null
  const a = Number(m[0])
  const b = Number(m[1])
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  if (lo <= 0 || hi <= 0) return null
  return [lo, hi]
}

export function getPriceScaleBoundsForCategory(deps: YahooMergeDeps, catRaw: string | undefined): [number, number] {
  const cat = String(catRaw || '').trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_')
  const perCat = parseScaleBounds(deps.env(`MARKET_YAHOO_PRICE_SCALE_${cat}`))
  if (perCat) return perCat
  const def = parseScaleBounds(deps.env('MARKET_YAHOO_PRICE_SCALE_DEFAULT'))
  if (def) return def
  return [0.05, 20]
}
