export type TelegramOperationalGateResult =
  | { ok: true }
  | {
      ok: false
      error: 'disabled' | 'not_configured' | 'send_on_blocked'
      enabled?: { telegramEnabled: boolean; telegramOperationalEnabled: boolean }
      missing?: string[]
      sendOn?: string
      reason?: string
    }

export function telegramOperationalGate(params: {
  reason: string
  telegramEnabled: boolean
  telegramOperationalEnabled: boolean
  telegramBotToken: string
  telegramChatId: string
  telegramOperationalSendOn: string
}) {
  if (!params.telegramEnabled || !params.telegramOperationalEnabled) {
    return {
      ok: false,
      error: 'disabled',
      enabled: { telegramEnabled: params.telegramEnabled, telegramOperationalEnabled: params.telegramOperationalEnabled },
    } satisfies TelegramOperationalGateResult
  }

  const missing = []
  if (!params.telegramBotToken) missing.push('TELEGRAM_BOT_TOKEN')
  if (!params.telegramChatId) missing.push('TELEGRAM_CHAT_ID')
  if (missing.length) {
    return { ok: false, error: 'not_configured', missing } satisfies TelegramOperationalGateResult
  }

  if (params.telegramOperationalSendOn === 'schedule' && params.reason !== 'schedule') {
    return { ok: false, error: 'send_on_blocked', sendOn: params.telegramOperationalSendOn, reason: params.reason } satisfies TelegramOperationalGateResult
  }
  if (params.telegramOperationalSendOn !== 'both' && params.telegramOperationalSendOn !== 'schedule' && params.reason === 'schedule') {
    return { ok: false, error: 'send_on_blocked', sendOn: params.telegramOperationalSendOn, reason: params.reason } satisfies TelegramOperationalGateResult
  }

  return { ok: true } satisfies TelegramOperationalGateResult
}

export function telegramOperationalCooldownOk(params: {
  lastSentAtMs: number | null
  cooldownMinutes: number
}) {
  if (!params.lastSentAtMs) return true
  return Date.now() - params.lastSentAtMs >= Math.max(1, params.cooldownMinutes) * 60 * 1000
}

export type SendTelegramOperationalOnceResult =
  | TelegramOperationalGateResult
  | { ok: false; error: 'cooldown'; cooldownMinutes: number }
  | { ok: false; error: 'build_failed' }
  | { ok: false; error: 'render_failed' }
  | { ok: false; error: string }
  | { ok: true; generatedAt: string; results: Array<{ ok: boolean; filename: string; error?: string }> }

export async function sendTelegramOperationalOnce(params: {
  reason: string
  force?: boolean
  logPath?: string
  baseUrl: string
  sourceDataDir: string
  sessionLabel: string
  telegram: {
    enabled: boolean
    operationalEnabled: boolean
    botToken: string
    chatId: string
    threadId: number | null
    sendOn: string
    cooldownMinutes: number
  }
  state: {
    getLastSentAtMs: () => number | null
    setLastSentAtMs: (ms: number) => void
  }
  buildOperationalTelegramCards: (input: {
    baseUrl: string
    sourceDataDir: string
    sessionLabel: string
  }) => Promise<{ ok: boolean; generatedAt: string; cards: unknown[] }>
  renderTelegramCardsToPng: (cards: unknown[]) => Promise<{ ok: boolean; images: Array<{ filename: string; caption: string; png: Buffer }> }>
  sendTelegramPhotos: (input: {
    botToken: string
    chatId: string
    messageThreadId?: number | null
    items: Array<{ filename: string; caption: string; png: Buffer }>
  }) => Promise<{ ok: boolean; error?: string; results?: Array<{ ok: boolean; filename: string; error?: string }> }>
  appendLog?: (logPath: string, chunk: string) => Promise<void>
}): Promise<SendTelegramOperationalOnceResult> {
  const gate = telegramOperationalGate({
    reason: params.reason,
    telegramEnabled: params.telegram.enabled,
    telegramOperationalEnabled: params.telegram.operationalEnabled,
    telegramBotToken: params.telegram.botToken,
    telegramChatId: params.telegram.chatId,
    telegramOperationalSendOn: params.telegram.sendOn,
  })
  if (!gate.ok) return gate

  if (!params.force) {
    const ok = telegramOperationalCooldownOk({
      lastSentAtMs: params.state.getLastSentAtMs(),
      cooldownMinutes: params.telegram.cooldownMinutes,
    })
    if (!ok) {
      return { ok: false, error: 'cooldown', cooldownMinutes: params.telegram.cooldownMinutes }
    }
  }

  const payload = await params.buildOperationalTelegramCards({
    baseUrl: params.baseUrl,
    sourceDataDir: params.sourceDataDir,
    sessionLabel: params.sessionLabel,
  })
  if (!payload || !payload.ok) return { ok: false, error: 'build_failed' }

  const rendered = await params.renderTelegramCardsToPng(payload.cards)
  if (!rendered.ok) return { ok: false, error: 'render_failed' }

  const send = await params.sendTelegramPhotos({
    botToken: params.telegram.botToken,
    chatId: params.telegram.chatId,
    messageThreadId: params.telegram.threadId,
    items: rendered.images.map(x => ({ filename: x.filename, caption: x.caption, png: x.png })),
  })
  if (!send.ok) return { ok: false, error: send.error || 'send_failed' }
  const results = Array.isArray(send.results) ? send.results : []

  params.state.setLastSentAtMs(Date.now())
  if (params.logPath && params.appendLog) {
    const failed = results.filter(x => !x.ok)
    const summary =
      `TELEGRAM operational\n` +
      `- ok=${results.length - failed.length}/${results.length}\n` +
      (failed.length ? `- failed=${failed.map(x => `${x.filename}: ${x.error || 'error'}`).join(' | ')}\n` : '')
    await params.appendLog(params.logPath, `${summary}\n`)
  }

  return { ok: true, generatedAt: payload.generatedAt, results }
}
