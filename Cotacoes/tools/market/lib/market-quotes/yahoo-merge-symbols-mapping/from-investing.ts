import { FIAT_CODES, METALS_CODES } from '../yahoo-merge-symbols-heuristics/codes.js'
import { normalizeInvestingYahooCandidate } from '../yahoo-merge-symbols-config.js'
import { isLikelyUnsupportedYahooSymbol } from './unsupported.js'

const DIRECT_MAP: Record<string, string> = {
  '.BVSP': '^BVSP',
  '.CSI300': '000300.SS',
  '.DJI': '^DJI',
  '.DXY': 'DX-Y.NYB',
  '.GVZ': '^GVZ',
  '.MXX': '^MXX',
  '.NDX': '^NDX',
  '.OVX': '^OVX',
  '.SKEWX': '^SKEW',
  '.SSEC': '000001.SS',
  '.TNX': '^TNX',
  '.TYVIX': '^TYVIX',
  '.VIX9D': '^VIX9D',
  '.VXN': '^VXN',
  '.VVIX': '^VVIX',
  USDIDX: 'DX-Y.NYB',
  USDX: 'DX-Y.NYB',
  VIX: '^VIX',
  LCO: 'BZ=F',
}

const FUTURES_MONTH_ROOTS = new Set([
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
  'ZQ',
])

export function yahooSymbolFromInvestingSymbol(investingSymbol: string, overrides: Map<string, string>) {
  const sym = normalizeInvestingYahooCandidate(investingSymbol)
  if (!sym) return null
  const overr = overrides.get(sym)
  if (overr) {
    const cand = normalizeInvestingYahooCandidate(overr)
    if (cand && isLikelyUnsupportedYahooSymbol(cand)) return null
    return overr
  }
  const overrRaw = overrides.get(String(investingSymbol || '').trim())
  if (overrRaw) {
    const cand = normalizeInvestingYahooCandidate(overrRaw)
    if (cand && isLikelyUnsupportedYahooSymbol(cand)) return null
    return overrRaw
  }

  if (DIRECT_MAP[sym]) return DIRECT_MAP[sym]

  const pairUsd = sym.match(/^([A-Z0-9]{2,10})\/(USD|USDT)$/)
  if (pairUsd) {
    const base = pairUsd[1].toUpperCase()
    const quote = pairUsd[2].toUpperCase()
    if (FIAT_CODES.has(base) || METALS_CODES.has(base)) return `${base}${quote}=X`
    return `${base}-${quote}`
  }

  const cryptoPair = sym.match(/^([A-Z0-9]{2,10})\/(BTC|ETH)$/i)
  if (cryptoPair) return `${cryptoPair[1]}-${cryptoPair[2].toUpperCase()}`

  const fx = sym.match(/^([A-Z]{3})\/([A-Z]{3})$/)
  if (fx) return `${fx[1]}${fx[2]}=X`

  const ff = sym.match(/^FFc\d+$/i)
  if (ff) return 'ZQ=F'

  const usListed = sym.match(/^([A-Z0-9_]+)\.(O|K|PK)$/i)
  if (usListed) return usListed[1]

  const futuresMonth = sym.match(/^([A-Z]{1,3})([FGHJKMNQUVXZ])\d{2}$/)
  if (futuresMonth) {
    const root = futuresMonth[1]
    if (FUTURES_MONTH_ROOTS.has(root)) return sym
  }

  if (isLikelyUnsupportedYahooSymbol(sym)) return null

  return sym
}
