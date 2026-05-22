import type { FuturesDeps } from './futures-utils.js'

import { fetchFromFuturesChain } from './zq-curve-yahoo/futures-chain.js'
import { fetchFromSparkFallback } from './zq-curve-yahoo/fallback.js'

export async function fetchZqCurveItemsFromYahoo(deps: FuturesDeps, params: { rootSymbol: string; max: number; timeoutMs: number }) {
  try {
    const items = await fetchFromFuturesChain(deps, params)
    return items
  } catch {
    return []
  }
}

export async function fetchZqCurveItemsFromYahooSparkFallback(
  deps: FuturesDeps,
  params: { max: number; monthsAhead: number; timeoutMs: number },
) {
  return await fetchFromSparkFallback(deps, params)
}
