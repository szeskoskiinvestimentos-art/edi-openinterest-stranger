import path from 'node:path'

import { parseArgs } from '../lib/args.js'
import { openForLogin, openInfoMoneyForLogin } from '../lib/investing/login.js'
import { env, envNumber } from '../lib/investing-sync/env.js'
import { investingBrowserConfig } from './browser.js'
import { logStdout } from './log.js'
import { defaultAutomationDir, requireInsideWorkspace, resolveFromBase, resolveFromProject } from './paths.js'
import { runOnce } from './run-once.js'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function runInvestingSyncCli(argv: string[]) {
  const args = parseArgs(argv)
  const mode = (args.mode as string) || 'once'

  const baseDir = requireInsideWorkspace('MARKET_AUTOMATION_DIR', resolveFromProject(env('MARKET_AUTOMATION_DIR', defaultAutomationDir())))
  const userDataDir = requireInsideWorkspace(
    'INVESTING_USER_DATA_DIR',
    resolveFromBase(baseDir, env('INVESTING_USER_DATA_DIR', path.join(baseDir, 'investing-profile'))),
  )
  const url =
    env('INVESTING_PORTFOLIO_URL') || 'https://br.investing.com/portfolio/?portfolioID=ZWY2YGY0Mmo3YWFsZjc1NA%3D%3D'

  if (mode === 'login') {
    await openForLogin({ userDataDir, url, browser: investingBrowserConfig(), log: logStdout })
    return
  }

  if (mode === 'calendar-login') {
    const calUrl =
      env('INVESTING_ECONOMIC_CALENDAR_URL') ||
      'https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone,timeselector,filters&countries=110,32,6,37,5,39,35,7,72&calType=day&timeZone=12&lang=12'
    await openForLogin({ userDataDir, url: calUrl, browser: investingBrowserConfig(), log: logStdout })
    return
  }

  if (mode === 'infomoney-login') {
    const infoMoneyProfileDir = path.join(baseDir, 'infomoney-profile')
    await openInfoMoneyForLogin({ userDataDir: infoMoneyProfileDir, browser: investingBrowserConfig(), log: logStdout })
    return
  }

  if (mode === 'daemon') {
    const minutes = envNumber('MARKET_INTERVAL_MINUTES', 15)
    while (true) {
      const startedAt = new Date()
      process.stdout.write(`RUN • ${startedAt.toISOString()}\n`)
      try {
        await runOnce('once')
      } catch (e) {
        process.stderr.write(String(e instanceof Error ? e.stack || e.message : e) + '\n')
      }
      await sleep(Math.max(5, minutes) * 60 * 1000)
    }
  }

  await runOnce(mode)
}
