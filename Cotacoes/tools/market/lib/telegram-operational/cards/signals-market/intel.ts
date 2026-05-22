import { escapeHtml } from '../../html.js'
import { miniArrow, modeFromCounts, pillFromRiskMode } from '../signals-ui.js'

export function computeRiskRadar(params: {
  vixA: string
  dxyA: string
  us10yA: string
  brRiskA: string
}) {
  const riskRadarRequired = 3
  const riskRadarParts = [
    { label: 'VIX', a: params.vixA },
    { label: 'DXY', a: params.dxyA },
    { label: 'US10Y', a: params.us10yA },
    { label: 'CDS', a: params.brRiskA },
  ]
  const riskRadarOff = riskRadarParts.filter(x => x.a === '↑').length
  const riskRadarOn = riskRadarParts.filter(x => x.a === '↓').length
  const riskRadarMode = modeFromCounts(riskRadarOn, riskRadarOff, riskRadarRequired)
  const riskRadarDetails = riskRadarParts.map(x => miniArrow(x.label, x.a)).join(' <span class="muted">•</span> ')
  const riskRadar = `${pillFromRiskMode(riskRadarMode)} <span class="muted">${escapeHtml(`${riskRadarOff}/${riskRadarParts.length} OFF • ${riskRadarOn}/${riskRadarParts.length} ON • ≥${riskRadarRequired}/${riskRadarParts.length}`)}</span> <span class="muted">•</span> ${riskRadarDetails}`
  return { riskRadar, riskRadarMode }
}

export function computeChinaBrIntel(params: { chinaA50A: string; oreA: string }) {
  const chinaBrMode =
    params.chinaA50A === 'n/d' || params.oreA === 'n/d'
      ? ('n/d' as const)
      : params.chinaA50A === '↓' && params.oreA === '↓'
        ? 'risk_off'
        : params.chinaA50A === '↑' && params.oreA === '↑'
          ? 'risk_on'
          : 'mixed'
  const chinaBrLabel = chinaBrMode === 'risk_off' ? 'PRESSÃO BR' : chinaBrMode === 'risk_on' ? 'SUPORTE BR' : chinaBrMode === 'mixed' ? 'MISTO' : 'n/d'
  const chinaBrIntel =
    chinaBrMode === 'n/d'
      ? `<span class="muted">n/d</span>`
      : `${pillFromRiskMode(chinaBrMode)} <span class="muted">•</span> ${miniArrow('A50', params.chinaA50A)} <span class="muted">•</span> ${miniArrow('Minério', params.oreA)}`
  return { chinaBrIntel, chinaBrMode, chinaBrLabel }
}

export function computeBrCommoditiesIntel(params: { oreA: string; brentA: string; copperA: string; sojaA: string }) {
  const brComRequired = 2
  const brComParts = [
    { label: 'Minério', a: params.oreA },
    { label: 'Brent', a: params.brentA },
    { label: 'Cobre', a: params.copperA },
    { label: 'Soja', a: params.sojaA },
  ].filter(x => x.a !== 'n/d')
  const brComDown = brComParts.filter(x => x.a === '↓').length
  const brComUp = brComParts.filter(x => x.a === '↑').length
  const brCommoditiesMode = !brComParts.length ? ('n/d' as const) : modeFromCounts(brComUp, brComDown, brComRequired)
  const brComLabel =
    brCommoditiesMode === 'risk_off' ? 'PRESSÃO BR' : brCommoditiesMode === 'risk_on' ? 'SUPORTE BR' : brCommoditiesMode === 'mixed' ? 'MISTO' : 'n/d'
  const brCommoditiesIntel =
    brCommoditiesMode === 'n/d'
      ? `<span class="muted">n/d</span>`
      : `${pillFromRiskMode(brCommoditiesMode)} <span class="muted">•</span> <span class="muted">${escapeHtml(`${brComDown}/${brComParts.length} ↓ • ${brComUp}/${brComParts.length} ↑ • ≥${brComRequired}/${brComParts.length}`)}</span> <span class="muted">•</span> ${brComParts.map(x => miniArrow(x.label, x.a)).join(' <span class="muted">•</span> ')}`
  return { brCommoditiesIntel, brCommoditiesMode, brComLabel }
}
