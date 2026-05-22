export function localYmd(d: Date) {
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function tzParts(d: Date) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    const parts = fmt.formatToParts(d)
    const get = (t: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === t)?.value || ''
    const wd = get('weekday')
    const weekday =
      wd === 'Sun' ? 0 : wd === 'Mon' ? 1 : wd === 'Tue' ? 2 : wd === 'Wed' ? 3 : wd === 'Thu' ? 4 : wd === 'Fri' ? 5 : wd === 'Sat' ? 6 : d.getDay()
    const year = get('year')
    const month = get('month')
    const day = get('day')
    const hour = Number(get('hour'))
    const minute = Number(get('minute'))
    const ymd = year && month && day ? `${year}-${month}-${day}` : ''
    return { weekday, hour: Number.isFinite(hour) ? hour : d.getHours(), minute: Number.isFinite(minute) ? minute : d.getMinutes(), ymd }
  } catch {
    const y = String(d.getFullYear())
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return { weekday: d.getDay(), hour: d.getHours(), minute: d.getMinutes(), ymd: `${y}-${m}-${dd}` }
  }
}

export function canAttemptAfterRelease(spNow: { weekday: number; hour: number; minute: number }) {
  if (spNow.weekday === 1) return spNow.hour > 8 || (spNow.hour === 8 && spNow.minute >= 30)
  return spNow.weekday >= 2 && spNow.weekday <= 6
}

export function isPrimaryUpdateWindow(spNow: { weekday: number; hour: number; minute: number }) {
  if (spNow.weekday !== 1) return false
  const afterStart = spNow.hour > 8 || (spNow.hour === 8 && spNow.minute >= 30)
  const beforeEnd = spNow.hour < 9 || (spNow.hour === 9 && spNow.minute === 0)
  return afterStart && beforeEnd
}

export function lastPublishedMondayYmd(params: {
  now: Date
  spNow: { weekday: number; hour: number; minute: number; ymd: string }
}) {
  const baseYmd = params.spNow.ymd || localYmd(params.now)
  const baseDt = /^\d{4}-\d{2}-\d{2}$/.test(baseYmd) ? new Date(`${baseYmd}T12:00:00`) : new Date(params.now)
  const isEarlyMonday = params.spNow.weekday === 1 && !(params.spNow.hour > 8 || (params.spNow.hour === 8 && params.spNow.minute >= 30))
  const weekdayForCalc = isEarlyMonday ? 0 : params.spNow.weekday
  const delta = weekdayForCalc === 0 ? 6 : weekdayForCalc - 1
  const dt = new Date(baseDt.getFullYear(), baseDt.getMonth(), baseDt.getDate(), 12, 0, 0, 0)
  dt.setDate(dt.getDate() - delta)
  return localYmd(dt)
}

