import type { RegisterNewsRoutesDeps } from './types.js'

export function registerFinancialJuiceRoutes(deps: RegisterNewsRoutesDeps) {
  deps.app.get('/api/news/financialjuice', (_req, res) => {
    res.json({ ok: true, generatedAt: deps.nowISO(), provider: 'financialjuice', url: deps.financialJuiceUrl })
  })

  deps.app.get('/api/news/financialjuice/headlines', async (req, res) => {
    try {
      const now = Date.now()
      const cached = deps.headlinesCache.get(now, deps.newsCacheSeconds * 1000)
      if (cached) return res.json(cached)

      const payload = await buildFinancialJuiceHeadlinesPayload({ deps, req, now })
      deps.headlinesCache.set(now, payload)
      res.status(200).json(payload)
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'financialjuice_headlines_failed',
        generatedAt: deps.nowISO(),
        provider: 'financialjuice',
        mode: 'discord',
        url: deps.financialJuiceUrl,
        message: String(err instanceof Error ? err.message : err),
      })
    }
  })
}

async function buildFinancialJuiceHeadlinesPayload(params: { deps: RegisterNewsRoutesDeps; req: any; now: number }) {
  const { deps, req, now } = params
  await deps.reloadDotenvIfChanged()

  const limit = deps.parseLimit({
    value: (req.query && (req.query.limit as unknown)) || deps.newsMaxItems,
    fallback: deps.newsMaxItems,
    min: 1,
    max: 80,
  })
  const debugMode = String((req.query && (req.query.debug as unknown)) || '0') === '1'
  const onlyFj = false

  const newsFjDiscordEnabledNow = deps.envBool('NEWS_FJ_DISCORD_ENABLED', false)
  if (!newsFjDiscordEnabledNow) return buildHeadlinesDisabledPayload(deps)

  const newsDiscordBotTokenNow = deps.env('NEWS_DISCORD_BOT_TOKEN', '') || ''
  const newsDiscordChannelIdNow = deps.normalizeDiscordChannelId(deps.env('NEWS_DISCORD_CHANNEL_ID', '') || '')
  if (!newsDiscordBotTokenNow || !newsDiscordChannelIdNow) return buildHeadlinesNotConfiguredPayload(deps)

  const raw = await deps.fetchDiscordMessages({
    channelId: newsDiscordChannelIdNow,
    token: newsDiscordBotTokenNow,
    limit: Math.max(limit, 25),
    timeoutMs: 6500,
    fetchRawWithTimeout: deps.fetchRawWithTimeout,
  })
  const debug = debugMode ? buildDiscordDebug(raw) : null
  const items = deps.buildStoredHeadlinesFromDiscordMessages(raw, limit)

  const stored = await deps.headlinesStore.load(now)
  const merged = mergeStoredHeadlines({
    stored,
    items,
    now,
    retentionDays: deps.newsHeadlinesRetentionDays,
    pruneStoredHeadlines: deps.pruneStoredHeadlines,
    parseCreatedAtMs: deps.parseCreatedAtMs,
  })
  await deps.headlinesStore.save(merged.mergedSorted)
  const outputItems = merged.mergedSorted.length ? merged.mergedSorted.slice(0, limit) : items.slice(0, limit)

  return {
    ok: true,
    generatedAt: deps.nowISO(),
    provider: 'financialjuice',
    mode: 'discord',
    url: deps.financialJuiceUrl,
    source: { channelId: newsDiscordChannelIdNow },
    filter: { onlyFj },
    store: {
      enabled: deps.newsHeadlinesStoreEnabled,
      retentionDays: deps.newsHeadlinesRetentionDays,
      total: merged.mergedSorted.length,
      rawTotal: merged.mergedAll.length,
      displayedFromDiscord: merged.mergedSorted.length === 0 && items.length > 0,
    },
    debug,
    items: outputItems,
  }
}

function buildHeadlinesDisabledPayload(deps: RegisterNewsRoutesDeps) {
  return {
    ok: false,
    error: 'disabled',
    generatedAt: deps.nowISO(),
    provider: 'financialjuice',
    mode: 'discord',
    url: deps.financialJuiceUrl,
    message:
      'Ative NEWS_FJ_DISCORD_ENABLED=true e configure NEWS_DISCORD_BOT_TOKEN + NEWS_DISCORD_CHANNEL_ID para receber manchetes no dashboard.',
  }
}

function buildHeadlinesNotConfiguredPayload(deps: RegisterNewsRoutesDeps) {
  return {
    ok: false,
    error: 'not_configured',
    generatedAt: deps.nowISO(),
    provider: 'financialjuice',
    mode: 'discord',
    url: deps.financialJuiceUrl,
    message: 'Faltam variáveis: NEWS_DISCORD_BOT_TOKEN e/ou NEWS_DISCORD_CHANNEL_ID',
  }
}

function buildDiscordDebug(raw: unknown) {
  const first = raw && Array.isArray(raw) && raw[0] ? (raw[0] as any) : null
  return {
    rawCount: Array.isArray(raw) ? raw.length : 0,
    sample: first
      ? {
          id: first.id,
          timestamp: first.timestamp || null,
          author: first.author
            ? {
                bot: !!first.author.bot,
                username: first.author.username ? String(first.author.username) : null,
              }
            : null,
          contentHead: first.content ? String(first.content).slice(0, 120) : null,
          embedsCount: first.embeds && Array.isArray(first.embeds) ? first.embeds.length : 0,
        }
      : null,
  }
}

function mergeStoredHeadlines(params: {
  stored: any[]
  items: any[]
  now: number
  retentionDays: number
  pruneStoredHeadlines: (items: any[], nowMs: number, retentionDays: number) => any[]
  parseCreatedAtMs: (createdAt: unknown) => number | null
}) {
  const byId = new Map<string, any>()
  for (const s of params.stored) byId.set(String((s as any).id || ''), s)

  for (const it of params.items) {
    const id = String(it.id || '')
    if (!id) continue
    const next = {
      id,
      createdAt: it.createdAt ? String(it.createdAt) : null,
      original: String(it.original || ''),
      url: it.url ? String(it.url) : null,
      author: it.author
        ? {
            bot: !!(it.author as { bot?: boolean }).bot,
            username: (it.author as { username?: string | null }).username ? String((it.author as { username?: string | null }).username) : null,
          }
        : null,
    }
    byId.set(id, next)
  }

  const mergedAll = Array.from(byId.values())
  const mergedSorted = params.pruneStoredHeadlines(mergedAll, params.now, params.retentionDays).sort((a, b) => {
    const am = params.parseCreatedAtMs(a.createdAt) ?? 0
    const bm = params.parseCreatedAtMs(b.createdAt) ?? 0
    return bm - am
  })
  return { mergedAll, mergedSorted }
}
