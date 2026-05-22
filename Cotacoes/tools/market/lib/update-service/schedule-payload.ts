import { nextDueAtIso } from './next-due.ts'

export function buildSchedulePayload(params: {
  marketScheduleMode: string
  intervalMinutes: number
  intervalMs: number
  schedulePending: boolean
  lastUpdateStartMs: number | null
  nextCronRun: (from: Date) => Date | null
}) {
  return {
    mode: params.marketScheduleMode,
    intervalMinutes: params.intervalMinutes,
    pending: params.schedulePending,
    lastUpdateStartedAt: params.lastUpdateStartMs ? new Date(params.lastUpdateStartMs).toISOString() : null,
    nextDueAt: nextDueAtIso({
      marketScheduleMode: params.marketScheduleMode,
      lastUpdateStartMs: params.lastUpdateStartMs,
      intervalMs: params.intervalMs,
      nextCronRun: params.nextCronRun,
    }),
  }
}
