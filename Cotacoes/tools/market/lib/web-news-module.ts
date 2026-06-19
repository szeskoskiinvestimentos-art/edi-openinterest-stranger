type RssItem = { title: string; link: string; pubDate: string | null; source: string | null }

type WebNewsItem = {
  id: string
  title: string
  url: string
  publishedAt: string | null
  source: string | null
  bucket: string
  driver: string
  impact: { wdo: string; win: string }
  confidence: string
}

const DEFAULT_WEB_RSS_URLS = [
  'https://news.google.com/rss/search?q=Fed%20inflation%20Treasury%20yields%20Dollar%20DXY&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=global%20markets%20risk%20on%20risk%20off%20credit%20spreads&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=Brazil%20fiscal%20Congress%20Haddad%20Lula%20Copom%20BCB&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  'https://news.google.com/rss/search?q=oil%20OPEC%20Brent%20WTI%20supply%20geopolitics&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=iron%20ore%20China%20steel%20property&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=soybeans%20corn%20coffee%20sugar%20weather%20South%20America&hl=en-US&gl=US&ceid=US:en',
]

function sanitizeNoNumbers(raw: string) {
  return String(raw || '').replace(/\d+/g, '').replace(/\s+/g, ' ').trim()
}

function parseRssItems(xml: string) {
  const out: RssItem[] = []
  const blocks = String(xml || '').match(/<item[\s\S]*?<\/item>/gi) || []
  for (const b of blocks) {
    const title = (
      b.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1] ||
      b.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ||
      ''
    ).trim()
    const link = (b.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '').trim()
    const pubDate = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '').trim() || null
    const source = (b.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] || '').trim() || null
    if (title && link) out.push({ title, link, pubDate, source })
  }
  return out
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

function parseRssUrls(rawUrls: string) {
  const raw = String(rawUrls || '').trim()
  return raw ? Array.from(new Set(raw.split(/[\n,;]+/g).map(x => x.trim()).filter(Boolean))) : DEFAULT_WEB_RSS_URLS
}

function classifyWebBucket(title: string, url: string) {
  const s = `${title} ${url}`.toLowerCase()
  if (/\bbrazil\b|\bbrasil\b|\bcopom\b|\bbcb\b|\bfiscal\b|\bcongress\b|\bhaddad\b|\blula\b/.test(s)) return 'BRASIL'
  if (/\boil\b|\bbrent\b|\bwti\b|\bopec\b|\biron\b|\bore\b|\bsteel\b|\bsoy\b|\bsoybean\b|\bcorn\b|\bcoffee\b|\bsugar\b/.test(s))
    return 'COMMODITIES'
  return 'GLOBAL'
}

function classifyWebImpact(title: string) {
  const s = title.toLowerCase()
  const riskOff = /\brisk[-\s]?off\b|\bfears\b|\btensions\b|\bescalat|\bwar\b|\bconflict\b|\bcrisis\b/.test(s)
  const riskOn = /\brisk[-\s]?on\b|\brally\b|\bsurge\b|\boptimis\b/.test(s)
  const hawkish = /\bhawkish\b|\binflation\b|\byields?\s+(?:rise|jump|up)\b|\brates?\s+(?:rise|up)\b/.test(s)
  const dovish = /\bdovish\b|\brates?\s+(?:cut|cuts|down)\b|\byields?\s+(?:fall|down)\b/.test(s)

  if (riskOff || hawkish) return { wdo: '↑', win: '↓', confidence: 'média' }
  if (riskOn || dovish) return { wdo: '↓', win: '↑', confidence: 'média' }
  return { wdo: '≈', win: '≈', confidence: 'baixa' }
}

async function fetchRssLists(params: {
  urls: string[]
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}) {
  const pulled = await Promise.allSettled(
    params.urls.map(async url => {
      const xml = await params.fetchTextWithTimeout(url, 6500)
      return { url, items: parseRssItems(xml) }
    }),
  )
  return pulled.filter((r): r is PromiseFulfilledResult<{ url: string; items: RssItem[] }> => r.status === 'fulfilled').map(r => r.value)
}

function mapRssListToNewsItems(params: { url: string; host: string; items: RssItem[]; nowMs: number; windowMs: number }) {
  const out: WebNewsItem[] = []
  for (const it of params.items) {
    const publishedMs = it.pubDate ? Date.parse(it.pubDate) : NaN
    const within = Number.isFinite(publishedMs) ? params.nowMs - publishedMs <= params.windowMs : true
    if (!within) continue

    const title = sanitizeNoNumbers(it.title)
    if (!title || !it.link) continue

    const bucket = classifyWebBucket(title, it.link)
    const impactInfo = classifyWebImpact(title)
    const publishedAt = Number.isFinite(publishedMs) ? new Date(publishedMs).toISOString() : null
    const id = `${it.link}::${title}`.slice(0, 320)
    const source = sanitizeNoNumbers(it.source || params.host) || params.host || null

    out.push({
      id,
      title,
      url: it.link,
      publishedAt,
      source,
      bucket,
      driver: '',
      impact: { wdo: impactInfo.wdo, win: impactInfo.win },
      confidence: impactInfo.confidence,
    })
  }
  return out
}

function dedupeAndSort(items: WebNewsItem[]) {
  const byId = new Map<string, WebNewsItem>()
  for (const x of items) byId.set(x.id, x)
  return Array.from(byId.values()).sort((a, b) => {
    const am = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const bm = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return bm - am
  })
}

export async function buildWebNewsModule(params: {
  env: (key: string, fallback?: string) => string
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}) {
  const windowHours = Math.max(6, Number(params.env('NEWS_WEB_WINDOW_HOURS', '24')) || 24)
  const maxItems = Math.max(5, Math.min(80, Number(params.env('NEWS_WEB_MAX_ITEMS', '40')) || 40))

  const rawUrls = String(params.env('NEWS_WEB_RSS_URLS', '') || '').trim()
  const urls = parseRssUrls(rawUrls)

  const now = Date.now()
  const windowMs = windowHours * 60 * 60 * 1000

  const lists = await fetchRssLists({ urls, fetchTextWithTimeout: params.fetchTextWithTimeout })
  const all: WebNewsItem[] = []
  for (const list of lists) {
    const host = hostnameOf(list.url)
    all.push(...mapRssListToNewsItems({ url: list.url, host, items: list.items, nowMs: now, windowMs }))
  }
  const merged = dedupeAndSort(all)
  const items = merged.slice(0, maxItems)
  const sources = Array.from(new Set(items.map(x => x.source).filter(Boolean))).slice(0, 12)

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    provider: 'web_news_module',
    warnings: [],
    windowHours,
    sources,
    summary: {
      globalTop: [],
      brasilTop: [],
      commoditiesTop: [],
      sentiment: 'Neutro',
      bullish: [],
      bearish: [],
      conflicts: [],
      thesis: null,
    },
    items,
  }
}
