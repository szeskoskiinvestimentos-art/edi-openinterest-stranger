import type { MarketQuotes } from '../../../types.js'

export function resolveRiskSymbols(
  market: MarketQuotes,
  findSymbol: (market: MarketQuotes, matcher: RegExp) => string | null,
  findSymbolByMatchers: (market: MarketQuotes, matchers: RegExp[]) => string | null,
) {
  const symBR2Y = findSymbol(market, /^BR2YT=RR$/i)
  const symBR10Y = findSymbol(market, /^BR10YT=RR$/i)
  const symUS10BR10 = findSymbol(market, /^US10BR10=RR$/i)
  const symBRCDS5Y = findSymbol(market, /^BRGV5YUSAC=R$/i)
  const symVXBR = findSymbol(market, /(^\.VXBR$|\bVXBR\b)/i)
  const symVIX = findSymbolByMatchers(market, [/^VIX$/i, /^\.VIX\b/i])
  const symOVX = findSymbolByMatchers(market, [/^\.OVX$/i, /^OVX$/i, /\bCrude Oil Volatility\b/i])
  const symUS10Y = findSymbolByMatchers(market, [
    /^US10YT=X$/i,
    /^US10YT=RR$/i,
    /^\.TNX$/i,
    /^\^TNX$/i,
    /^TNc\d=\$?$/i,
    /\b10\s*Year\s*Treasury\s*Yield\b/i,
    /\bUnited States\b.*\b10\b.*\bYear\b/i,
  ])
  return { symBR2Y, symBR10Y, symUS10BR10, symBRCDS5Y, symVXBR, symVIX, symOVX, symUS10Y }
}
