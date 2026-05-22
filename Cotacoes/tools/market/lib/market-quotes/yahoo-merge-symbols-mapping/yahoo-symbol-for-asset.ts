import type { YahooMergeDeps } from '../yahoo-merge-deps.js'
import { getYahooFuturesRoots } from './futures-roots.js'
import { yahooSymbolFromInvestingSymbol } from './from-investing.js'

export function yahooSymbolForAsset(
  deps: YahooMergeDeps,
  assetSymbol: string,
  category: string | undefined,
  assetExchange: string | undefined,
  overrides: Map<string, string>,
) {
  const base = yahooSymbolFromInvestingSymbol(assetSymbol, overrides)
  if (!base) return null
  const ex = String(assetExchange || '').trim().toUpperCase()
  const isBr =
    ex === 'BVMF' ||
    ex === 'B3' ||
    ex === 'BMFBOVESPA' ||
    ex.endsWith('.SA') ||
    ex.includes('BOVESPA') ||
    ex.includes('BVMF') ||
    ex.includes('B3') ||
    ex.includes('BMF')
  if (/^[A-Z]{4}\d{1,2}$/.test(base) && !/\.SA$/i.test(base) && isBr) return `${base}.SA`
  const futRoots = getYahooFuturesRoots(deps)
  const zqContract = base.match(/^ZQ[FGHJKMNQUVXZ]\d{2}$/)
  if (zqContract && deps.envBool('MARKET_YAHOO_ZQ_CONTRACTS_CBT', true)) return `${base}.CBT`
  const fut = base.match(/^([A-Z]{1,3})([FGHJKMNQUVXZ])\d{2}$/)
  if (fut && deps.envBool('MARKET_YAHOO_FUTURES_MONTHCODE_AS_F', true)) {
    const root = fut[1]
    if (futRoots.has(root)) return `${root}=F`
  }
  const cat = String(category || '').trim().toLowerCase()
  if (!cat) return base
  const futureCats = new Set(['commodities', 'agriculture', 'energy', 'metals'])
  if (!futureCats.has(cat)) return base
  if (!deps.envBool('MARKET_YAHOO_FUTURES_SHORTCODE_AS_F', true)) return base
  if (/^[A-Z]{1,4}$/.test(base) && futRoots.has(base)) return `${base}=F`
  return base
}
