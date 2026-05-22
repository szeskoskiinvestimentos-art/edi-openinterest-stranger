import { createUpdateServiceState } from './main-wiring-state.ts'
import { createMainTelegramWiring } from './main-wiring-telegram.ts'
import { createMainUpdateRunner } from './main-wiring-runner.ts'
import { createTelegramWiring } from './telegram.ts'
import { manualCooldownInfo } from '../lib/update-service/manual-cooldown.ts'
import type { MarketServiceConfig } from './config.ts'

export type UpdateServiceWiring = {
  reloadDotenvIfChanged: () => Promise<void>
  telegramWiring: ReturnType<typeof createTelegramWiring>
  manualCooldownInfo: () => ReturnType<typeof manualCooldownInfo>
  shutdown: ReturnType<typeof createUpdateServiceState>['shutdown']
  stores: ReturnType<typeof createUpdateServiceState>['stores']
  runUpdate: (reason: string) => Promise<boolean>
  runScheduledIfDue: () => Promise<boolean>
  nextCronRun: (from: Date) => Date | null
}

export async function createUpdateServiceWiring(params: {
  cfg: MarketServiceConfig
  env: typeof import('./env.ts')['env']
  envBool: typeof import('./env.ts')['envBool']
  envNumber: typeof import('./env.ts')['envNumber']
  envIntOrNull: typeof import('./env.ts')['envIntOrNull']
}): Promise<UpdateServiceWiring> {
  const { cfg, env, envBool, envNumber, envIntOrNull } = params

  const { stores, shutdown } = createUpdateServiceState()

  const telegramInit = await createMainTelegramWiring({
    host: cfg.host,
    port: cfg.port,
    baseDir: cfg.baseDir,
    sourceDataDir: cfg.sourceDataDir,
    telegram: cfg.telegram,
    stores,
    env,
    envBool,
    envNumber,
    envIntOrNull,
  })

  const runner = createMainUpdateRunner({
    cfg,
    stores,
    shutdown,
    env,
    envNumber,
    telegramWiring: telegramInit.telegramWiring,
  })

  return {
    reloadDotenvIfChanged: telegramInit.reloadDotenvIfChanged,
    telegramWiring: telegramInit.telegramWiring,
    manualCooldownInfo: runner.manualCooldownInfo,
    shutdown,
    stores,
    runUpdate: runner.runUpdate,
    runScheduledIfDue: runner.runScheduledIfDue,
    nextCronRun: runner.nextCronRun,
  }
}
