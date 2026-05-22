import type { StoredHeadline } from './headlines-store.ts'

export type DiscordMessage = {
  id: string
  content?: string
  timestamp?: string
  author?: { bot?: boolean; username?: string }
  embeds?: Array<{
    title?: string
    description?: string
    url?: string
  }>
}

export async function fetchDiscordMessages(params: {
  channelId: string
  token: string
  limit: number
  timeoutMs: number
  fetchRawWithTimeout: (params: {
    url: string
    timeoutMs: number
    method: 'GET' | 'POST'
    headers?: Record<string, string>
    body?: string
  }) => Promise<{ status: number; ok: boolean; text: string; headers: Record<string, string> }>
  maxAttempts?: number
}) {
  const channelId = String(params.channelId || '').trim()
  const token = String(params.token || '').trim()
  const limit = Math.max(1, Math.min(100, Math.floor(params.limit)))
  if (!channelId || !token) return [] as DiscordMessage[]

  const url = `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages?limit=${encodeURIComponent(String(limit))}`
  const maxAttempts = Math.max(1, Math.min(8, params.maxAttempts ?? 3))

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const r = await params.fetchRawWithTimeout({
      url,
      timeoutMs: params.timeoutMs,
      method: 'GET',
      headers: { Authorization: `Bot ${token}` },
    })
    if (r.status === 429) {
      const retryAfterHeader = r.headers['retry-after']
      let retryMs = retryAfterHeader ? Math.max(250, Math.floor(Number(retryAfterHeader) * 1000)) : 1500
      try {
        const j = JSON.parse(String(r.text || '')) as { retry_after?: number }
        if (j && typeof j.retry_after === 'number' && Number.isFinite(j.retry_after)) {
          retryMs = Math.max(250, Math.floor(j.retry_after * 1000))
        }
      } catch {
        void 0
      }
      await sleep(Math.min(15000, retryMs))
      continue
    }
    if (!r.ok) throw new Error(`Discord HTTP ${r.status}`)
    try {
      return JSON.parse(String(r.text || '')) as DiscordMessage[]
    } catch {
      throw new Error('Discord JSON parse falhou')
    }
  }

  throw new Error('Discord rate limited')
}

function normalizeLine(text: string) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  if (!t) return null
  if (t.length < 6) return null
  return t
}

function extractTextsFromMessage(m: DiscordMessage) {
  const out: Array<{ text: string; url?: string | null }> = []

  const content = normalizeLine(m && m.content ? m.content : '')
  if (content) out.push({ text: content, url: null })

  const embeds = Array.isArray(m && m.embeds ? m.embeds : []) ? (m.embeds as NonNullable<DiscordMessage['embeds']>) : []
  for (const e of embeds) {
    const title = normalizeLine(e && e.title ? e.title : '')
    const desc = normalizeLine(e && e.description ? e.description : '')
    const url = e && e.url ? String(e.url) : null
    if (title) out.push({ text: title, url })
    if (desc && (!title || desc !== title)) out.push({ text: desc, url })
  }

  return out
}

export function buildStoredHeadlinesFromDiscordMessages(messages: DiscordMessage[], limit: number) {
  const cap = Math.max(1, Math.min(200, Math.floor(limit)))
  const raw = Array.isArray(messages) ? messages : []

  const itemsRaw = raw
    .filter(m => !!m)
    .flatMap(m => {
      const createdAt = m && m.timestamp ? String(m.timestamp) : null
      const baseId = m && m.id ? String(m.id) : String(Math.random())
      const author = m && m.author ? { bot: !!m.author.bot, username: m.author.username ? String(m.author.username) : null } : null
      return extractTextsFromMessage(m).map((x, idx) => ({
        id: `${baseId}_${idx}`,
        createdAt,
        text: x.text,
        url: x.url || null,
        author,
      }))
    })
    .filter(x => !!x.text)
    .slice(0, cap)

  const items: StoredHeadline[] = []
  for (const it of itemsRaw) {
    items.push({
      id: it.id,
      createdAt: it.createdAt,
      original: it.text,
      url: it.url,
      author: it.author,
    })
  }
  return items
}

