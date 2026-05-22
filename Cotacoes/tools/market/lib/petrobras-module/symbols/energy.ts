import type { MarketQuotes } from '../../../types.js'

export function resolveEnergySymbols(
  market: MarketQuotes,
  findSymbol: (market: MarketQuotes, matcher: RegExp) => string | null,
  findSymbolByMatchers: (market: MarketQuotes, matchers: RegExp[]) => string | null,
) {
  const symBrent = findSymbolByMatchers(market, [
    /^LCOc\d$/i,
    /^BRNc\d$/i,
    /^BRN$/i,
    /^LCO\b/i,
    /^BZ=F$/i,
    /^BZ[HMUZ]\d{2}$/i,
    /^BNO$/i,
    /\bUKOIL\b/i,
    /\bBrent\b/i,
    /\bBRENT\b/i,
  ])
  const symWti = findSymbolByMatchers(market, [
    /^CLc\d$/i,
    /^CL[HMUZ]\d{2}$/i,
    /^CL$/i,
    /^CL=F$/i,
    /^DBO$/i,
    /\bUSOIL\b/i,
    /\bWTI\b/i,
  ])
  const symUSO = findSymbol(market, /^USO$/i)
  const symXLE = findSymbol(market, /^XLE$/i)
  const symXOP = findSymbol(market, /^XOP$/i)
  const symOIH = findSymbol(market, /^OIH$/i)
  const symRBOB = findSymbolByMatchers(market, [
    /^RB=F$/i,
    /^RBc\d$/i,
    /^LRBc\d$/i,
    /^GPR$/i,
    /\bgasolina\b.*\brbob\b/i,
    /\brbob\b.*\bgasolina\b/i,
    /\bgasolina\b.*\bfuturos?\b/i,
    /\brbob\s+gasoline\s+futures\b/i,
    /\bgasoline\b.*\brbob\b/i,
    /\brbob\b/i,
  ])
  const symHO = findSymbolByMatchers(market, [
    /^HO=F$/i,
    /^LGOc\d$/i,
    /^LHOc\d$/i,
    /\bgas\s*oil\b(?!.*\bspread\b)/i,
    /\bgasoil\b(?!.*\bspread\b)/i,
    /\bdiesel\b(?!.*\bspread\b)/i,
    /\bulsd\b(?!.*\bspread\b)/i,
    /\bheating\s*oil\b(?!.*\bspread\b)/i,
    /\bgas\s*oil\b/i,
    /\bgasoil\b/i,
    /\bdiesel\b/i,
    /\bulsd\b/i,
    /\bheating\s*oil\b/i,
  ])
  const symHeatingOilUS = findSymbolByMatchers(market, [
    /^LHOc\d$/i,
    /^NYF$/i,
    /\bóleo\s+de\s+aque(?:c|ç)imento\b/i,
    /\bheating\s*oil\b(?!.*\bspread\b)/i,
  ])

  return { symBrent, symWti, symUSO, symXLE, symXOP, symOIH, symRBOB, symHO, symHeatingOilUS }
}
