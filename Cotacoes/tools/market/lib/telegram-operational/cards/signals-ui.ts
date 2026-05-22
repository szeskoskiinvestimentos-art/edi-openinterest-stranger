import { arrowClass, escapeHtml } from '../html.js'

export function intelPill(mode: 'good' | 'bad' | 'mid', label: string) {
  const cls = mode === 'good' ? 'pillGood' : mode === 'bad' ? 'pillBad' : 'pillMid'
  return `<span class="pill ${escapeHtml(cls)}">${escapeHtml(label)}</span>`
}

export function pillFromRiskMode(mode: 'risk_on' | 'risk_off' | 'mixed' | 'n/d') {
  if (mode === 'risk_on') return intelPill('good', 'RISK-ON')
  if (mode === 'risk_off') return intelPill('bad', 'RISK-OFF')
  if (mode === 'mixed') return intelPill('mid', 'MISTO')
  return `<span class="muted">n/d</span>`
}

export function modeFromCounts(onCount: number, offCount: number, required: number) {
  if (onCount >= required) return 'risk_on'
  if (offCount >= required) return 'risk_off'
  return 'mixed'
}

export function miniArrow(label: string, a: string) {
  return `<span class="muted">${escapeHtml(label)}</span><span class="${escapeHtml(arrowClass(a))}" style="margin-left:4px;">${escapeHtml(a)}</span>`
}

