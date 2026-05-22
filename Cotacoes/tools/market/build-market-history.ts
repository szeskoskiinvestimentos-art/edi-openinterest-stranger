import 'dotenv/config'
import { runBuildMarketHistory } from './build-market-history/main.js'

runBuildMarketHistory(process.argv.slice(2)).catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
