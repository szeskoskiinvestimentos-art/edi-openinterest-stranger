function decodeXmlEntities(s: string) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_m, n) => {
      const code = Number(n)
      return Number.isFinite(code) ? String.fromCharCode(code) : ''
    })
}

export function parseRssItems(xml: string) {
  const items = String(xml || '').match(/<item\b[\s\S]*?<\/item>/gi) || []
  const out: Array<{ title: string; link: string; pubDate: string | null; source: string | null }> = []

  const tag = (block: string, name: string) => {
    const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i')
    const m = block.match(re)
    return m ? decodeXmlEntities(m[1]).trim() : ''
  }

  for (const it of items) {
    const title = tag(it, 'title')
    const link = tag(it, 'link')
    const pubDate = tag(it, 'pubDate') || null
    const source = tag(it, 'source') || null
    if (!title || !link) continue
    out.push({ title, link, pubDate, source })
  }
  return out
}
