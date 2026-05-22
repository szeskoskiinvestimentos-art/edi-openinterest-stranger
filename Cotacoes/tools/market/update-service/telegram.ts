import { createFinancialJuiceSentStore } from '../lib/update-service/fj-sent-store.js'
import { serviceBaseUrl } from '../lib/update-service/http.js'
import { sendTelegramOperationalOnce } from '../lib/update-service/telegram-operational.js'
import { forwardFinancialJuiceToTelegram, telegramFinancialJuiceConfigured } from '../lib/update-service/financialjuice-telegram.js'
import { operationalSessionLabelForNow } from '../lib/update-service/time-brt.js'

export function createTelegramWiring(deps: {
  host: string
  port: number
  baseDir: string
  sourceDataDir: string
  resolveFromBase: (baseDir: string, p: string) => string
  resolveFromProject: (p: string) => string
  reloadDotenvIfChanged: () => Promise<void>
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
  envIntOrNull: (name: string) => number | null
  nowISO: () => string
  fileExists: (p: string) => Promise<boolean>
  readFile: (p: string, opts: { encoding: 'utf-8' }) => Promise<string>
  mkdir: (p: string, opts: { recursive: boolean }) => Promise<unknown>
  writeFile: (p: string, content: string, opts: { encoding: 'utf-8' }) => Promise<unknown>

  telegram: {
    enabled: boolean
    botToken: string
    chatId: string
    operationalEnabled: boolean
    operationalThreadId: number | null
    operationalSendOn: string
    operationalCooldownMinutes: number
  }

  state: {
    getLastOperationalSentAtMs: () => number | null
    setLastOperationalSentAtMs: (ms: number) => void
  }

  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
  sendTelegramMessages: (params: {
    botToken: string
    chatId: string
    messageThreadId?: number | null
    items: Array<{ text: string; disablePreview?: boolean }>
  }) => Promise<{ ok: boolean; error?: string; results?: Array<{ ok: boolean; messageId?: number; error?: string }> }>

  buildOperationalTelegramCards: (...args: any[]) => any
  renderTelegramCardsToPng: (...args: any[]) => any
  sendTelegramPhotos: (...args: any[]) => any
  appendLog: (logPath: string, chunk: string) => Promise<void>
}) {
  const fjSentStore = createFinancialJuiceSentStore({
    baseDir: deps.baseDir,
    resolveFromBase: deps.resolveFromBase,
    env: deps.env,
    envBool: deps.envBool,
    envNumber: deps.envNumber,
    nowISO: deps.nowISO,
    fileExists: deps.fileExists,
    readFile: deps.readFile,
    mkdir: deps.mkdir,
    writeFile: deps.writeFile,
  })

  const sendTelegramOperationalOnceLocal = async (opts: { reason: string; logPath?: string; force?: boolean }) => {
    return await sendTelegramOperationalOnce({
      reason: opts.reason,
      force: opts.force,
      logPath: opts.logPath,
      baseUrl: serviceBaseUrl({ host: deps.host, port: deps.port }),
      sourceDataDir: deps.resolveFromProject(String(deps.sourceDataDir)),
      sessionLabel: operationalSessionLabelForNow(),
      telegram: {
        enabled: deps.telegram.enabled,
        operationalEnabled: deps.telegram.operationalEnabled,
        botToken: deps.telegram.botToken,
        chatId: deps.telegram.chatId,
        threadId: deps.telegram.operationalThreadId,
        sendOn: deps.telegram.operationalSendOn,
        cooldownMinutes: deps.telegram.operationalCooldownMinutes,
      },
      state: {
        getLastSentAtMs: deps.state.getLastOperationalSentAtMs,
        setLastSentAtMs: deps.state.setLastOperationalSentAtMs,
      },
      buildOperationalTelegramCards: deps.buildOperationalTelegramCards,
      renderTelegramCardsToPng: deps.renderTelegramCardsToPng,
      sendTelegramPhotos: deps.sendTelegramPhotos,
      appendLog: deps.appendLog,
    })
  }

  const telegramFinancialJuiceConfiguredLocal = () => {
    return telegramFinancialJuiceConfigured({ env: deps.env, envBool: deps.envBool })
  }

  const forwardFinancialJuiceToTelegramLocal = async (opts?: { bootstrap?: boolean; dryRun?: boolean; maxItems?: number }) => {
    return await forwardFinancialJuiceToTelegram({
      reloadDotenvIfChanged: deps.reloadDotenvIfChanged,
      env: deps.env,
      envBool: deps.envBool,
      envNumber: deps.envNumber,
      envIntOrNull: deps.envIntOrNull,
      baseUrl: serviceBaseUrl({ host: deps.host, port: deps.port }),
      fetchJsonWithTimeout: deps.fetchJsonWithTimeout,
      sendTelegramMessages: deps.sendTelegramMessages,
      sentStore: fjSentStore,
      opts,
    })
  }

  return {
    fjSentStore,
    sendTelegramOperationalOnce: sendTelegramOperationalOnceLocal,
    telegramFinancialJuiceConfigured: telegramFinancialJuiceConfiguredLocal,
    forwardFinancialJuiceToTelegram: forwardFinancialJuiceToTelegramLocal,
  }
}
