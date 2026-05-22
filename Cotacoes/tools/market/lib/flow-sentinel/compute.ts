import type { Asset, FlowSentinelSnapshot, MarketPoint } from '../../types.js'
import { sessionFromUtcHour, utcHourOf } from './config.js'
import { classifyProtectionBlockAction, classifyRiskBlockAction } from './scoring.js'
import { computeAlerts } from './compute/alerts.js'
import { computeBlocks } from './compute/blocks.js'
import { computeOil } from './compute/oil.js'
import { loadFlowSentinelParams } from './compute/params.js'
import { computeRegime } from './compute/regime.js'
import { resolveFlowSentinelSymbols } from './compute/symbols.js'
import { computeFlowSentinelValues } from './compute/values.js'

export function computeFlowSentinel(input: {
  assets: Asset[]
  series: Record<string, MarketPoint[]>
  generatedAt?: string
}): FlowSentinelSnapshot {
  const cfg = loadFlowSentinelParams()
  const assets = Array.isArray(input.assets) ? input.assets : []
  const series = input.series || {}

  const session = sessionFromUtcHour(utcHourOf(input.generatedAt))
  const syms = resolveFlowSentinelSymbols(assets, series)
  const values = computeFlowSentinelValues(series, syms)

  const { riskItems, protItems, riskScore, protScore } = computeBlocks({ syms, values, session, cfg })

  const deltaRaw =
    typeof riskScore === 'number' && typeof protScore === 'number'
      ? riskScore - protScore
      : typeof riskScore === 'number'
        ? riskScore
        : typeof protScore === 'number'
          ? -protScore
          : null

  const oil = computeOil({ brent: values.brent, wti: values.wti, usdcad: values.usdcad, usdrub: values.usdrub, cfg })
  const composite = typeof deltaRaw === 'number' && Number.isFinite(deltaRaw) ? deltaRaw + oil.oilAdj : null

  const riskAction = classifyRiskBlockAction(riskScore, cfg.neutralThreshold)
  const protAction = classifyProtectionBlockAction(protScore, cfg.neutralThreshold)
  const riskObserved = riskItems.filter(x => x.val !== null).length
  const protObserved = protItems.filter(x => x.val !== null).length

  const reg = computeRegime({
    riskScore,
    protScore,
    riskObserved,
    protObserved,
    riskAction,
    protAction,
    deltaRaw,
    composite,
    cfg,
  })

  const alerts = computeAlerts({
    deltaRaw,
    riskAbs: reg.riskAbs,
    protAbs: reg.protAbs,
    divergenceActive: reg.divergenceActive,
    regimeMode: reg.regimeMode,
    neutrality: reg.neutrality,
    oilUpStrong: oil.oilUpStrong,
    cadRubConfirm: oil.cadRubConfirm,
    values,
    cfg,
  })

  return {
    generatedAt: input.generatedAt,
    neutralThreshold: cfg.neutralThreshold,
    regimeThreshold: cfg.regimeThreshold,
    oilStrongThreshold: cfg.oilStrongThreshold,
    cadRubConfirmThreshold: cfg.cadRubConfirmThreshold,
    oilAdjReinforce: cfg.oilAdjReinforce,
    strongThreshold: cfg.strongThreshold,
    riskBlock: {
      score: riskScore,
      action: riskAction,
      observed: riskObserved,
      items: riskItems,
    },
    protectionBlock: {
      score: protScore,
      action: protAction,
      observed: protObserved,
      items: protItems,
    },
    oil: {
      score: oil.oilScore,
      brentPct: values.brent,
      wtiPct: values.wti,
      intel: oil.oilIntel,
      adj: oil.oilAdj,
      upStrong: oil.oilUpStrong,
      cadRubConfirm: oil.cadRubConfirm,
    },
    delta: deltaRaw,
    composite,
    divergence: {
      active: reg.divergenceActive,
      reason: reg.divergenceReason,
    },
    neutrality: reg.neutrality,
    regime: {
      mode: reg.regimeMode,
      label: reg.regimeLabelFinal,
      action: reg.regimeAction,
    },
    thermo: reg.thermo,
    alerts,
  }
}
