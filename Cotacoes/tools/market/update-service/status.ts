import { buildSchedulePayload } from '../lib/update-service/schedule-payload.js'

export function createMarketServiceStatus(deps: {
  env: (key: string, fallback?: string) => string | undefined
  envBool: (key: string, fallback: boolean) => boolean
  envNumber: (key: string, fallback: number) => number
  normalizeDiscordChannelId: (raw: string) => string

  marketScheduleMode: string
  intervalMinutes: number
  intervalMs: number
  getSchedulePending: () => boolean
  getLastUpdateStartMs: () => number | null
  nextCronRun: (from: Date) => Date | null

  telegramOperationalCooldownMinutes: number
  getLastTelegramOperationalSentMs: () => number | null

  telegramWiring: { telegramFinancialJuiceConfigured: () => boolean }
}) {
  const buildSchedule = () =>
    buildSchedulePayload({
      marketScheduleMode: deps.marketScheduleMode,
      intervalMinutes: deps.intervalMinutes,
      intervalMs: deps.intervalMs,
      schedulePending: deps.getSchedulePending(),
      lastUpdateStartMs: deps.getLastUpdateStartMs(),
      nextCronRun: deps.nextCronRun,
    })

  const telegramStatus = () => ({
    enabled: deps.envBool('TELEGRAM_ENABLED', true),
    operationalEnabled: deps.envBool('TELEGRAM_OPERATIONAL_ENABLED', false),
    sendOn: String(deps.env('TELEGRAM_OPERATIONAL_SEND_ON', 'manual') || 'manual').toLowerCase(),
    cooldownMinutes: deps.telegramOperationalCooldownMinutes,
    lastSentAt: deps.getLastTelegramOperationalSentMs() ? new Date(deps.getLastTelegramOperationalSentMs() as number).toISOString() : null,
  })

  const newsStatus = () => ({
    financialjuice: {
      enabled: deps.envBool('NEWS_FJ_DISCORD_ENABLED', false),
      channelId: deps.normalizeDiscordChannelId(deps.env('NEWS_DISCORD_CHANNEL_ID', '')),
    },
    telegramFinancialJuice: {
      enabled: deps.envBool('TELEGRAM_FINANCIALJUICE_ENABLED', true),
      configured: deps.telegramWiring.telegramFinancialJuiceConfigured(),
      pollSeconds: Math.max(15, deps.envNumber('TELEGRAM_FINANCIALJUICE_POLL_SECONDS', 120)),
    },
  })

  return { buildSchedule, telegramStatus, newsStatus }
}
