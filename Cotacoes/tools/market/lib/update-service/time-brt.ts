export function brtMinutesOfDayNow() {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date())
    const h = Number(parts.find(p => p.type === 'hour')?.value || '0')
    const m = Number(parts.find(p => p.type === 'minute')?.value || '0')
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null
    return h * 60 + m
  } catch {
    return null
  }
}

export function operationalSessionLabelForNow() {
  const min = brtMinutesOfDayNow()
  if (typeof min !== 'number') return 'Pré-mercado'
  if (min >= 18 * 60) return 'Pós-mercado'
  if (min < 9 * 60) return 'Pré-mercado'
  return 'Pregão aberto'
}

