import { weightedAvg } from '../math.js'
import { item } from '../scoring.js'
import { sessionFromUtcHour } from '../config.js'
import type { FlowSentinelParams } from './params.js'
import type { FlowSentinelSymbols } from './symbols.js'
import type { FlowSentinelValues } from './values.js'

export function computeBlocks(params: {
  syms: FlowSentinelSymbols
  values: FlowSentinelValues
  session: ReturnType<typeof sessionFromUtcHour>
  cfg: FlowSentinelParams
}) {
  const { syms, values, session, cfg } = params

  const riskItems = [
    item('AUD/USD', syms.sAudusd, values.audusd, 1),
    item('NZD/USD', syms.sNzdusd, values.nzdusd, 1),
    item('USD/CAD', syms.sUsdcad, values.usdcad, -1),
    item('USD/RUB', syms.sUsdrub, values.usdrub, -1),
    item('SPX', syms.sSpx, values.spx, 1),
    item('NDX', syms.sNdx, values.ndx, 1),
    item('HYG', syms.sHyg, values.hyg, 1),
    item('EEM/VWO', syms.sEem, values.eem, 1),
    item('Cobre', syms.sCopper, values.copper, 1),
    item('BTC', syms.sBtc, values.btc, 1),
  ]
  const protItems = [
    item('USD/JPY', syms.sUsdjpy, values.usdjpy, -1),
    item('USD/CHF', syms.sUsdchf, values.usdchf, -1),
    item('USD/SEK', syms.sUsdsek, values.usdsek, -1),
    item('USD/CNH', syms.sUsdcnh || syms.sUsdcny, values.usdcnh, 1),
    item('USD/MXN', syms.sUsdmxn, values.usdmxn, 1),
    item('USD/ZAR', syms.sUsdzar, values.usdzar, 1),
    item('USD/CLP', syms.sUsdclp, values.usdclp, 1),
    item('USD/TRY', syms.sUsdtry, values.usdtry, 1),
    item('DXY', syms.sDxy, values.dxy, 1),
    item('VIX', syms.sVix, values.vix, 1),
    item('VHSI', syms.sVhsi, values.vhsi, 1),
  ]

  const riskScore = weightedAvg([
    { v: riskItems[0].val, w: 1.0 },
    { v: riskItems[1].val, w: 1.0 },
    { v: riskItems[2].val, w: 1.0 },
    { v: riskItems[3].val, w: 1.0 },
    { v: riskItems[4].val, w: 0.55 },
    { v: riskItems[5].val, w: 0.55 },
    { v: riskItems[6].val, w: 0.45 },
    { v: riskItems[7].val, w: 0.35 },
    { v: riskItems[8].val, w: 0.25 },
    { v: riskItems[9].val, w: 0.2 },
  ])

  const protScore = (() => {
    const vhsiWeight = session === 'asia' ? cfg.vhsiWeightAsia : cfg.vhsiWeightDefault
    const base = weightedAvg([
      { v: protItems[0].val, w: 0.9 },
      { v: protItems[1].val, w: 0.9 },
      { v: protItems[2].val, w: 0.9 },
      { v: protItems[3].val, w: 0.5 },
      { v: protItems[4].val, w: 0.35 },
      { v: protItems[5].val, w: 0.35 },
      { v: protItems[6].val, w: 0.25 },
      { v: protItems[7].val, w: 0.25 },
      { v: protItems[8].val, w: 1.0 },
      { v: protItems[9].val, w: 1.0 },
      { v: protItems[10].val, w: vhsiWeight },
    ])
    if (!(typeof base === 'number' && Number.isFinite(base))) return null
    let score = base
    const vixUp = typeof values.vix === 'number' && Number.isFinite(values.vix) && values.vix >= 1.5
    const vhsiUp = typeof values.vhsi === 'number' && Number.isFinite(values.vhsi) && values.vhsi >= 1.5
    if (vixUp && vhsiUp) score += cfg.volBothUpReinforce
    return score
  })()

  return { riskItems, protItems, riskScore, protScore }
}
