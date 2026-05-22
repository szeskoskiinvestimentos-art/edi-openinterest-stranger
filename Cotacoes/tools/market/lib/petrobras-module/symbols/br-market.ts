import type { MarketQuotes } from '../../../types.js'

export function resolveBrazilMarketProxies(
  market: MarketQuotes,
  findSymbol: (market: MarketQuotes, matcher: RegExp) => string | null,
  findSymbolByMatchers: (market: MarketQuotes, matchers: RegExp[]) => string | null,
) {
  const symUSDBRL = findSymbol(market, /^USD\/BRL\b/i)
  const symIBOV = findSymbol(market, /(^\.BVSP$|\bIBOV\b|\bIbovespa\b)/i)
  const symIBRX = findSymbol(
    market,
    /(^\.IBRX$|\bIBRX\b|\bIBrX\b|\bÍndice\s*Brasil\s*100\b|\bIndice\s*Brasil\s*100\b)/i,
  )
  const symBR20 = findSymbolByMatchers(market, [/^\.BR20T$/i, /^\.BR20$/i, /\bBR\s*20\b/i, /\bBR-?20\b/i, /\bBrasil\s*20\b/i])
  const symBOVA11 = findSymbol(market, /\bBOVA11(?:\.SA)?\b/i)
  const symWIN = findSymbolByMatchers(market, [
    /^WIN/i,
    /\bWINc\d\b/i,
    /\bmini\s*ibovespa\b/i,
    /\bibovespa\s*futuros?\b/i,
    /\bmini\s*índice\b/i,
    /\bmini\s*indice\b/i,
    /\bíndice\s*futuro\b/i,
    /\bindice\s*futuro\b/i,
  ])
  const symWDO = findSymbolByMatchers(market, [/^WDO/i, /\bWDOc\d\b/i, /\bmini\s*dólar\b/i, /\bmini\s*dolar\b/i])
  const symEWZ = findSymbolByMatchers(market, [/^EWZ$/i, /^EWZS(\.\w+)?$/i, /\bBrazil\b.*\bSmall\b.*\bCap\b.*\bETF\b/i])
  const symDXY = findSymbol(market, /(^\.DXY$|\bDXY\b)/i)

  return {
    symUSDBRL,
    symIBOV,
    symIBRX,
    symBR20,
    symBOVA11,
    symWIN,
    symWDO,
    symEWZ,
    symDXY,
  }
}
