import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { FuturesDeps } from './futures-utils.js'
import { DEFAULT_US_TSY_FUTURES_EXTRAS, DEFAULT_US_TSY_FUTURES_ROOTS, extraLabelBySymbol, tenorByRoot } from './us-treasury-futures-config.js'
import {
  fillMissingRootsFromSpark,
  fetchExtrasFromSpark,
  fetchFrontContractPerRoot,
} from './us-treasury-futures-yahoo.js'
import {
  applySignalScores,
  computeAvgChangePct,
  computeCreditVsTreasury,
  computeRiskMode,
  computeShape,
  computeSlopeChangePct,
} from './us-treasury-futures-signals.js'
import { buildUsTsyFuturesPayload } from './us-treasury-futures-types.js'

export async function writeUsTreasuryFuturesFiles(outDir: string, opts: { timeoutMs: number }, deps: FuturesDeps) {
  const enabled = deps.envBool('MARKET_US_TSY_FUTURES_ENABLED', true)
  if (!enabled) return

  const timeoutMs = opts.timeoutMs
  const rootsRaw = deps.env('MARKET_US_TSY_FUTURES_ROOTS', DEFAULT_US_TSY_FUTURES_ROOTS) || DEFAULT_US_TSY_FUTURES_ROOTS
  const roots = String(rootsRaw || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const items = await fetchFrontContractPerRoot(deps, { roots, timeoutMs, tenorByRoot })
  await fillMissingRootsFromSpark(deps, { roots, items, timeoutMs, tenorByRoot })
  const avgChangePct = computeAvgChangePct(items)
  const slopeChangePct = computeSlopeChangePct(items)
  const riskMode = computeRiskMode(avgChangePct)
  const shape = computeShape(slopeChangePct)

  const extrasRaw = deps.env('MARKET_US_TSY_FUTURES_EXTRAS', DEFAULT_US_TSY_FUTURES_EXTRAS)
  const extraSymbols = String(extrasRaw || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const extras = await fetchExtrasFromSpark(deps, { symbols: extraSymbols, timeoutMs, labelBySymbol: extraLabelBySymbol })
  const volWeight = Math.max(0, Math.min(2, deps.envNumber('MARKET_US_TSY_FUTURES_VOL_WEIGHT', 0.35)))
  applySignalScores({ extras, volWeight })
  const creditVsTreasury = computeCreditVsTreasury(extras)

  const payload = buildUsTsyFuturesPayload({
    roots,
    items,
    extras,
    creditVsTreasury,
    avgChangePct,
    slopeChangePct,
    riskMode,
    shape,
  })

  await writeFile(path.join(outDir, 'us_tsy_futures.json'), JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'us_tsy_futures.js'), `window.US_TSY_FUTURES_DATA=${JSON.stringify(payload)};`, 'utf-8')
}
