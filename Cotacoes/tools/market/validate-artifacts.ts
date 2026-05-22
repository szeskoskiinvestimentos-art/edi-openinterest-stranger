import 'dotenv/config'
import { runValidateArtifacts } from './validate-artifacts/main.ts'

runValidateArtifacts(process.argv.slice(2)).catch((err: unknown) => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
