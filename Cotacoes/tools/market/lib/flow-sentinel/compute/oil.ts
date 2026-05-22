import type { FlowSentinelParams } from './params.js'

export function computeOil(params: {
  brent: number | null
  wti: number | null
  usdcad: number | null
  usdrub: number | null
  cfg: FlowSentinelParams
}) {
  const xs = [params.brent, params.wti].filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
  const oilScore = xs.length ? Math.max(...xs) : null

  const oilUpStrong = typeof oilScore === 'number' && Number.isFinite(oilScore) && oilScore >= params.cfg.oilStrongThreshold
  const cadRubConfirm =
    typeof params.usdcad === 'number' &&
    Number.isFinite(params.usdcad) &&
    params.usdcad <= -params.cfg.cadRubConfirmThreshold &&
    typeof params.usdrub === 'number' &&
    Number.isFinite(params.usdrub) &&
    params.usdrub <= -params.cfg.cadRubConfirmThreshold

  const oilAdj = oilUpStrong && cadRubConfirm ? params.cfg.oilAdjReinforce : 0
  const oilIntel =
    oilUpStrong && cadRubConfirm
      ? 'Reforça Bloco Risco (petróleo↑ + CAD/RUB fortes) → tende a VENDA de USD'
      : oilUpStrong && !cadRubConfirm
        ? 'Neutro (petróleo↑ sem confirmação CAD/RUB)'
        : typeof oilScore === 'number' && Number.isFinite(oilScore) && oilScore <= -params.cfg.oilStrongThreshold
          ? 'Neutro (petróleo↓)'
          : 'Neutro'

  return { oilScore, oilUpStrong, cadRubConfirm, oilAdj, oilIntel }
}

