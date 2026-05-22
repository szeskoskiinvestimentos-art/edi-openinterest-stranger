import { escapeHtml } from '../html.js'
import { buildSignalMetrics } from './signals-metrics.js'
import { computeCarryBetaSignals } from './signals-carry-beta.js'
import { computeEmSignals } from './signals-em.js'
import { computeFlowSignals } from './signals-flow.js'
import { computeMarketSignals } from './signals-market.js'
import { computeMercosulSignals } from './signals-mercosul.js'
import { intelPill, pillFromRiskMode } from './signals-ui.js'
import type { OperationalSignalsInput } from './signals-types.js'

export function computeOperationalTelegramSignals(params: OperationalSignalsInput) {
  const market = computeMarketSignals(params)
  const mercosul = computeMercosulSignals({ quotes: params.quotes, access: params.access })
  const em = computeEmSignals({
    quotes: params.quotes,
    wdo30_90: market.wdo30_90,
    dxyA: market.dxyMove.a,
    vixA: market.vixMove.a,
  })
  const carryBeta = computeCarryBetaSignals({ access: params.access })
  const flow = computeFlowSignals({ quotes: params.quotes, options: params.options, dxyA: market.dxyMove.a, vixA: market.vixMove.a })

  const macroSignals = [
    { k: 'FX', mode: em.emMode },
    { k: 'Radar', mode: market.riskRadarMode },
    { k: 'China', mode: market.chinaBrMode },
    { k: 'Commod', mode: market.brCommoditiesMode },
  ].filter(x => x.mode !== 'n/d') as Array<{ k: string; mode: 'risk_on' | 'risk_off' | 'mixed' }>
  const macroOn = macroSignals.filter(x => x.mode === 'risk_on').length
  const macroOff = macroSignals.filter(x => x.mode === 'risk_off').length
  const macroRiskMode =
    !macroSignals.length ? ('n/d' as const) : macroOn >= 2 && macroOn >= macroOff + 1 ? 'risk_on' : macroOff >= 2 && macroOff >= macroOn + 1 ? 'risk_off' : 'mixed'

  const radarLabel = market.riskRadarMode === 'risk_on' ? 'RISK-ON' : market.riskRadarMode === 'risk_off' ? 'RISK-OFF' : 'MISTO'
  const macroRiskComputed =
    macroRiskMode === 'n/d'
      ? `<span class="muted">n/d</span>`
      : `${pillFromRiskMode(macroRiskMode)} <span class="muted">${escapeHtml(`FX:${em.emPillLabel} • Radar:${radarLabel} • China:${market.chinaBrLabel} • Com:${market.brComLabel}`)}</span>`
  const macroRisk =
    market.macroQualityIssues.length ? `${intelPill('mid', 'INCOMPLETO')} <span class="muted">${escapeHtml(market.macroQualityIssues.join(' • '))}</span>` : macroRiskComputed

  const metrics = buildSignalMetrics({
    access: params.access,
    market,
    em,
    mercosul,
    flow,
    macro: { macroSignals, macroRiskMode, macroRisk },
  })

  return {
    ...market,
    ...mercosul,
    ...em,
    ...carryBeta,
    ...flow,
    ...metrics,
    macroSignals,
    macroRiskMode,
    macroRisk,
  }
}

export type OperationalTelegramSignals = ReturnType<typeof computeOperationalTelegramSignals>
