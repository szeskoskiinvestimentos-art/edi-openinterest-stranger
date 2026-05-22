import { fmtMonthYearFromUnixSec, type FuturesDeps } from '../futures-utils.js'
import type { ZqCurveItem } from '../zq-curve-types.js'

import { extractLastTwoCloses, fetchSpark, toVertexCandidates } from './spark.js'

export async function fetchFromSparkFallback(
  deps: FuturesDeps,
  params: { max: number; monthsAhead: number; timeoutMs: number },
): Promise<ZqCurveItem[]> {
  const { candidates, monthCodes } = toVertexCandidates({ monthsAhead: params.monthsAhead })
  const items: ZqCurveItem[] = []

  const chunkSize = 80
  for (let i = 0; i < candidates.length; i += chunkSize) {
    const batch = candidates.slice(i, i + chunkSize)
    const got = await fetchSpark(deps, { symbols: batch, timeoutMs: params.timeoutMs })
    for (const sym of batch) {
      const chart = got.get(sym) || null
      const extracted = extractLastTwoCloses(chart)
      const last = extracted.last
      const prev = extracted.prev
      if (last === null) continue
      const base = sym.split('.')[0]
      const mCode = base.slice(2, 3)
      const yy = Number(base.slice(3, 5))
      const month = monthCodes.indexOf(mCode)
      if (month < 0 || !Number.isFinite(yy)) continue
      const year = 2000 + yy
      const exp = Math.floor(Date.UTC(year, month, 1) / 1000)
      const dayChange = prev !== null ? last - prev : null
      const dayChangePct = prev !== null && prev !== 0 ? ((last - prev) / prev) * 100 : null
      items.push({
        vertex: base,
        yahooSymbol: sym,
        expiration: exp,
        expirationFmt: fmtMonthYearFromUnixSec(exp),
        lastPrice: last,
        impliedRatePct: 100 - last,
        dayChange,
        dayChangePct,
      })
      if (items.length >= params.max) break
    }
    if (items.length >= params.max) break
  }
  return items
}
