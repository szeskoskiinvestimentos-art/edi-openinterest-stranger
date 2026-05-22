const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

function investingHeaders() {
  return {
    Accept: 'text/html,*/*',
    'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
    Referer: 'https://www.investing.com/',
    'User-Agent': UA,
  }
}

export async function fetchInvestingFedRateMonitorHtml(params: {
  timeoutMs: number
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}) {
  const candidates = [
    'https://www.investing.com/central-banks/fed-rate-monitor',
    'https://m.investing.com/central-banks/fed-rate-monitor',
  ]
  const errors: string[] = []
  for (const url of candidates) {
    try {
      const html = await params.fetchTextWithTimeout(url, params.timeoutMs, investingHeaders())
      return { url, html }
    } catch (e) {
      errors.push(`${url}: ${String(e instanceof Error ? e.message : e)}`)
    }
  }
  throw new Error(errors.join(' | '))
}
