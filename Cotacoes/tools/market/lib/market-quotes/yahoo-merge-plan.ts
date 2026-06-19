import type { Asset } from '../../types.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import { parseSymbolOverrides, parseYahooSet, yahooSymbolForAsset } from './yahoo-merge-symbols.js'

export function buildYahooMergePlan(params: {
  deps: YahooMergeDeps
  assets: Asset[]
  maxSymbols: number
}): {
  overrides: Map<string, string>
  assetBySymbol: Map<string, Asset>
  byCategory: Map<string, { assets: number; attempted: number; updated: number; missing: number }>
  selectedPlan: Array<{ assetSymbol: string; yahooSymbol: string }>
  uniqueYahoo: string[]
  skippedAssets: number
} {
  const overrides = parseSymbolOverrides(params.deps.env('MARKET_YAHOO_SYMBOL_OVERRIDES'))
  if (!overrides.has('CHINA50')) overrides.set('CHINA50', 'XIN9.FGI')
  const sx5e = overrides.get('SX5E.S')
  if (!sx5e || sx5e === '^STOXX50E') overrides.set('SX5E.S', 'SX5E.SW')
  if (!overrides.has('0P0000N9A6')) overrides.set('0P0000N9A6', '000016.SS')
  const axia = overrides.get('AXIA_p.K')
  if (!axia || axia === 'AXIA_p') overrides.set('AXIA_p.K', 'EBR')
  if (!overrides.has('CIGc')) overrides.set('CIGc', 'CIG')
  if (!overrides.has('HSIQJ6')) overrides.set('HSIQJ6', '^HSI')
  const jbs = overrides.get('JBSAY.PK')
  if (!jbs || jbs === 'JBSAY') overrides.set('JBSAY.PK', 'JBSS3.SA')
  if (!overrides.has('GPR')) overrides.set('GPR', 'RB=F')
  if (!overrides.has('FBR')) overrides.set('FBR', 'SUZ')
  if (!overrides.has('Wv1')) overrides.set('Wv1', 'ZW=F')

  const includeCategories = new Set(params.deps.parseList(params.deps.env('MARKET_YAHOO_INCLUDE_CATEGORIES')).map(x => x.toLowerCase()))
  const excludeCategories = new Set(params.deps.parseList(params.deps.env('MARKET_YAHOO_EXCLUDE_CATEGORIES')).map(x => x.toLowerCase()))
  const includeSymbols = parseYahooSet(params.deps.parseList, params.deps.env('MARKET_YAHOO_INCLUDE_SYMBOLS'))
  const excludeSymbols = parseYahooSet(params.deps.parseList, params.deps.env('MARKET_YAHOO_EXCLUDE_SYMBOLS'))
  excludeSymbols.add('.TYVIX')
  excludeSymbols.add('^TYVIX')
  excludeSymbols.add('AXIA_p.K')
  excludeSymbols.add('JBSAY.PK')

  const assetBySymbol = new Map<string, Asset>()
  const byCategory = new Map<string, { assets: number; attempted: number; updated: number; missing: number }>()
  for (const a of params.assets) {
    const sym = String(a && a.symbol ? a.symbol : '').trim()
    if (!sym) continue
    assetBySymbol.set(sym, a)
    const cat = String(a && a.category ? a.category : 'n/d') || 'n/d'
    const cur = byCategory.get(cat) || { assets: 0, attempted: 0, updated: 0, missing: 0 }
    cur.assets += 1
    byCategory.set(cat, cur)
  }

  const plan: Array<{ assetSymbol: string; yahooSymbol: string }> = []
  for (const a of params.assets) {
    const assetSymbol = String(a && a.symbol ? a.symbol : '').trim()
    if (!assetSymbol) continue
    const category = String(a && a.category ? a.category : 'n/d').trim().toLowerCase()
    if (includeSymbols.size && !includeSymbols.has(assetSymbol)) continue
    if (excludeSymbols.has(assetSymbol)) continue
    const explicitSymbol = includeSymbols.size > 0 && includeSymbols.has(assetSymbol)
    if (!explicitSymbol) {
      if (includeCategories.size && !includeCategories.has(category)) continue
      if (excludeCategories.has(category)) continue
    }
    const yahooSymbol = yahooSymbolForAsset(
      params.deps,
      assetSymbol,
      category,
      a && a.exchange ? String(a.exchange) : undefined,
      overrides,
    )
    if (!yahooSymbol) continue
    plan.push({ assetSymbol, yahooSymbol })
  }

  const pinnedMatchers: RegExp[] = [
    /^WINc1$/i,
    /^WDOc1$/i,
    /^\.BVSP$/i,
    /^USDX$/i,
    /^DX-Y\.NYB$/i,
    /^\.DXY$/i,
    /^USD\/BRL\b/i,
    /^\.(VIX|VIX9D)\b/i,
    /^VIX\b/i,
    /^\.TNX$/i,
    /^\^TNX$/i,
  ]
  const pinnedRank = (assetSymbol: string) => (pinnedMatchers.some(rx => rx.test(assetSymbol)) ? 0 : 1)
  plan.sort((a, b) => pinnedRank(a.assetSymbol) - pinnedRank(b.assetSymbol))

  const maxSymbols = Math.max(1, Math.min(2000, Math.trunc(params.maxSymbols)))
  const uniqueYahoo = Array.from(new Set(plan.map(p => p.yahooSymbol))).slice(0, maxSymbols)
  const selectedYahooSet = new Set(uniqueYahoo)
  const selectedPlan = plan.filter(p => selectedYahooSet.has(p.yahooSymbol))
  const skippedAssets = Math.max(0, plan.length - selectedPlan.length)

  return { overrides, assetBySymbol, byCategory, selectedPlan, uniqueYahoo, skippedAssets }
}
