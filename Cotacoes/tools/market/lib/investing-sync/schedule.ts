const BRT_TZ = 'America/Sao_Paulo'

export function brtYmd(d = new Date()) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const year = String(parts.find(p => p.type === 'year')?.value || '')
  const month = String(parts.find(p => p.type === 'month')?.value || '')
  const day = String(parts.find(p => p.type === 'day')?.value || '')
  if (!year || !month || !day) return ''
  return `${year}-${month}-${day}`
}

export function brtMinuteOfDay(d = new Date()) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRT_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d)
  const hour = Number(parts.find(p => p.type === 'hour')?.value || '0')
  const minute = Number(parts.find(p => p.type === 'minute')?.value || '0')
  return hour * 60 + minute
}

export function diScheduleIntervalMinutes(now = new Date()) {
  const m = brtMinuteOfDay(now)
  const min0600 = 6 * 60
  const min0900 = 9 * 60
  const min1900 = 19 * 60
  if (m < min0600) return null
  if (m < min0900) return 60
  if (m < min1900) return 15
  return null
}

export function shouldRunDiCatchUpAfterClose(now: Date, lastDiUpdatedAtMs: number | null) {
  if (!lastDiUpdatedAtMs) return false
  const nowMin = brtMinuteOfDay(now)
  const min1900 = 19 * 60
  if (nowMin < min1900) return false
  const lastDate = brtYmd(new Date(lastDiUpdatedAtMs))
  const today = brtYmd(now)
  if (!lastDate || !today || lastDate !== today) return false
  const lastMin = brtMinuteOfDay(new Date(lastDiUpdatedAtMs))
  return lastMin < min1900
}
