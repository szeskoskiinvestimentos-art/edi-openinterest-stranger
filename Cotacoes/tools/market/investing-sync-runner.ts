import * as dotenv from 'dotenv'
import { runInvestingSyncCli } from './investing-sync-runner/cli.js'

dotenv.config({ override: true, quiet: true })

export async function main() {
  await runInvestingSyncCli(process.argv.slice(2))
}
