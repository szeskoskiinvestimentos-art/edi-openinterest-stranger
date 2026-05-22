import type { FlowSentinelParams } from './params.js'
import type { FlowSentinelValues } from './values.js'

export function computeAlerts(params: {
  deltaRaw: number | null
  riskAbs: number
  protAbs: number
  divergenceActive: boolean
  regimeMode: 'risk_on' | 'risk_off' | 'mixed' | 'n/d'
  neutrality: { isTrueNeutral: boolean; reason: string }
  oilUpStrong: boolean
  cadRubConfirm: boolean
  values: FlowSentinelValues
  cfg: FlowSentinelParams
}) {
  const out: string[] = []
  if (params.divergenceActive) {
    out.push('Divergência: blocos Risco e Proteção estão puxando para lados opostos.')
  }
  if (
    typeof params.deltaRaw === 'number' &&
    Number.isFinite(params.deltaRaw) &&
    Math.abs(params.deltaRaw) < params.cfg.neutralThreshold &&
    params.riskAbs >= params.cfg.strongThreshold &&
    params.protAbs >= params.cfg.strongThreshold
  ) {
    out.push('Sem consenso: delta neutro com blocos “fortes” (ruído/abertura).')
  }
  if (params.regimeMode === 'mixed' && !params.neutrality.isTrueNeutral) {
    out.push(`Neutro com ressalva: ${params.neutrality.reason}.`)
  }
  if (params.oilUpStrong && !params.cadRubConfirm) {
    out.push('Petróleo forte sem confirmação (CAD/RUB): efeito tende a ficar neutro.')
  }

  const jp1yDeltaBps =
    typeof params.values.jp1yDelta === 'number' && Number.isFinite(params.values.jp1yDelta) ? params.values.jp1yDelta * 100 : null
  const jp10yDeltaBps =
    typeof params.values.jp10yDelta === 'number' && Number.isFinite(params.values.jp10yDelta) ? params.values.jp10yDelta * 100 : null
  const slopeDeltaBps = typeof jp10yDeltaBps === 'number' && typeof jp1yDeltaBps === 'number' ? jp10yDeltaBps - jp1yDeltaBps : null

  const slope1_10_bps =
    typeof params.values.jp10yLevel === 'number' &&
    Number.isFinite(params.values.jp10yLevel) &&
    typeof params.values.jp1yLevel === 'number' &&
    Number.isFinite(params.values.jp1yLevel)
      ? (params.values.jp10yLevel - params.values.jp1yLevel) * 100
      : null

  const fundingAsia =
    typeof jp1yDeltaBps === 'number' &&
    Number.isFinite(jp1yDeltaBps) &&
    jp1yDeltaBps >= params.cfg.asiaFundingJp1yBps &&
    typeof slopeDeltaBps === 'number' &&
    Number.isFinite(slopeDeltaBps) &&
    slopeDeltaBps <= -params.cfg.asiaFundingSlopeDropBps

  if (fundingAsia) {
    const reinforce =
      typeof params.values.vhsi === 'number' && Number.isFinite(params.values.vhsi) && params.values.vhsi >= params.cfg.asiaFundingVhsiPct
        ? ' (+ VHSI↑)'
        : ''
    out.push(`Funding Ásia: JP1Y ↑ forte e inclinação 1–10 ↓${reinforce}`)
  }
  if (typeof slope1_10_bps === 'number' && Number.isFinite(slope1_10_bps) && slope1_10_bps < 0) {
    out.push('Curva Japão invertida (1–10 < 0bp)')
  }

  return out
}

