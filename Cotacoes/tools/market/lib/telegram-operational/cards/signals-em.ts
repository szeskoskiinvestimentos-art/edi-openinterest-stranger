import { escapeHtml } from '../html.js'
import { arrowFromPct, fmtPct } from '../format.js'
import { computeEmPulse } from '../series.js'
import type { MarketQuotes } from '../../../types.ts'

export function computeEmSignals(params: {
  quotes: MarketQuotes | null
  wdo30_90: number | null
  dxyA: string
  vixA: string
}) {
  const { quotes, wdo30_90, dxyA, vixA } = params

  const emPulse = quotes ? computeEmPulse(quotes) : { state: 'n/d', score: null }
  const emNeutral = 0.12
  const emMode =
    typeof emPulse.score === 'number' && Number.isFinite(emPulse.score)
      ? emPulse.score > emNeutral
        ? 'risk_off'
        : emPulse.score < -emNeutral
          ? 'risk_on'
          : 'mixed'
      : 'n/d'
  const emScore = fmtPct(typeof emPulse.score === 'number' && Number.isFinite(emPulse.score) ? emPulse.score : null)
  const emPillClass = emMode === 'risk_on' ? 'pillGood' : emMode === 'risk_off' ? 'pillBad' : emMode === 'mixed' ? 'pillMid' : ''
  const emPillLabel = emMode === 'risk_on' ? 'RISK-ON' : emMode === 'risk_off' ? 'RISK-OFF' : emMode === 'mixed' ? 'MISTO' : 'n/d'
  const emPill = `<span class="pill ${escapeHtml(emPillClass)}">${escapeHtml(emPillLabel)}</span>`
  const emThresholdLabel = `limiar ±${emNeutral}%`

  const brlA = arrowFromPct(wdo30_90)
  const fxDivergences = (() => {
    if (emMode !== 'risk_on' && emMode !== 'risk_off') return '—'
    const out: string[] = []
    if (emMode === 'risk_on') {
      if (dxyA === '↑') out.push('DXY↑')
      if (vixA === '↑') out.push('VIX↑')
      if (brlA === '↑') out.push('USD/BRL↑')
    }
    if (emMode === 'risk_off') {
      if (dxyA === '↓') out.push('DXY↓')
      if (vixA === '↓') out.push('VIX↓')
      if (brlA === '↓') out.push('USD/BRL↓')
    }
    return out.length ? out.join(' • ') : '—'
  })()

  return {
    emPulse,
    emMode,
    emScore,
    emPillLabel,
    emPill,
    emThresholdLabel,
    fxDivergences,
  }
}

export type EmSignals = ReturnType<typeof computeEmSignals>

