export function isInvestingPortfolioUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return false
  try {
    const u = new URL(raw)
    const host = u.hostname.toLowerCase()
    if (!host.endsWith('investing.com')) return false
    return /^\/portfolio\/?$/i.test(u.pathname) || /^\/portfolio\/.+/i.test(u.pathname)
  } catch {
    return /(^|\/)portfolio(\/|$)/i.test(raw)
  }
}

export function isInvestingNewsLikeUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return false
  try {
    const u = new URL(raw)
    const host = u.hostname.toLowerCase()
    if (!host.endsWith('investing.com')) return false
    return /^\/news(\/|$)/i.test(u.pathname) || /^\/analysis(\/|$)/i.test(u.pathname)
  } catch {
    const s = raw.replace(/\\/g, '/')
    return /(^|\/)news(\/|$)/i.test(s) || /(^|\/)analysis(\/|$)/i.test(s)
  }
}

export function brInvestingPortfolioUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return raw
  if (raw.startsWith('https://www.investing.com/portfolio')) return raw.replace('https://www.investing.com', 'https://br.investing.com')
  if (raw.startsWith('https://investing.com/portfolio')) return raw.replace('https://investing.com', 'https://br.investing.com')
  return raw
}

