import dotenv from 'dotenv'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  buildOperationalTelegramCards,
  renderTelegramCardsToPng,
  sendTelegramPhotos,
  sendTelegramMessages,
} from '../telegram-operational.ts'
import { fetchJsonWithTimeout } from '../lib/net.ts'
import { createDotenvReloader } from '../lib/update-service/dotenv-reload.ts'
import { createTelegramWiring } from './telegram.ts'
import { nowISO } from './env.ts'
import { appendLog, fileExists } from './fs.ts'
import { PROJECT_ROOT, resolveFromBase, resolveFromProject } from './paths.ts'
import type { UpdateServiceStores } from './main-wiring-state.ts'
import type { MarketServiceConfig } from './config.ts'

export async function createMainTelegramWiring(params: {
  host: string
  port: number
  baseDir: string
  sourceDataDir: string
  telegram: MarketServiceConfig['telegram']
  stores: UpdateServiceStores
  env: typeof import('./env.ts')['env']
  envBool: typeof import('./env.ts')['envBool']
  envNumber: typeof import('./env.ts')['envNumber']
  envIntOrNull: typeof import('./env.ts')['envIntOrNull']
}) {
  const { host, port, baseDir, sourceDataDir, telegram, stores, env, envBool, envNumber, envIntOrNull } = params

  const dotenvPath = path.join(PROJECT_ROOT, '.env')
  const reloadDotenvIfChanged = createDotenvReloader({
    dotenvPath,
    stat,
    config: opts => {
      dotenv.config(opts)
    },
  })

  const telegramWiring = createTelegramWiring({
    host,
    port,
    baseDir,
    sourceDataDir,
    resolveFromBase,
    resolveFromProject,
    reloadDotenvIfChanged,
    env,
    envBool,
    envNumber,
    envIntOrNull,
    nowISO,
    fileExists,
    readFile: (p, opts) => readFile(p, opts.encoding),
    mkdir: (p, opts) => mkdir(p, opts),
    writeFile: (p, content, opts) => writeFile(p, content, opts.encoding),
    telegram: {
      enabled: telegram.enabled,
      botToken: telegram.botToken,
      chatId: telegram.chatId,
      operationalEnabled: telegram.operationalEnabled,
      operationalThreadId: telegram.operationalThreadId,
      operationalSendOn: telegram.operationalSendOn,
      operationalCooldownMinutes: telegram.operationalCooldownMinutes,
    },
    state: {
      getLastOperationalSentAtMs: () => stores.lastTelegramOperationalSentMs.get(),
      setLastOperationalSentAtMs: ms => {
        stores.lastTelegramOperationalSentMs.set(ms)
      },
    },
    fetchJsonWithTimeout,
    sendTelegramMessages,
    buildOperationalTelegramCards,
    renderTelegramCardsToPng,
    sendTelegramPhotos,
    appendLog,
  })

  await reloadDotenvIfChanged()
  await telegramWiring.fjSentStore.load(Date.now())

  return { telegramWiring, reloadDotenvIfChanged }
}
