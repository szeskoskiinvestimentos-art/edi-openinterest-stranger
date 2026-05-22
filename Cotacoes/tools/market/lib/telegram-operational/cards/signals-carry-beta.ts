import { escapeHtml } from '../html.js'
import { clamp } from './data-access.js'
import { miniArrow, pillFromRiskMode } from './signals-ui.js'
import type { CardsMarketAccess } from './signals-types.js'

export function computeCarryBetaSignals(params: { access: CardsMarketAccess }) {
  const lastOf = params.access.lastOf

  const audusd = lastOf(['AUD/USD - Australian Dollar US Dollar', 'AUD/USD', 'AUDUSD'])
  const nzdusd = lastOf(['NZD/USD - New Zealand Dollar US Dollar', 'NZD/USD', 'NZDUSD'])
  const usdjpy = lastOf(['USD/JPY - US Dollar Japanese Yen', 'USD/JPY', 'USDJPY'])
  const usdchf = lastOf(['USD/CHF - US Dollar Swiss Franc', 'USD/CHF', 'USDCHF'])
  const usdsek = lastOf(['USD/SEK - US Dollar Swedish Krona', 'USD/SEK', 'USDSEK'])
  const usdcad = lastOf(['USD/CAD - US Dollar Canadian Dollar', 'USD/CAD', 'USDCAD'])
  const usdrub = lastOf(['USD/RUB - US Dollar Russian Ruble', 'USD/RUB', 'USDRUB'])
  const usdbrl = lastOf(['USD/BRL - US Dollar Brazil Real', 'USD/BRL', 'USDBRL', 'WDOc1', 'WDO'])
  const dxy = lastOf(['.DXY', 'DXY'])

  const norm = (v: number, unit: number) =>
    Number.isFinite(v) && Number.isFinite(unit) && unit > 0 ? clamp(v / unit, -2, 2) : 0

  const audjpyPct =
    typeof audusd.pct === 'number' && typeof usdjpy.pct === 'number'
      ? clamp(((1 + audusd.pct / 100) * (1 + usdjpy.pct / 100) - 1) * 100, -99, 99)
      : null

  let carryStatus = 'Neutro'
  if (typeof audusd.pct !== 'number' || typeof usdjpy.pct !== 'number') {
    carryStatus = 'Dados insuficientes'
  } else if (typeof audjpyPct === 'number') {
    const severe = usdjpy.pct <= -0.8 && audusd.pct <= -0.6
    if (audjpyPct <= -1.0 && severe) carryStatus = 'Unwinding (severo)'
    else if (audjpyPct <= -1.0) carryStatus = 'Unwinding'
    else if (audjpyPct >= 1.0) carryStatus = 'Building'
  }

  const carryMode =
    carryStatus.startsWith('Building')
      ? ('risk_on' as const)
      : carryStatus.startsWith('Unwinding')
        ? ('risk_off' as const)
        : ('mixed' as const)

  const carryScoreRaw = 5 + 1.8 * norm(audjpyPct || 0, 1.0) + 1.0 * norm(-(dxy.pct || 0), 0.7) + 1.2 * norm(-(usdbrl.pct || 0), 0.7)
  const carryScore10 = clamp(Math.round(carryScoreRaw), 0, 10)
  const carryLine = `${pillFromRiskMode(carryMode)} <span class="muted">${escapeHtml(`score ${carryScore10}/10 • ${carryStatus}`)}</span>`

  const betaRiskParts = [
    { vote: audusd.a === '↑' ? 'on' : audusd.a === '↓' ? 'off' : 'n/d', show: miniArrow('AUD/USD', audusd.a) },
    { vote: nzdusd.a === '↑' ? 'on' : nzdusd.a === '↓' ? 'off' : 'n/d', show: miniArrow('NZD/USD', nzdusd.a) },
    { vote: usdcad.a === '↓' ? 'on' : usdcad.a === '↑' ? 'off' : 'n/d', show: miniArrow('USD/CAD', usdcad.a) },
    { vote: usdrub.a === '↓' ? 'on' : usdrub.a === '↑' ? 'off' : 'n/d', show: miniArrow('USD/RUB', usdrub.a) },
  ]

  const betaSafeParts = [
    { vote: usdjpy.a === '↓' ? 'off' : usdjpy.a === '↑' ? 'on' : 'n/d', show: miniArrow('USD/JPY', usdjpy.a) },
    { vote: usdchf.a === '↓' ? 'off' : usdchf.a === '↑' ? 'on' : 'n/d', show: miniArrow('USD/CHF', usdchf.a) },
    { vote: usdsek.a === '↓' ? 'off' : usdsek.a === '↑' ? 'on' : 'n/d', show: miniArrow('USD/SEK', usdsek.a) },
    { vote: dxy.a === '↑' ? 'off' : dxy.a === '↓' ? 'on' : 'n/d', show: miniArrow('DXY', dxy.a) },
  ]

  const betaRiskOn = betaRiskParts.filter(x => x.vote === 'on').length
  const betaSafeOff = betaSafeParts.filter(x => x.vote === 'off').length
  const betaRequired = 3
  const betaMode =
    betaRiskOn >= betaRequired && betaSafeOff <= 1
      ? ('risk_on' as const)
      : betaSafeOff >= betaRequired && betaRiskOn <= 1
        ? ('risk_off' as const)
        : ('mixed' as const)

  const betaLine = `${pillFromRiskMode(betaMode)} <span class="muted">${escapeHtml(`A ${betaRiskOn}/${betaRiskParts.length} (≥${betaRequired}) • B ${betaSafeOff}/${betaSafeParts.length} (≥${betaRequired})`)}</span>`

  return { carryLine, betaLine }
}

export type CarryBetaSignals = ReturnType<typeof computeCarryBetaSignals>
