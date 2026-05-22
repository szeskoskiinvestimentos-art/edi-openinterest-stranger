export type SinaHqQuote = {
  name: string | null
  price: number
  basePrice: number | null
  change: number | null
  changePct: number | null
  time: string | null
  date: string | null
}

export function parseSinaHqVar(raw: string): SinaHqQuote | null {
  const m = String(raw || '').match(/var\s+hq_str_[^=]+="([^"]*)"/)
  if (!m) return null
  const payload = String(m[1] || '')
  if (!payload) return null
  const parts = payload.split(',')
  if (!parts.length) return null

  const name = String(parts[0] || '').trim() || null
  const timeRaw = String(parts[1] || '').trim()
  const time = /^\d{6}$/.test(timeRaw) ? `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}:${timeRaw.slice(4, 6)}` : null
  const date =
    parts
      .map(x => String(x || '').trim())
      .find(x => /^\d{4}-\d{2}-\d{2}$/.test(x)) || null

  const p8 = Number(parts[8])
  const p7 = Number(parts[7])
  const price = Number.isFinite(p8) ? p8 : Number.isFinite(p7) ? p7 : NaN
  if (!Number.isFinite(price)) return null

  const prevSettlement = Number(parts[10])
  const prevFallback = Number(parts[9])
  const prevClose = Number(parts[5])
  const baseCandidate =
    Number.isFinite(prevSettlement) && prevSettlement !== 0
      ? prevSettlement
      : Number.isFinite(prevClose) && prevClose !== 0
        ? prevClose
        : prevFallback
  const basePrice = Number.isFinite(baseCandidate) && baseCandidate !== 0 ? baseCandidate : null

  const changeRaw = basePrice !== null ? price - basePrice : Number(parts[9])
  const change = Number.isFinite(changeRaw) && changeRaw !== 0 ? changeRaw : null
  const changePctRaw = basePrice !== null && basePrice !== 0 ? ((price - basePrice) / basePrice) * 100 : NaN
  const changePct = Number.isFinite(changePctRaw) && changePctRaw !== 0 ? changePctRaw : null

  return {
    name,
    price,
    basePrice,
    change,
    changePct,
    time,
    date,
  }
}

export async function fetchSinaHqQuote(params: {
  code: string
  timeoutMs: number
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}): Promise<SinaHqQuote | null> {
  const code = String(params.code || '').trim()
  if (!code) return null
  const hqUrl = `https://hq.sinajs.cn/list=${encodeURIComponent(code)}`
  const hqRaw = await params.fetchTextWithTimeout(hqUrl, params.timeoutMs, {
    'User-Agent': 'Mozilla/5.0',
    Referer: 'https://gu.sina.cn/ft/hq/nf.php?symbol=i0',
  })
  return parseSinaHqVar(hqRaw)
}
