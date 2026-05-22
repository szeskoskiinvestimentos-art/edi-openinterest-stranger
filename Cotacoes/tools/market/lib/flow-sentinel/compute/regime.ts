import { clamp } from '../math.js'
import type { FlowSentinelParams } from './params.js'

export function computeRegime(params: {
  riskScore: number | null
  protScore: number | null
  riskObserved: number
  protObserved: number
  riskAction: { state: string }
  protAction: { state: string }
  deltaRaw: number | null
  composite: number | null
  cfg: FlowSentinelParams
}) {
  const riskAbs = typeof params.riskScore === 'number' ? Math.abs(params.riskScore) : 0
  const protAbs = typeof params.protScore === 'number' ? Math.abs(params.protScore) : 0
  const divergenceActive =
    params.riskObserved >= 2 &&
    params.protObserved >= 2 &&
    params.riskAction.state !== 'neutral' &&
    params.protAction.state !== 'neutral' &&
    params.riskAction.state !== params.protAction.state &&
    riskAbs >= params.cfg.strongThreshold &&
    protAbs >= params.cfg.strongThreshold
  const divergenceReason = divergenceActive ? 'blocos_risco_protecao_opostos' : null

  const regimeMode =
    typeof params.composite === 'number'
      ? params.composite > params.cfg.regimeThreshold
        ? ('risk_on' as const)
        : params.composite < -params.cfg.regimeThreshold
          ? ('risk_off' as const)
          : ('mixed' as const)
      : ('n/d' as const)

  const regimeLabel =
    regimeMode === 'risk_on' ? 'Apetite ao Risco' : regimeMode === 'risk_off' ? 'Proteção' : regimeMode === 'mixed' ? 'Neutro' : 'n/d'
  const regimeAction =
    regimeMode === 'risk_on' ? 'Vender USD / Comprar índice' : regimeMode === 'risk_off' ? 'Comprar USD / Vender índice' : 'Aguardar / seletivo'

  const thermo = (() => {
    if (!(typeof params.composite === 'number' && Number.isFinite(params.composite))) {
      return { score10: null, pct: null, label: '—' }
    }
    const score01 = clamp((params.composite + 0.8) / 1.6, 0, 1)
    const score10 = Math.round(score01 * 10)
    const pct = Math.round(score01 * 100)
    const label = score10 >= 7 ? 'Risk-On' : score10 <= 3 ? 'Risk-Off' : 'Neutro'
    return { score10, pct, label }
  })()

  const neutrality = (() => {
    if (divergenceActive) return { isTrueNeutral: false, reason: 'divergencia_entre_blocos' }
    if (!(typeof params.composite === 'number' && Number.isFinite(params.composite))) return { isTrueNeutral: false, reason: 'dados_insuficientes' }
    if (Math.abs(params.composite) >= params.cfg.regimeThreshold) return { isTrueNeutral: false, reason: 'composite_fora_faixa_neutra' }
    const bothNeutralActions = params.riskAction.state === 'neutral' && params.protAction.state === 'neutral'
    const bothWeak = riskAbs < params.cfg.strongThreshold && protAbs < params.cfg.strongThreshold
    if (bothNeutralActions || bothWeak) return { isTrueNeutral: true, reason: 'consenso_fraco_sem_direcionalidade' }
    return { isTrueNeutral: false, reason: 'blocos_ativos_sem_consenso_limpo' }
  })()

  const regimeLabelFinal = regimeMode === 'mixed' && !neutrality.isTrueNeutral ? 'Neutro (divergente)' : regimeLabel

  return {
    riskAbs,
    protAbs,
    divergenceActive,
    divergenceReason,
    regimeMode,
    regimeLabelFinal,
    regimeAction,
    thermo,
    neutrality,
  }
}

