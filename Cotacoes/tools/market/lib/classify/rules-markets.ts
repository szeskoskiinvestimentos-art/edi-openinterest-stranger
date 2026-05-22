import { includesAny } from './text.js'
import type { RuleContext } from './rules-context.js'

export function matchVhsi(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (/^VHSI(c\d+)?$/i.test(ctx.symbolUpper) || includesAny(ctx.name, ['HSI Volatility'])) {
    return { category: 'volatility', tags: ['risk_off'] }
  }
  return null
}

export function matchCreditCds(ctx: RuleContext): { category: string; tags: string[] } | null {
  const isCds = includesAny(ctx.name, ['cds'])
  if (isCds || (ctx.symbolUpper.includes('GV') && ctx.symbolUpper.endsWith('USAC=R')) || (ctx.symbolUpper.includes('GV') && ctx.symbolUpper.endsWith('USAB=R'))) {
    return { category: 'credit', tags: ['risk_off', 'credit'] }
  }
  return null
}

export function matchWin(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (/^WIN/i.test(ctx.symbolUpper)) {
    return { category: 'equities', tags: ['risk_on'] }
  }
  return null
}

export function matchVolatility(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (
    includesAny(ctx.name, ['volatility', 'volatitity', 'vix', 'ovx', 'gvz', 'vvix', 'move', 'skew']) ||
    ctx.symbolUpper === '.VVIX' ||
    ctx.symbolUpper === '.MOVE' ||
    ctx.symbolUpper === '.SKEWX' ||
    ctx.symbolUpper.startsWith('.VX') ||
    ctx.symbolUpper === '.VIX' ||
    ctx.symbolUpper === '.VIX9D'
  ) {
    return { category: 'volatility', tags: ['risk_off'] }
  }
  return null
}

export function matchEquityIndices(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (
    ctx.symbolUpper === '.SPX' ||
    ctx.symbolUpper === '.SP500' ||
    ctx.symbolUpper === '.NDX' ||
    ctx.symbolUpper === '.IXIC' ||
    ctx.symbolUpper === '.DJI' ||
    ctx.symbolUpper === '.BVSP' ||
    ctx.symbolUpper === '.GDAXI' ||
    ctx.symbolUpper === '.N225' ||
    ctx.symbolUpper === '.FTSE' ||
    includesAny(ctx.name, [
      'S&P 500',
      'Nasdaq 100',
      'Nasdaq Composite',
      'Dow Jones',
      'Ibovespa',
      'Bovespa',
      'DAX',
      'Nikkei 225',
      'FTSE 100',
      'Hang Seng',
      'Russell 2000',
    ])
  ) {
    return { category: 'equities', tags: ['risk_on'] }
  }
  return null
}

export function matchPbr(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (new Set(['PBR', 'PBRA']).has(ctx.symbolUpper)) {
    return { category: 'equities', tags: ['risk_on'] }
  }
  return null
}

export function matchEmergingBroad(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (includesAny(ctx.name, ['emerging', 'msci', 'china', 'korea', 'taiwan', 'south africa', 'mexico', 'brazil', 'india', 'asia'])) {
    return { category: 'emerging', tags: ['risk_on'] }
  }
  return null
}

export function matchDotSymbol(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (ctx.symbolUpper.startsWith('.') && !includesAny(ctx.name, ['volatilidade', 'volatility', 'vix', 'vvix', 'move', 'skew'])) {
    return { category: 'equities', tags: ['risk_on'] }
  }
  return null
}

export function matchEtfs(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (
    new Set([
      'SPY',
      'QQQ',
      'DIA',
      'IWM',
      'EEM',
      'VWO',
      'FXI',
      'EWZ',
      'EWW',
      'INDA',
      'EWY',
      'RSX',
      'XLF',
      'XLK',
      'XLE',
      'XLV',
      'XLY',
      'XLP',
      'XLU',
    ]).has(ctx.symbolUpper.replace(/\.(O|N)$/i, '')) ||
    (includesAny(ctx.name, ['ETF', 'Trust', 'SPDR', 'iShares', 'Invesco', 'Vanguard']) &&
      (ctx.exchangeUpper === 'NYSE' || ctx.exchangeUpper === 'NASDAQ' || ctx.exchangeUpper === 'AMEX'))
  ) {
    return { category: 'equities', tags: ['risk_on'] }
  }
  return null
}

export function matchEquityListing(ctx: RuleContext): { category: string; tags: string[] } | null {
  const looksLikeEquityListing =
    ctx.exchangeUpper &&
    new Set([
      'NYSE',
      'NASDAQ',
      'AMEX',
      'BVMF',
      'BM&F BOVESPA',
      'B3',
      'OTC',
      'ASX',
      'LON',
      'HK',
      'SS',
      'TYO',
      'KRX',
      'SGX',
      'BMV',
      'SIX',
      'BCBA',
    ]).has(ctx.exchangeUpper) &&
    !ctx.symbolUpper.includes('=') &&
    !ctx.symbolUpper.includes('/') &&
    !ctx.symbolUpper.startsWith('.') &&
    !/\bc\d+$/i.test(ctx.symbolUpper) &&
    !includesAny(ctx.name, ['futuro', 'futuros', 'future', 'futures', 'cds'])

  if (looksLikeEquityListing) {
    return { category: 'equities', tags: [] }
  }

  return null
}

