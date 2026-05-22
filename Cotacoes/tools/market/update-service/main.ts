import { loadMarketServiceConfig } from './config.ts'
import { env, envBool, envIntOrNull, envNumber } from './env.ts'
import { createUpdateServiceWiring } from './main-wiring.ts'
import { startUpdateServiceServer } from './main-server.ts'

export async function runUpdateService() {
  const cfg = loadMarketServiceConfig({ env, envBool, envNumber, envIntOrNull })
  const wiring = await createUpdateServiceWiring({ cfg, env, envBool, envNumber, envIntOrNull })
  await startUpdateServiceServer({ cfg, wiring })
}
