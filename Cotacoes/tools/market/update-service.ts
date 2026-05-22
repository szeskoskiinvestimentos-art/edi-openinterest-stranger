import 'dotenv/config'
import { runUpdateService } from './update-service/main.ts'

runUpdateService().catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
