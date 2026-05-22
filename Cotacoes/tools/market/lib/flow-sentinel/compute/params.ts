import { envNumber } from '../config.js'

export type FlowSentinelParams = {
  neutralThreshold: number
  regimeThreshold: number
  oilStrongThreshold: number
  cadRubConfirmThreshold: number
  oilAdjReinforce: number
  strongThreshold: number
  volBothUpReinforce: number
  vhsiWeightDefault: number
  vhsiWeightAsia: number
  asiaFundingJp1yBps: number
  asiaFundingSlopeDropBps: number
  asiaFundingVhsiPct: number
}

export function loadFlowSentinelParams(): FlowSentinelParams {
  const neutralThreshold = envNumber('FLOW_SENTINEL_NEUTRAL_THRESHOLD', 0.12)
  const regimeThreshold = envNumber('FLOW_SENTINEL_REGIME_THRESHOLD', 0.25)
  const oilStrongThreshold = envNumber('FLOW_SENTINEL_OIL_STRONG_THRESHOLD', 0.7)
  const cadRubConfirmThreshold = envNumber('FLOW_SENTINEL_CADRUB_CONFIRM_THRESHOLD', 0.15)
  const oilAdjReinforce = envNumber('FLOW_SENTINEL_OIL_ADJ_REINFORCE', 0.15)
  const strongThreshold = Math.max(0.18, neutralThreshold * 1.5)
  const volBothUpReinforce = envNumber('FLOW_SENTINEL_VOL_BOTH_UP_REINFORCE', 0.2)
  const vhsiWeightDefault = envNumber('FLOW_SENTINEL_VHSI_WEIGHT_DEFAULT', 0.8)
  const vhsiWeightAsia = envNumber('FLOW_SENTINEL_VHSI_WEIGHT_ASIA', 1.0)
  const asiaFundingJp1yBps = envNumber('FLOW_SENTINEL_ASIA_FUNDING_JP1Y_BPS', 6)
  const asiaFundingSlopeDropBps = envNumber('FLOW_SENTINEL_ASIA_FUNDING_SLOPE_DROP_BPS', 4)
  const asiaFundingVhsiPct = envNumber('FLOW_SENTINEL_ASIA_FUNDING_VHSI_PCT', 6)

  return {
    neutralThreshold,
    regimeThreshold,
    oilStrongThreshold,
    cadRubConfirmThreshold,
    oilAdjReinforce,
    strongThreshold,
    volBothUpReinforce,
    vhsiWeightDefault,
    vhsiWeightAsia,
    asiaFundingJp1yBps,
    asiaFundingSlopeDropBps,
    asiaFundingVhsiPct,
  }
}

