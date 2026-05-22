export function fmtBrtNow() {
  const d = new Date()
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const get = (t: string) => parts.find(p => p.type === t)?.value || ''
  return {
    date: `${get('day')}/${get('month')}/${get('year')}`,
    time: `${get('hour')}:${get('minute')}`,
    iso: d.toISOString(),
  }
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function fmtPct(v: number | null) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 'n/d'
  const s = v >= 0 ? `+${round2(v)}` : String(round2(v))
  return `${s}%`
}

export function arrowFromPct(v: number | null, neutralAbs = 0.08) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 'n/d'
  if (v > neutralAbs) return '↑'
  if (v < -neutralAbs) return '↓'
  return '≈'
}
