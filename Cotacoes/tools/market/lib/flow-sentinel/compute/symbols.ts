import type { Asset, MarketPoint } from '../../../types.js'
import { resolveSeriesKeyByAssetMatcher } from '../series.js'

export type FlowSentinelSymbols = {
  sAudusd: string | null
  sNzdusd: string | null
  sUsdcad: string | null
  sUsdrub: string | null
  sUsdjpy: string | null
  sUsdchf: string | null
  sUsdsek: string | null
  sUsdcnh: string | null
  sUsdcny: string | null
  sUsdmxn: string | null
  sUsdzar: string | null
  sUsdclp: string | null
  sUsdtry: string | null
  sDxy: string | null
  sBrent: string | null
  sWti: string | null
  sVix: string | null
  sVhsi: string | null
  sJp1y: string | null
  sJp10y: string | null
  sSpx: string | null
  sNdx: string | null
  sHyg: string | null
  sEem: string | null
  sCopper: string | null
  sBtc: string | null
}

export function resolveFlowSentinelSymbols(assets: Asset[], series: Record<string, MarketPoint[]>): FlowSentinelSymbols {
  const sym = (re: RegExp) => resolveSeriesKeyByAssetMatcher(assets, series, re)

  const sAudusd = sym(/^AUD\/USD\b/i)
  const sNzdusd = sym(/^NZD\/USD\b/i)
  const sUsdcad = sym(/^USD\/CAD\b/i)
  const sUsdrub = sym(/^USD\/RUB\b/i)
  const sUsdjpy = sym(/^USD\/JPY\b/i)
  const sUsdchf = sym(/^USD\/CHF\b/i)
  const sUsdsek = sym(/^USD\/SEK\b/i)
  const sUsdcnh = sym(/^USD\/CNH\b/i)
  const sUsdcny = sym(/^USD\/CNY\b/i)
  const sUsdmxn = sym(/^USD\/MXN\b/i)
  const sUsdzar = sym(/^USD\/ZAR\b/i)
  const sUsdclp = sym(/^USD\/CLP\b/i)
  const sUsdtry = sym(/^USD\/TRY\b/i)
  const sDxy = sym(/(^\.DXY$|\bDXY\b|US Dollar Index)/i)
  const sBrent = sym(/\bBrent\b/i)
  const sWti = sym(/\bWTI\b/i)
  const sVix = sym(/(^\.(VIX|VIX9D)$|\bVIX\b|CBOE Volatility Index)/i)
  const sVhsi = sym(/(^VHSI(c\d+)?$|\bHSI Volatility\b|\bHang Seng Volatility\b)/i)
  const sJp1y = sym(/^JP1YT=(RR|XX)$/i)
  const sJp10y = sym(/^JP10YT=RR$/i)
  const sSpx = sym(
    /(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i,
  )
  const sNdx = sym(
    /(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i,
  )
  const sHyg = sym(/(^HYG(\b|$)|\bHigh\s*Yield\b|\bHigh-Yield\b)/i)
  const sEem = sym(/(^EEM(\b|$)|^VWO(\b|$)|Emerging\s*Markets)/i)
  const sCopper = sym(/(^HG(\b|$)|^HGc\d(\b|=\$)?|Copper|\bCobre\b|^CPER(\b|$))/i)
  const sBtc = sym(/(^BTC\/USD$|^BTCUSD$|BTC\/USD|XBT|bitcoin)/i)

  return {
    sAudusd,
    sNzdusd,
    sUsdcad,
    sUsdrub,
    sUsdjpy,
    sUsdchf,
    sUsdsek,
    sUsdcnh,
    sUsdcny,
    sUsdmxn,
    sUsdzar,
    sUsdclp,
    sUsdtry,
    sDxy,
    sBrent,
    sWti,
    sVix,
    sVhsi,
    sJp1y,
    sJp10y,
    sSpx,
    sNdx,
    sHyg,
    sEem,
    sCopper,
    sBtc,
  }
}

