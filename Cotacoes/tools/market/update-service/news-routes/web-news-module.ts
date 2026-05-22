import type { RegisterNewsRoutesDeps } from './types.js'

export function registerWebNewsModuleRoutes(deps: RegisterNewsRoutesDeps) {
  deps.app.get('/api/news/web/module', async (req, res) => {
    try {
      const now = Date.now()

      const cached = deps.webNewsCache.get(now, deps.newsWebCacheSeconds * 1000)
      if (cached) return res.json(cached)

      if (!deps.newsWebEnabled) {
        const payload = buildWebNewsDisabledPayload(deps)
        deps.webNewsCache.set(now, payload)
        return res.status(200).json(payload)
      }

      const limit = deps.parseLimit({
        value: (req.query && (req.query.limit as unknown)) || deps.newsWebMaxItems,
        fallback: deps.newsWebMaxItems,
        min: 5,
        max: 80,
      })

      const payload = await buildWebNewsPayload({ deps, now, limit })
      deps.webNewsCache.set(now, payload)
      res.json(payload)
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'web_news_module_failed',
        generatedAt: deps.nowISO(),
        provider: 'web_news_module',
        message: String(err instanceof Error ? err.message : err),
      })
    }
  })
}

function buildWebNewsDisabledPayload(deps: RegisterNewsRoutesDeps) {
  return {
    ok: false,
    error: 'disabled',
    generatedAt: deps.nowISO(),
    provider: 'web_news_module',
    message: 'Ative NEWS_WEB_ENABLED=true para habilitar o Web News Module.',
  }
}

async function buildWebNewsPayload(params: { deps: RegisterNewsRoutesDeps; now: number; limit: number }) {
  const { deps, now, limit } = params
  const itemsAll = await fetchWebNewsItems({ deps, now })
  const items = itemsAll.slice(0, limit)
  const summary = deps.summarizeWebNews(items)
  const sources = Array.from(new Set(items.map(x => deps.hostnameOf(String(x.url || ''))).filter(Boolean))).slice(0, 12)

  return {
    ok: true,
    generatedAt: deps.nowISO(),
    provider: 'web_news_module',
    windowHours: deps.newsWebWindowHours,
    sources,
    items,
    ...(summary && typeof summary === 'object' ? summary : {}),
  }
}

async function fetchWebNewsItems(params: { deps: RegisterNewsRoutesDeps; now: number }) {
  const { deps, now } = params

  const rawLists = await Promise.allSettled(
    deps.newsWebRssUrls.map(async url => {
      const xml = await deps.fetchTextWithTimeout(url, 6500)
      const items = deps.parseRssItems(xml)
      return { url, items }
    }),
  )

  const all: any[] = []
  for (const r of rawLists) {
    if (r.status !== 'fulfilled') continue
    all.push(...mapRssListToWebNewsItems({ deps, now, url: r.value.url, items: r.value.items }))
  }

  const byId = new Map<string, any>()
  for (const x of all) byId.set(x.id, x)
  return Array.from(byId.values()).sort((a, b) => {
    const am = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const bm = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return bm - am
  })
}

function mapRssListToWebNewsItems(params: { deps: RegisterNewsRoutesDeps; now: number; url: string; items: any[] }) {
  const { deps, now } = params
  const host = deps.hostnameOf(params.url)
  const out: any[] = []

  for (const it of params.items) {
    const publishedMs = it.pubDate ? Date.parse(it.pubDate) : NaN
    const within = Number.isFinite(publishedMs) ? now - publishedMs <= deps.newsWebWindowHours * 60 * 60 * 1000 : true
    if (!within) continue

    const title = deps.sanitizeNoNumbers(it.title)
    const link = String(it.link || '').trim()
    if (!title || !link) continue

    const info = deps.classifyWebNewsItem(title, link)
    out.push({
      id: deps.normalizeWebItemId(link, title),
      title,
      url: link,
      publishedAt: Number.isFinite(publishedMs) ? new Date(publishedMs).toISOString() : null,
      source: it.source ? deps.sanitizeNoNumbers(it.source) : host || null,
      bucket: info.bucket,
      driver: info.driver,
      impact: info.impact,
      confidence: info.confidence,
    })
  }

  return out
}
