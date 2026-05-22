import { fetchRawWithTimeout } from '../net.js'

export type YahooCrumbSession = {
  cookieHeader: string
  crumb: string
  fetchedAtMs: number
}

const YAHOO_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

let cachedYahooCrumb: YahooCrumbSession | null = null

export function isLikelyInvalidCrumbError(e: unknown) {
  const msg = String(e instanceof Error ? e.message : e)
  return msg.includes('Invalid Crumb') || (msg.includes('HTTP 401') && msg.includes('Unauthorized'))
}

function cookiePairFromSetCookieHeader(raw: string, name: string) {
  const rx = new RegExp(`(?:^|,|;|\\s)${name}=([^;\\s,]+)`, 'i')
  const m = String(raw || '').match(rx)
  if (!m) return null
  const v = String(m[1] || '').trim()
  if (!v) return null
  return `${name}=${v}`
}

function cookieHeaderFromSetCookies(setCookies: string[]) {
  const all = setCookies.join(' ; ')
  const b = cookiePairFromSetCookieHeader(all, 'B')
  const a1 = cookiePairFromSetCookieHeader(all, 'A1')
  const a3 = cookiePairFromSetCookieHeader(all, 'A3')
  const guc = cookiePairFromSetCookieHeader(all, 'GUC')
  const parts = [b, a1, a3, guc].filter(Boolean) as string[]
  if (!parts.length) return null
  return parts.join('; ')
}

export function withCrumb(url: string, crumb: string) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}crumb=${encodeURIComponent(crumb)}`
}

export async function getYahooCrumbSession(timeoutMs: number): Promise<YahooCrumbSession> {
  const cached = cachedYahooCrumb
  if (cached && Date.now() - cached.fetchedAtMs < 6 * 60 * 60 * 1000) return cached

  const landing = await fetchRawWithTimeout({
    url: 'https://fc.yahoo.com/',
    timeoutMs: Math.max(1500, timeoutMs),
    method: 'GET',
    headers: { 'User-Agent': YAHOO_UA, Accept: 'text/html,*/*' },
  })
  const cookieHeader = cookieHeaderFromSetCookies(landing.setCookie || [])
  if (!cookieHeader) throw new Error('Yahoo crumb: cookie ausente')

  const crumbRes = await fetchRawWithTimeout({
    url: 'https://query1.finance.yahoo.com/v1/test/getcrumb',
    timeoutMs: Math.max(1500, timeoutMs),
    method: 'GET',
    headers: {
      'User-Agent': YAHOO_UA,
      Accept: 'text/plain,*/*',
      Referer: 'https://finance.yahoo.com/',
      Cookie: cookieHeader,
    },
  })
  if (!crumbRes.ok) throw new Error(`Yahoo crumb: HTTP ${crumbRes.status}`)
  const crumb = String(crumbRes.text || '').trim()
  if (!crumb || crumb.includes('<')) throw new Error('Yahoo crumb: inválido')

  cachedYahooCrumb = { cookieHeader, crumb, fetchedAtMs: Date.now() }
  return cachedYahooCrumb
}

export function yahooUa() {
  return YAHOO_UA
}

