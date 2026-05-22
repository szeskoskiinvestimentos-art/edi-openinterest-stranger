import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { scrapeDiFromInfoMoney } from '../../investing/di-infomoney.js'
import { mergeDiIntoMarketQuotes, type DiQuote } from '../../market-quotes/merge.js'
import type { BrowserConfig, DiSummary } from '../types.js'
import { setDiUpdatedAtAttempt } from '../state.js'

export async function runDiStep(params: {
  enabled: boolean
  baseDir: string
  outDir: string
  debugDir: string
  headless: boolean
  browser: BrowserConfig
  log: (line: string) => void
  warn: (line: string) => void
}): Promise<DiSummary> {
  const summary: DiSummary = { enabled: params.enabled, status: params.enabled ? 'fail' : 'skip', count: 0 }
  if (!params.enabled) return summary

  const attemptedAt = new Date().toISOString()
  let di: DiQuote[] = []

  try {
    const infoMoneyProfileDir = path.join(params.baseDir, 'infomoney-profile')
    await mkdir(infoMoneyProfileDir, { recursive: true })
    di = await scrapeDiFromInfoMoney({
      debugDir: params.debugDir,
      headless: params.headless,
      userDataDir: infoMoneyProfileDir,
      browser: params.browser,
      log: params.log,
      warn: params.warn,
    })
  } catch (e) {
    summary.status = 'fail'
    summary.error = String(e instanceof Error ? e.message : e)
    process.stderr.write(`WARN • DI InfoMoney indisponível: ${summary.error}\n`)
  }

  summary.count = di.length
  if (di.length) {
    try {
      await mergeDiIntoMarketQuotes(params.outDir, di)
      summary.status = 'ok'
      process.stdout.write(`OK • DI=${di.length} contratos (InfoMoney)\n`)
    } catch (e) {
      summary.status = 'fail'
      summary.error = String(e instanceof Error ? e.message : e)
      process.stderr.write(`WARN • Falha ao mesclar DI no market_quotes: ${summary.error}\n`)
    }
  } else if (summary.status !== 'fail') {
    summary.status = 'fail'
    summary.error = 'DI InfoMoney: lista vazia'
    process.stderr.write('WARN • DI InfoMoney: lista vazia (mantendo último).\n')
  }

  await setDiUpdatedAtAttempt(params.outDir, attemptedAt)

  return summary
}
