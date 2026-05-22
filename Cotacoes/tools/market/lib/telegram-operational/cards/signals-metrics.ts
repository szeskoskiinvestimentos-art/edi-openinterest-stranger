import { escapeHtml, lineRow, valueArrow } from '../html.js'
import { fmtPct } from '../format.js'
import { intelPill } from './signals-ui.js'
import type { CardsMarketAccess } from './signals-types.js'
import type { EmSignals } from './signals-em.js'
import type { FlowSignals } from './signals-flow.js'
import type { MarketSignals } from './signals-market.js'
import type { MercosulSignals } from './signals-mercosul.js'

export function buildSignalMetrics(params: {
  access: CardsMarketAccess
  market: MarketSignals
  em: EmSignals
  mercosul: MercosulSignals
  flow: FlowSignals
  macro: { macroSignals: Array<{ k: string; mode: 'risk_on' | 'risk_off' | 'mixed' }>; macroRiskMode: string; macroRisk: string }
}) {
  const lastOf = params.access.lastOf

  const usdmxn = lastOf(['USD/MXN - US Dollar Mexican Peso', 'USD/MXN', 'USDMXN'])
  const usdzar = lastOf(['USD/ZAR - US Dollar South African Rand', 'USD/ZAR', 'USDZAR'])
  const usdclp = lastOf(['USD/CLP - US Dollar Chilean Peso', 'USD/CLP', 'USDCLP'])
  const usdtry = lastOf(['USD/TRY - US Dollar Turkish Lira', 'USD/TRY', 'USDTRY'])
  const emPairs = [
    { label: 'USD/MXN', ...usdmxn },
    { label: 'USD/ZAR', ...usdzar },
    { label: 'USD/CLP', ...usdclp },
    { label: 'USD/TRY', ...usdtry },
  ]
  const emPairsHtml = `<table>${emPairs.map(x => lineRow(x.label, valueArrow(x.a, fmtPct(typeof x.pct === 'number' ? x.pct : null)))).join('')}</table>`

  const metricCard = (icon: string, valueHtml: string, label: string, changeHtml: string) =>
    `<div class="mcard">
      <div class="micon">${escapeHtml(icon)}</div>
      <div class="mval">${valueHtml}</div>
      <div class="mlabel">${escapeHtml(label)}</div>
      <div class="mchg">${changeHtml}</div>
    </div>`

  const thermo10 = params.flow.thermo10

  const g10MetricsRow = `<div class="mgrid">
    ${metricCard('💠', escapeHtml(fmtPct(params.flow.riskBlockScore)), 'FX Bloco A', `<span class="muted">${escapeHtml(params.flow.riskBlockAction)}</span>`)}
    ${metricCard('🛡️', escapeHtml(fmtPct(params.flow.protBlockScore)), 'FX Bloco B', `<span class="muted">${escapeHtml(params.flow.protBlockAction)}</span>`)}
    ${metricCard('🛢️', escapeHtml(fmtPct(params.flow.oilUp)), 'Petróleo (Brent/WTI)', `<span class="muted">${escapeHtml(params.flow.oilIntel)}</span>`)}
    ${metricCard('🧭', escapeHtml(params.flow.regimeLabel), 'Regime', `<span class="muted">Δ ${escapeHtml(fmtPct(params.flow.deltaAdj))}</span>`)}
    ${metricCard('⏱️', escapeHtml(typeof thermo10 === 'number' ? `${thermo10}/10` : 'n/d'), 'Termômetro', `<span class="muted">${escapeHtml(params.flow.regimeAction)}</span>`)}
  </div>`

  const emMetricsRow = `<div class="mgrid">
    ${metricCard('🌍', escapeHtml(params.em.emScore), 'EM Pulse', `${params.em.emPill} <span class="muted">${escapeHtml(params.em.emThresholdLabel)}</span>`)}
    ${metricCard('🇧🇷', escapeHtml(fmtPct(typeof params.mercosul.mercosulPulse.score === 'number' ? params.mercosul.mercosulPulse.score : null)), 'Mercosul', `${intelPill(params.mercosul.mercosulPulse.mode, params.mercosul.mercosulPulse.state)}`)}
    ${metricCard('💵', `${valueArrow(params.market.dxyMove.a, params.market.dxyMove.pct)}`, 'DXY', `<span class="muted">contexto USD</span>`)}
    ${metricCard('🧨', `${valueArrow(params.market.vixMove.a, params.market.vixMove.pct)}`, 'VIX', `<span class="muted">contexto vol</span>`)}
    ${metricCard('🛰️', escapeHtml(params.macro.macroSignals.length ? params.macro.macroRiskMode.toUpperCase().replace('_', '-') : 'N/D'), 'Macro', `${params.macro.macroRisk}`)}
  </div>`

  return { emPairsHtml, g10MetricsRow, emMetricsRow }
}
