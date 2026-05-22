export function stripHtmlToText(html: string) {
  const withoutScripts = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  const withoutTags = withoutScripts.replace(/<[^>]*>/g, ' ')
  const decoded = withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
  return decoded.replace(/\s+/g, ' ').trim()
}

export function parseNumberLoose(raw: string | null | undefined) {
  const s = String(raw || '').trim()
  if (!s) return null
  const cleaned = s.replace(/,/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function parseInvestingUpdatedText(html: string) {
  const m = String(html || '').match(/<div[^>]*class=\"fedUpdate\"[^>]*>\s*Updated:\s*([^<]+)<\/div>/i)
  return m ? String(m[1] || '').trim() : null
}

export function parseInvestingNextMeetingAndRate(html: string) {
  const m = String(html || '').match(
    /<a[^>]+href=\"\/central-banks\/federal-reserve\"[^>]*>\s*FED\s*<\/a>\s*<\/td>\s*<td>\s*([^<]+)\s*<\/td>\s*<td[^>]*class=\"last\"[^>]*>\s*([^<]+)\s*<\/td>/i,
  )
  if (!m) return { currentRateText: null, nextMeetingText: null }
  const currentRateText = String(m[1] || '').trim() || null
  const nextMeetingText = String(m[2] || '').trim() || null
  return { currentRateText, nextMeetingText }
}

export function parseInvestingMeetings(html: string) {
  const out: Array<{ dateText: string; probs: Record<string, number> }> = []
  const chunks = String(html || '').split('class="cardWrapper"')
  for (const chunk of chunks) {
    const dateMatch = chunk.match(/class=\"fedRateDate\"[^>]*>\s*([^<]+)\s*<\/div>/i)
    const dateText = dateMatch ? String(dateMatch[1] || '').trim() : ''
    if (!dateText) continue
    const probs: Record<string, number> = {}
    const rowRx = /<tr>\s*<td[^>]*class=\"left\"[^>]*>\s*([0-9.]+\s*-\s*[0-9.]+)[\s\S]*?<\/td>\s*<td>\s*([0-9.]+)%<\/td>/gi
    let m: RegExpExecArray | null = null
    while ((m = rowRx.exec(chunk))) {
      const range = String(m[1] || '').trim()
      const pct = parseNumberLoose(m[2])
      if (!range || pct === null) continue
      probs[range] = pct
    }
    if (Object.keys(probs).length === 0) continue
    out.push({ dateText, probs })
  }
  return out
}

export function computeDaysRemaining(dateText: string) {
  const t = Date.parse(dateText)
  if (!Number.isFinite(t)) return null
  const diff = t - Date.now()
  return diff > 0 ? Math.floor(diff / (24 * 60 * 60 * 1000)) : 0
}
