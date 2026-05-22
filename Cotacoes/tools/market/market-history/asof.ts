export function parseAsOfIso(raw: string, referenceIso: string) {
  const s = String(raw || '').trim()
  if (!s || s === '-' || s === '--') return null
  const ref = new Date(referenceIso)
  if (!Number.isFinite(ref.getTime())) return null

  const time = s.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (time) {
    const hh = Number(time[1])
    const mi = Number(time[2])
    const ss = Number(time[3] || '0')
    if (![hh, mi, ss].every(Number.isFinite)) return null
    const dt = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), hh, mi, ss)
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : null
  }

  const dmy = s.match(/^(\d{2})\/(\d{2})(?:\/(\d{2}|\d{4}))?$/)
  if (dmy) {
    const dd = Number(dmy[1])
    const mm = Number(dmy[2])
    const yyRaw = dmy[3]
    const refYear = ref.getFullYear()
    let yyyy = refYear
    if (yyRaw) {
      const y = Number(yyRaw)
      if (!Number.isFinite(y)) return null
      yyyy = yyRaw.length === 2 ? 2000 + y : y
    }
    if (![dd, mm, yyyy].every(Number.isFinite)) return null
    let dt = new Date(yyyy, mm - 1, dd, 0, 0, 0)
    if (!Number.isFinite(dt.getTime())) return null
    if (!yyRaw) {
      const driftDays = (dt.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000)
      if (driftDays > 7) dt = new Date(refYear - 1, mm - 1, dd, 0, 0, 0)
    }
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : null
  }

  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) {
    const yyyy = Number(ymd[1])
    const mm = Number(ymd[2])
    const dd = Number(ymd[3])
    if (![dd, mm, yyyy].every(Number.isFinite)) return null
    const dt = new Date(yyyy, mm - 1, dd, 0, 0, 0)
    return Number.isFinite(dt.getTime()) ? dt.toISOString() : null
  }

  return null
}

