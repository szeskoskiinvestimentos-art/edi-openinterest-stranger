import path from 'node:path'

import { mkdir } from 'node:fs/promises'

import { parseArgs } from '../lib/args.js'
import { fetchJsonPostWithTimeout, fetchJsonWithTimeout, fetchTextWithTimeout } from '../lib/net.js'
import { resolveDefaultCsvPath } from '../lib/watchlist-csv.js'
import { buildMarketHistory } from '../market-history.js'
import { mergeYahooQuotesIntoMarketQuotes } from '../lib/market-quotes/yahoo-merge.js'

import { PROJECT_ROOT, env, envBool, resolveFromProject } from './env.js'
import { runAddons } from './addons.js'
import { tryMergeSinaDceI0 } from './sina.js'
import { requireInsideWorkspace } from '../update-service/paths.js'

const envNumber = (key: string, fallback: number) => {
  const raw = process.env[key]
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

const parseList = (raw?: string | null) =>
  Array.from(
    new Set(
      String(raw || '')
        .split(/[\n,;]+/g)
        .map(s => s.trim())
        .filter(Boolean),
    ),
  )

export async function runBuildMarketHistory(argv: string[]) {
  const args = parseArgs(argv)

  const outDirCandidate = resolveFromProject(
    (args.out as string) || path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'assets', 'data'),
  )
  const outDir = requireInsideWorkspace('OUT_DIR', outDirCandidate)
  await mkdir(outDir, { recursive: true })

  const intervalMinutes = Number(args.interval || 30)
  const retentionDays = Number(args.retentionDays || 5)
  const timestamp = args.timestamp as string | undefined

  if (args.addonsOnly === true) {
    await runAddons({ outDir, env, envBool, includePdf: true })
    return
  }

  const csvPathCandidate = resolveFromProject((args.csv as string) || (await resolveDefaultCsvPath(PROJECT_ROOT)))
  const csvPath = requireInsideWorkspace('CSV_PATH', csvPathCandidate)
  await buildMarketHistory({ csvPath, outDir, intervalMinutes, retentionDays, timestamp })

  await tryMergeSinaDceI0({
    enabled: envBool('SINA_DCE_IO_ENABLED', true),
    outDir,
    env,
    fetchTextWithTimeout,
  })

  if (envBool('MARKET_YAHOO_ENABLED', true)) {
    try {
      await mergeYahooQuotesIntoMarketQuotes(
        outDir,
        { maxSymbols: Math.max(1, Math.trunc(envNumber('MARKET_YAHOO_MAX_SYMBOLS', 320))), timeoutMs: Math.max(1500, envNumber('MARKET_YAHOO_TIMEOUT_MS', 8000)) },
        {
          env,
          envBool,
          envNumber,
          parseList,
          fetchJsonWithTimeout,
          fetchJsonPostWithTimeout,
        },
      )
    } catch (e) {
      const msg = e instanceof Error ? (e.stack || e.message) : String(e)
      process.stderr.write(`WARN • Falha ao atualizar Yahoo/TradingView: ${msg}\n`)
    }
  }

  await runAddons({ outDir, env, envBool, includePdf: true })
}
