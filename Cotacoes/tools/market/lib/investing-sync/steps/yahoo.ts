import { writeUsTreasuryFuturesFiles } from '../../market-quotes/us-treasury-futures.js'
import { mergeYahooQuotesIntoMarketQuotes } from '../../market-quotes/yahoo-merge.js'
import { writeZqCurveFiles } from '../../market-quotes/zq-curve.js'
import type { BrowserConfig } from '../types.js'

export async function runYahooStep(params: {
  enabled: boolean
  outDir: string
  maxSymbols: number
  timeoutMs: number
  headless: boolean
  investingUserDataDir: string
  debugDir: string
  browser: BrowserConfig
  deps: {
    env: (key: string, fallback?: string) => string
    envBool: (key: string, fallback: boolean) => boolean
    envNumber: (key: string, fallback: number) => number
    parseList: (raw?: string | null) => string[]
    fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
    fetchJsonPostWithTimeout: <T>(
      url: string,
      timeoutMs: number,
      body: unknown,
      headers?: Record<string, string>,
    ) => Promise<T>
  }
  log: (line: string) => void
}) {
  if (!params.enabled) return

  try {
    await mergeYahooQuotesIntoMarketQuotes(params.outDir, { maxSymbols: params.maxSymbols, timeoutMs: params.timeoutMs }, params.deps)

    try {
      await writeZqCurveFiles(
        params.outDir,
        {
          timeoutMs: params.timeoutMs,
          headless: params.headless,
          investingUserDataDir: params.investingUserDataDir,
          debugDir: params.debugDir,
          log: params.log,
        },
        { env: params.deps.env, envBool: params.deps.envBool, envNumber: params.deps.envNumber, fetchJsonWithTimeout: params.deps.fetchJsonWithTimeout },
      )
    } catch (e) {
      process.stderr.write(`WARN • Falha ao atualizar Curva ZQ: ${String(e instanceof Error ? e.message : e)}\n`)
    }

    try {
      await writeUsTreasuryFuturesFiles(
        params.outDir,
        { timeoutMs: params.timeoutMs },
        { env: params.deps.env, envBool: params.deps.envBool, envNumber: params.deps.envNumber, fetchJsonWithTimeout: params.deps.fetchJsonWithTimeout },
      )
    } catch (e) {
      process.stderr.write(`WARN • Falha ao atualizar Treasuries (futuros): ${String(e instanceof Error ? e.message : e)}\n`)
    }
  } catch (e) {
    process.stderr.write(`WARN • Falha ao atualizar Yahoo Quotes: ${String(e instanceof Error ? e.message : e)}\n`)
  }
}
