import { computeFlowSentinel } from '../../flow-sentinel.js'
import { fmtLevel } from './data-access.js'
import type { MarketQuotes } from '../../../types.ts'
import type { OptionsSummary } from './signals-types.js'

export function computeFlowSignals(params: {
  quotes: MarketQuotes | null
  options: OptionsSummary | null
  dxyA: string
  vixA: string
}) {
  const { quotes, options, dxyA, vixA } = params

  const oWdo = options && options.ok && options.items ? options.items.WDO : null
  const oWin = options && options.ok && options.items ? options.items.WIN : null

  const g10Sentinel = quotes ? computeFlowSentinel({ assets: quotes.assets, series: quotes.series, generatedAt: quotes.meta.generatedAt }) : null
  const riskBlockScore = g10Sentinel ? g10Sentinel.riskBlock.score : null
  const protBlockScore = g10Sentinel ? g10Sentinel.protectionBlock.score : null
  const deltaAdj = g10Sentinel ? g10Sentinel.composite : null
  const regimeMode = g10Sentinel ? g10Sentinel.regime.mode : ('n/d' as const)
  const regimeLabel = g10Sentinel ? g10Sentinel.regime.label : 'n/d'
  const regimeAction = g10Sentinel ? g10Sentinel.regime.action : 'n/d'
  const thermo10 = g10Sentinel && typeof g10Sentinel.thermo.score10 === 'number' ? g10Sentinel.thermo.score10 : null
  const oilUp = g10Sentinel ? g10Sentinel.oil.score : null
  const oilIntel = g10Sentinel ? g10Sentinel.oil.intel : 'n/d'

  const g10Divergences = (() => {
    if (regimeMode !== 'risk_on' && regimeMode !== 'risk_off') return '—'
    const out: string[] = []
    if (regimeMode === 'risk_on') {
      if (dxyA === '↑') out.push('DXY↑')
      if (vixA === '↑') out.push('VIX↑')
    }
    if (regimeMode === 'risk_off') {
      if (dxyA === '↓') out.push('DXY↓')
      if (vixA === '↓') out.push('VIX↓')
    }
    return out.length ? out.join(' • ') : '—'
  })()

  const riskBlockAction = g10Sentinel ? g10Sentinel.riskBlock.action.label : 'n/d'
  const protBlockAction = g10Sentinel ? g10Sentinel.protectionBlock.action.label : 'n/d'

  const pickWall = (o: typeof oWdo | typeof oWin, side: 'call' | 'put') => {
    const k = o && o.keyLevels ? o.keyLevels : null
    if (!k) return null
    const eff = side === 'call' ? k.effectiveCallWall : k.effectivePutWall
    const raw = side === 'call' ? k.callWall : k.putWall
    if (typeof eff === 'number' && Number.isFinite(eff)) return eff
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw
    return null
  }

  const fmtWalls = (o: typeof oWdo | typeof oWin) => `${fmtLevel(pickWall(o, 'call'))} / ${fmtLevel(pickWall(o, 'put'))}`

  return {
    oWdo,
    oWin,
    g10Sentinel,
    riskBlockScore,
    protBlockScore,
    deltaAdj,
    regimeMode,
    regimeLabel,
    regimeAction,
    thermo10,
    oilUp,
    oilIntel,
    g10Divergences,
    riskBlockAction,
    protBlockAction,
    pickWall,
    fmtWalls,
  }
}

export type FlowSignals = ReturnType<typeof computeFlowSignals>

