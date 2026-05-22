import { main } from './investing-sync-runner.js'

main().catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
