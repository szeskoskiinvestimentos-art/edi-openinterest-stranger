import dotenv from 'dotenv'
import { runBuildMarketHistory } from './build-market-history/main.ts'

const DOTENV_OVERRIDE = (() => {
  const raw = String(process.env.DOTENV_OVERRIDE || '').trim().toLowerCase()
  if (!raw) return true
  if (raw === '0' || raw === 'false' || raw === 'no' || raw === 'off') return false
  if (raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on') return true
  return true
})()

dotenv.config({ override: DOTENV_OVERRIDE, quiet: true })

async function main() {
  await runBuildMarketHistory(process.argv.slice(2))
}

main().catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
