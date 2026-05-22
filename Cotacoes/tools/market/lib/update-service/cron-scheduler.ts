export function isWeekday(d: Date) {
  const day = d.getDay()
  return day >= 1 && day <= 5
}

export function computeCronSlotsMinutes(intervalMinutes: number) {
  const slots: number[] = []
  slots.push(8 * 60 + 30)
  const step = Math.max(5, Math.min(60, intervalMinutes))
  const start = 9 * 60
  const end = 17 * 60
  for (let m = start; m <= end; m += step) slots.push(m)
  if (slots[slots.length - 1] !== end) slots.push(end)
  slots.push(20 * 60)
  return slots
}

export function nextCronRun(from: Date, intervalMinutes: number) {
  const slots = computeCronSlotsMinutes(intervalMinutes)
  for (let addDays = 0; addDays <= 10; addDays++) {
    const d = new Date(from.getTime())
    d.setDate(d.getDate() + addDays)
    if (!isWeekday(d)) continue

    const base = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
    const nowMin = addDays === 0 ? from.getHours() * 60 + from.getMinutes() : -1

    for (const m of slots) {
      if (addDays === 0 && m <= nowMin) continue
      const run = new Date(base.getTime() + m * 60 * 1000)
      if (run.getTime() > from.getTime()) return run
    }
  }
  return null
}

export function startCronScheduler(params: {
  intervalMinutes: number
  onDue: () => void
  now?: () => Date
}) {
  let timer: NodeJS.Timeout | null = null
  const now = params.now || (() => new Date())

  const scheduleNext = () => {
    if (timer) clearTimeout(timer)
    const next = nextCronRun(now(), params.intervalMinutes)
    if (!next) return
    const waitMs = Math.max(250, next.getTime() - Date.now())
    timer = setTimeout(() => {
      params.onDue()
      scheduleNext()
    }, waitMs)
  }

  scheduleNext()

  return {
    stop: () => {
      if (timer) clearTimeout(timer)
      timer = null
    },
    reschedule: scheduleNext,
  }
}

