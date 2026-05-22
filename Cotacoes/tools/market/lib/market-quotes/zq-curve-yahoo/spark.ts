import { type FuturesDeps, type YahooSparkResponseLike } from '../futures-utils.js'

export type SparkLike = { indicators?: { quote?: Array<{ close?: Array<number | null> }> }; timestamp?: number[] }

export function toVertexCandidates(params: { monthsAhead: number }) {
  const monthCodes = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z']
  const toVertex = (d: Date) => {
    const m = d.getUTCMonth()
    const y = d.getUTCFullYear() % 100
    return `ZQ${monthCodes[m]}${String(y).padStart(2, '0')}`
  }

  const candidates: string[] = []
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  for (let i = 0; i < params.monthsAhead; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))
    candidates.push(`${toVertex(d)}.CBT`)
  }
  return { candidates, monthCodes }
}

export function extractLastTwoCloses(chart: SparkLike | null) {
  const closes =
    chart && chart.indicators && chart.indicators.quote && chart.indicators.quote[0] ? chart.indicators.quote[0].close || [] : []
  let last: number | null = null
  let prev: number | null = null
  for (let i = closes.length - 1; i >= 0; i--) {
    const v = closes[i]
    if (typeof v === 'number' && Number.isFinite(v)) {
      if (last === null) last = v
      else {
        prev = v
        break
      }
    }
  }
  return { last, prev }
}

export async function fetchSpark(
  deps: FuturesDeps,
  params: { symbols: string[]; timeoutMs: number },
): Promise<Map<string, SparkLike>> {
  const out = new Map<string, SparkLike>()
  if (!params.symbols.length) return out
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(params.symbols.join(','))}&range=5d&interval=1d`
  try {
    const data = await deps.fetchJsonWithTimeout<YahooSparkResponseLike>(url, Math.max(1500, params.timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Referer: 'https://finance.yahoo.com/',
    })
    const res = data && data.spark && Array.isArray(data.spark.result) ? data.spark.result : []
    for (const it of res) {
      const s = String(it && it.symbol ? it.symbol : '').trim()
      if (!s) continue
      const resp0 = it && it.response && Array.isArray(it.response) && it.response.length ? (it.response[0] as unknown) : null
      if (!resp0) continue
      out.set(s, resp0 as SparkLike)
    }
    return out
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    const isBadRequest = /^HTTP\s+400\b/.test(msg)
    if (!isBadRequest || params.symbols.length <= 1) return out
    const mid = Math.ceil(params.symbols.length / 2)
    const left = await fetchSpark(deps, { ...params, symbols: params.symbols.slice(0, mid) })
    const right = await fetchSpark(deps, { ...params, symbols: params.symbols.slice(mid) })
    for (const [k, v] of left.entries()) out.set(k, v)
    for (const [k, v] of right.entries()) out.set(k, v)
    return out
  }
}
