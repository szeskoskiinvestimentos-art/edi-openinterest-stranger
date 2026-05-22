export function manualCooldownInfo(params: {
  manualCooldownMs: number
  manualCooldownMinutes: number
  lastManualStartMs: number | null
  nowMs?: number
}) {
  const now = typeof params.nowMs === 'number' && Number.isFinite(params.nowMs) ? params.nowMs : Date.now()
  const last = params.lastManualStartMs
  const remainingMs = last ? Math.max(0, params.manualCooldownMs - (now - last)) : 0
  const nextAllowedAt = remainingMs ? new Date(now + remainingMs).toISOString() : null
  return {
    cooldownMinutes: Math.max(1, params.manualCooldownMinutes),
    lastManualStartedAt: last ? new Date(last).toISOString() : null,
    nextAllowedAt,
    remainingSec: Math.ceil(remainingMs / 1000),
  }
}

