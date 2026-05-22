import type { env as envFn, envBool as envBoolFn, resolveFromProject as resolveFromProjectFn } from './env.js'
import { PROJECT_ROOT } from './env.js'
import { fetchJsonWithTimeout } from '../lib/net.js'
import { updateYahooUsdOptionsCaches as updateYahooUsdOptionsCachesModule } from '../lib/yahoo-usd-options-cache.js'
import { writeJsonAndJs } from './write.js'

export async function updateYahooUsdOptionsCaches(params: {
  resolveFromProject: typeof resolveFromProjectFn
  env: typeof envFn
  envBool: typeof envBoolFn
}) {
  await updateYahooUsdOptionsCachesModule({
    projectRoot: PROJECT_ROOT,
    resolveFromProject: params.resolveFromProject,
    env: params.env,
    envBool: params.envBool,
    fetchJsonWithTimeout,
    writeJsonAndJs,
    log: line => process.stdout.write(`${line}\n`),
    warn: line => process.stderr.write(`${line}\n`),
  })
}

