import type { Express } from 'express'

import { startCronScheduler } from '../lib/update-service/cron-scheduler.js'

export function startMarketServiceRuntime(deps: {
  app: Express
  host: string
  port: number
  intervalMinutes: number
  intervalMs: number
  logsDir: string
  schedulerEnabled: boolean
  marketScheduleMode: string
  runOnStart: boolean

  telegramFinancialJuiceConfigured: () => boolean
  telegramFinancialJuicePollSeconds: number
  forwardFinancialJuiceToTelegram: () => Promise<{ ok: boolean; error?: string }>

  schedule: { getPending: () => boolean; setPending: (next: boolean) => void }
  runScheduledIfDue: () => Promise<boolean>
}) {
  const warnTelegramFj = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    process.stderr.write(`WARN • Telegram FinancialJuice: ${msg}\n`)
  }

  const onCronDue = () => {
    deps.schedule.setPending(true)
    void deps.runScheduledIfDue()
    void deps.forwardFinancialJuiceToTelegram()
      .then(r => {
        if (!r.ok && r.error !== 'no_items') {
          process.stderr.write(`WARN • Telegram FinancialJuice: ${r.error}\n`)
        }
      })
      .catch(warnTelegramFj)
  }

  const startFinancialJuicePoller = () => {
    const ms = deps.telegramFinancialJuicePollSeconds * 1000
    const t = setInterval(() => {
      if (!deps.telegramFinancialJuiceConfigured()) return
      void deps.forwardFinancialJuiceToTelegram()
        .then(r => {
          if (!r.ok && r.error !== 'no_items' && r.error !== 'disabled_or_not_configured') {
            process.stderr.write(`WARN • Telegram FinancialJuice: ${r.error}\n`)
          }
        })
        .catch(warnTelegramFj)
    }, ms)
    return { stop: () => clearInterval(t) }
  }

  let poller: { stop: () => void } | null = null
  let intervalTimer: NodeJS.Timeout | null = null

  const server = deps.app.listen(deps.port, deps.host, () => {
    process.stdout.write(`Market updater em http://${deps.host}:${deps.port}\n`)
    process.stdout.write(`Intervalo: ${deps.intervalMinutes} min\n`)
    process.stdout.write(`Logs: ${deps.logsDir}\n`)
    if (!deps.schedulerEnabled) {
      process.stdout.write(`Scheduler: desabilitado (MARKET_SCHEDULER_ENABLED=false)\n`)
    } else if (deps.marketScheduleMode === 'cron') {
      process.stdout.write(
        `Scheduler: cron (8:30, a cada ${Math.max(5, Math.min(60, deps.intervalMinutes))}min até 17:00, e 20:00 • seg-sex)\n`,
      )
      deps.schedule.setPending(deps.runOnStart)
      if (deps.schedule.getPending()) void deps.runScheduledIfDue()
      startCronScheduler({
        intervalMinutes: deps.intervalMinutes,
        onDue: onCronDue,
      })
    } else {
      deps.schedule.setPending(deps.runOnStart)
      if (deps.schedule.getPending()) void deps.runScheduledIfDue()
    }

    if (deps.telegramFinancialJuiceConfigured()) {
      poller = startFinancialJuicePoller()
    }
  })

  server.on('error', err => {
    const anyErr = err as NodeJS.ErrnoException
    if (anyErr && anyErr.code === 'EADDRINUSE') {
      process.stderr.write(
        `ERRO • Porta em uso: http://${deps.host}:${deps.port}\n` +
          `- Encerre a outra janela/serviço que já está rodando o market:service\n` +
          `- Ou altere a porta via MARKET_SERVICE_PORT (ex.: set MARKET_SERVICE_PORT=3434)\n`,
      )
      process.exitCode = 1
      return
    }
    process.stderr.write(String(anyErr && (anyErr.stack || anyErr.message) ? anyErr.stack || anyErr.message : anyErr))
    process.exitCode = 1
  })

  if (deps.schedulerEnabled && deps.marketScheduleMode !== 'cron') {
    intervalTimer = setInterval(() => {
      deps.schedule.setPending(true)
      void deps.runScheduledIfDue()
    }, deps.intervalMs)
  }

  return {
    server,
    stop: () => {
      if (poller) poller.stop()
      if (intervalTimer) clearInterval(intervalTimer)
    },
  }
}
