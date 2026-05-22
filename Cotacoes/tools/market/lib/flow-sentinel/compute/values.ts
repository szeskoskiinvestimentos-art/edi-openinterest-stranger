import type { MarketPoint } from '../../../types.js'
import { latestDelta, latestLevel, latestPct } from '../series.js'
import type { FlowSentinelSymbols } from './symbols.js'

export type FlowSentinelValues = {
  audusd: number | null
  nzdusd: number | null
  usdcad: number | null
  usdrub: number | null
  usdjpy: number | null
  usdchf: number | null
  usdsek: number | null
  usdcnh: number | null
  usdmxn: number | null
  usdzar: number | null
  usdclp: number | null
  usdtry: number | null
  dxy: number | null
  brent: number | null
  wti: number | null
  vix: number | null
  vhsi: number | null
  spx: number | null
  ndx: number | null
  hyg: number | null
  eem: number | null
  copper: number | null
  btc: number | null

  jp1yDelta: number | null
  jp10yDelta: number | null
  jp1yLevel: number | null
  jp10yLevel: number | null
}

export function computeFlowSentinelValues(series: Record<string, MarketPoint[]>, syms: FlowSentinelSymbols): FlowSentinelValues {
  const pctOf = (symbol: string | null) => (symbol ? latestPct(series[symbol]) : null)
  const deltaOf = (symbol: string | null) => (symbol ? latestDelta(series[symbol]) : null)
  const levelOf = (symbol: string | null) => (symbol ? latestLevel(series[symbol]) : null)

  const audusd = pctOf(syms.sAudusd)
  const nzdusd = pctOf(syms.sNzdusd)
  const usdcad = pctOf(syms.sUsdcad)
  const usdrub = pctOf(syms.sUsdrub)
  const usdjpy = pctOf(syms.sUsdjpy)
  const usdchf = pctOf(syms.sUsdchf)
  const usdsek = pctOf(syms.sUsdsek)
  const usdcnh = pctOf(syms.sUsdcnh || syms.sUsdcny)
  const usdmxn = pctOf(syms.sUsdmxn)
  const usdzar = pctOf(syms.sUsdzar)
  const usdclp = pctOf(syms.sUsdclp)
  const usdtry = pctOf(syms.sUsdtry)
  const dxy = pctOf(syms.sDxy)
  const brent = pctOf(syms.sBrent)
  const wti = pctOf(syms.sWti)
  const vix = pctOf(syms.sVix)
  const vhsi = pctOf(syms.sVhsi)
  const spx = pctOf(syms.sSpx)
  const ndx = pctOf(syms.sNdx)
  const hyg = pctOf(syms.sHyg)
  const eem = pctOf(syms.sEem)
  const copper = pctOf(syms.sCopper)
  const btc = pctOf(syms.sBtc)

  const jp1yDelta = deltaOf(syms.sJp1y)
  const jp10yDelta = deltaOf(syms.sJp10y)
  const jp1yLevel = levelOf(syms.sJp1y)
  const jp10yLevel = levelOf(syms.sJp10y)

  return {
    audusd,
    nzdusd,
    usdcad,
    usdrub,
    usdjpy,
    usdchf,
    usdsek,
    usdcnh,
    usdmxn,
    usdzar,
    usdclp,
    usdtry,
    dxy,
    brent,
    wti,
    vix,
    vhsi,
    spx,
    ndx,
    hyg,
    eem,
    copper,
    btc,
    jp1yDelta,
    jp10yDelta,
    jp1yLevel,
    jp10yLevel,
  }
}

