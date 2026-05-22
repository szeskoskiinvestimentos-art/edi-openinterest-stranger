export function nextDueAtIso(params: {
  marketScheduleMode: string
  lastUpdateStartMs: number | null
  intervalMs: number
  nowMs?: number
  nextCronRun: (from: Date) => Date | null
}) {
  const now = typeof params.nowMs === 'number' ? params.nowMs : Date.now()
  if (params.marketScheduleMode === 'cron') {
    const next = params.nextCronRun(new Date(now))
    return next ? next.toISOString() : null
  }
  return new Date((params.lastUpdateStartMs ?? now) + params.intervalMs).toISOString()
}
