import type { YahooMergeDeps } from '../yahoo-merge-deps.js'

function parseYahooSymbolsSet(parseList: YahooMergeDeps['parseList'], raw: string | undefined) {
  return new Set(parseList(raw).map(x => x.trim().toUpperCase()).filter(Boolean))
}

export function getYahooFuturesRoots(deps: YahooMergeDeps) {
  const cfg = parseYahooSymbolsSet(deps.parseList, deps.env('MARKET_YAHOO_FUTURES_ROOTS'))
  if (cfg.size) return cfg
  return new Set([
    'ES',
    'NQ',
    'YM',
    'RTY',
    'CL',
    'NG',
    'HG',
    'GC',
    'SI',
    'ZC',
    'ZS',
    'ZM',
    'ZL',
    'ZW',
    'KE',
    'KC',
    'CT',
    'CC',
    'SB',
    'OJ',
    'LE',
    'HE',
    'PA',
    'PL',
    'RB',
    'HO',
    'BZ',
    'LCO',
    'ZQ',
  ])
}
