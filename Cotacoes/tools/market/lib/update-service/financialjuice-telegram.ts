export type FinancialJuiceHeadlinesPayload = {
  ok: boolean
  items?: Array<{ id: string; createdAt?: string | null; original: string; url?: string | null }>
}

export function telegramFinancialJuiceConfigured(params: {
  env: (key: string, fallback?: string) => string
  envBool: (key: string, fallback: boolean) => boolean
}) {
  if (!params.envBool('TELEGRAM_ENABLED', true)) return false
  if (!params.envBool('TELEGRAM_FINANCIALJUICE_ENABLED', true)) return false
  if (!params.env('TELEGRAM_BOT_TOKEN', '')) return false
  if (!params.env('TELEGRAM_FINANCIALJUICE_CHAT_ID', '')) return false
  return true
}

export async function forwardFinancialJuiceToTelegram(params: {
  reloadDotenvIfChanged: () => Promise<void>
  env: (key: string, fallback?: string) => string
  envBool: (key: string, fallback: boolean) => boolean
  envNumber: (key: string, fallback: number) => number
  envIntOrNull: (key: string) => number | null
  baseUrl: string
  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
  sendTelegramMessages: (params: {
    botToken: string
    chatId: string
    messageThreadId?: number | null
    items: Array<{ text: string; disablePreview?: boolean }>
  }) => Promise<{ ok: boolean; error?: string; results?: Array<{ ok: boolean; messageId?: number; error?: string }> }>
  sentStore: { has: (id: string) => boolean; remember: (id: string) => void; flush: (nowMs: number) => Promise<void> }
  opts?: { bootstrap?: boolean; dryRun?: boolean; maxItems?: number }
}) {
  await params.reloadDotenvIfChanged()
  if (!telegramFinancialJuiceConfigured({ env: params.env, envBool: params.envBool })) {
    return { ok: false as const, error: 'disabled_or_not_configured' }
  }

  const payload = await params.fetchJsonWithTimeout<FinancialJuiceHeadlinesPayload>(
    `${params.baseUrl}/api/news/financialjuice/headlines?limit=40&onlyFj=0&t=${Date.now()}`,
    4500,
  )

  if (!payload || !payload.ok) return { ok: false as const, error: 'no_headlines' }
  const items = Array.isArray(payload.items) ? payload.items : []
  if (!items.length) return { ok: false as const, error: 'no_items' }

  const maxPerPoll = Math.max(1, Math.min(30, params.envNumber('TELEGRAM_FINANCIALJUICE_MAX_PER_POLL', 10)))
  const bootstrapMax = Math.max(0, Math.min(50, params.envNumber('TELEGRAM_FINANCIALJUICE_BOOTSTRAP_MAX_ITEMS', 6)))
  const rawOverride =
    params.opts && typeof params.opts.maxItems === 'number' && Number.isFinite(params.opts.maxItems)
      ? Math.floor(params.opts.maxItems)
      : null
  const maxOverride = rawOverride !== null ? Math.max(1, Math.min(30, rawOverride)) : null
  const baseMax = params.opts && params.opts.bootstrap ? (bootstrapMax || maxPerPoll) : maxPerPoll
  const max = maxOverride !== null ? Math.min(baseMax, maxOverride) : baseMax

  const toSend: Array<{ id: string; text: string }> = []
  for (const it of items.slice().reverse()) {
    const id = String(it && it.id ? it.id : '').trim()
    if (!id) continue
    if (params.sentStore.has(id)) continue
    const text = String(it && it.original ? it.original : '').trim()
    if (!text) continue
    const url = it && it.url ? String(it.url) : ''
    const line = url ? `${text}\n${url}` : text
    toSend.push({ id, text: line })
    if (toSend.length >= max) break
  }

  if (!toSend.length) return { ok: true as const, sent: 0 }
  if (params.opts && params.opts.dryRun) {
    return {
      ok: true as const,
      sent: 0,
      dryRun: true as const,
      wouldSend: toSend.slice(0, 10).map(x => ({ id: x.id, text: x.text })),
    }
  }

  const safeText = (s: string) => {
    const t = String(s || '').trim()
    if (t.length <= 3600) return t
    return `${t.slice(0, 3580).trim()}…`
  }

  const send = await params.sendTelegramMessages({
    botToken: params.env('TELEGRAM_BOT_TOKEN', ''),
    chatId: params.env('TELEGRAM_FINANCIALJUICE_CHAT_ID', ''),
    messageThreadId: params.envIntOrNull('TELEGRAM_FINANCIALJUICE_THREAD_ID'),
    items: toSend.map(x => ({ text: safeText(x.text), disablePreview: true })),
  })

  if (!send.ok) {
    return { ok: false as const, error: send.error || 'telegram_send_failed' }
  }

  const results = Array.isArray(send.results) ? send.results : []
  for (let i = 0; i < toSend.length; i++) {
    const r = results[i]
    if (r && r.ok) params.sentStore.remember(toSend[i].id)
  }

  await params.reloadDotenvIfChanged()
  await params.sentStore.flush(Date.now())
  const sent = results.filter(x => x.ok).length
  return { ok: true as const, sent, results }
}

