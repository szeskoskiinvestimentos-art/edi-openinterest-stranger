import path from 'node:path'

import { mkdir } from 'node:fs/promises'

import { parseArgs } from '../lib/args.js'
import { fetchTextWithTimeout } from '../lib/net.js'
import { resolveDefaultCsvPath } from '../lib/watchlist-csv.js'
import { buildMarketHistory } from '../market-history.js'

import { PROJECT_ROOT, env, envBool, resolveFromProject } from './env.js'
import { runAddons } from './addons.js'
import { tryMergeSinaDceI0 } from './sina.js'

export async function runBuildMarketHistory(argv: string[]) {
  const args = parseArgs(argv)

  const outDir = resolveFromProject(
    (args.out as string) || path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'assets', 'data'),
  )
  await mkdir(outDir, { recursive: true })

  const intervalMinutes = Number(args.interval || 30)
  const retentionDays = Number(args.retentionDays || 5)
  const timestamp = args.timestamp as string | undefined

  if (args.addonsOnly === true) {
    await runAddons({ outDir, env, envBool, includePdf: true })
    return
  }

  const csvPath = resolveFromProject((args.csv as string) || (await resolveDefaultCsvPath(PROJECT_ROOT)))
  await buildMarketHistory({ csvPath, outDir, intervalMinutes, retentionDays, timestamp })

  await tryMergeSinaDceI0({
    enabled: envBool('SINA_DCE_IO_ENABLED', true),
    outDir,
    env,
    fetchTextWithTimeout,
  })

  await runAddons({ outDir, env, envBool, includePdf: true })
}
