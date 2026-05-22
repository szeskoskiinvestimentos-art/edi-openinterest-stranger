import path from 'node:path'
import { mkdir, readFile } from 'node:fs/promises'

import { fetchJsonWithTimeout, fetchTextWithTimeout } from '../lib/net.js'
import { exportDashboardsPdfBundle } from '../lib/pdf-export.js'
import { buildOptionsGammaSummary as buildOptionsGammaSummaryModule } from '../lib/options-gamma-summary.js'
import { buildWebNewsModule as buildWebNewsModuleModule } from '../lib/web-news-module.js'
import { buildForeignFlowFromScrape as buildForeignFlowFromScrapeModule } from '../lib/foreign-flow.js'
import { buildFocusSummaryFromBcb as buildFocusSummaryFromBcbModule } from '../lib/focus-summary.js'
import { buildFedWatchRatesFromInvesting as buildFedWatchRatesFromInvestingModule } from '../lib/fedwatch.js'
import { buildPetrobrasModule } from '../lib/petrobras-module.js'
import type { WebNewsModule } from '../lib/petrobras-module.js'

import { PROJECT_ROOT, resolveFromProject } from './env.js'
import { updateYahooUsdOptionsCaches } from './yahoo-usd-options.js'
import { writeJsonAndJs } from './write.js'

export async function runAddons(params: {
  outDir: string
  env: (key: string, fallback?: string) => string
  envBool: (key: string, fallback: boolean) => boolean
  includePdf: boolean
  webNewsOverride?: unknown | null
}) {
  await mkdir(params.outDir, { recursive: true })

  let webNewsPayload: unknown = params.webNewsOverride ?? null
  try {
    const payload = await buildOptionsGammaSummaryModule({ projectRoot: PROJECT_ROOT, resolveFromProject, env: params.env })
    await writeJsonAndJs(params.outDir, 'options_gamma_summary', 'OPTIONS_GAMMA_SUMMARY_DATA', payload)
    process.stdout.write('OK • options_gamma_summary.json\n')
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar options_gamma_summary.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  await updateYahooUsdOptionsCaches({ resolveFromProject, env: params.env, envBool: params.envBool })

  if (params.webNewsOverride === undefined) {
    try {
      const payload = await buildWebNewsModuleModule({ env: params.env, fetchTextWithTimeout })
      webNewsPayload = payload
      await writeJsonAndJs(params.outDir, 'web_news_module', 'WEB_NEWS_MODULE_DATA', payload)
      process.stdout.write('OK • web_news_module.json\n')
    } catch (e) {
      process.stderr.write(`WARN • Falha ao gerar web_news_module.json: ${String(e instanceof Error ? e.message : e)}\n`)
    }
  }

  try {
    const payload = await buildForeignFlowFromScrapeModule({ outDir: params.outDir, env: params.env, envBool: params.envBool, fetchTextWithTimeout })
    await writeJsonAndJs(params.outDir, 'foreign_flow', 'FOREIGN_FLOW_DATA', payload)
    if ((payload as any).ok === true) process.stdout.write('OK • foreign_flow.json\n')
    else process.stderr.write(`WARN • foreign_flow indisponível: ${(payload as any).message}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar foreign_flow.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  try {
    const payload = await buildFocusSummaryFromBcbModule({ outDir: params.outDir, fetchJsonWithTimeout, fetchTextWithTimeout })
    await writeJsonAndJs(params.outDir, 'focus_summary', 'FOCUS_SUMMARY_DATA', payload)
    if ((payload as any).ok === true) process.stdout.write('OK • focus_summary.json\n')
    else process.stderr.write(`WARN • focus_summary indisponível: ${(payload as any).message}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar focus_summary.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  try {
    const payload = await buildFedWatchRatesFromInvestingModule({ timeoutMs: 9000, fetchTextWithTimeout })
    await writeJsonAndJs(params.outDir, 'fed_watch_rates', 'FED_WATCH_RATES_DATA', payload)
    if ((payload as any).ok === true) process.stdout.write('OK • fed_watch_rates.json\n')
    else process.stderr.write(`WARN • fed_watch_rates indisponível: ${(payload as any).message}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar fed_watch_rates.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  try {
    const jsonPath = path.join(params.outDir, 'market_quotes.json')
    const raw = await readFile(jsonPath, 'utf-8')
    const market = JSON.parse(raw)
    const payload = buildPetrobrasModule({
      market,
      webNews: webNewsPayload && typeof webNewsPayload === 'object' ? (webNewsPayload as WebNewsModule) : null,
    })
    await writeJsonAndJs(params.outDir, 'petrobras_module', 'PETROBRAS_MODULE_DATA', payload)
    process.stdout.write('OK • petrobras_module.json\n')
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar petrobras_module.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  if (params.includePdf) {
    await exportDashboardsPdfBundle({
      projectRoot: PROJECT_ROOT,
      resolveFromProject,
      env: params.env,
      envBool: params.envBool,
      log: line => process.stdout.write(`${line}\n`),
      warn: line => process.stderr.write(`${line}\n`),
    })
  }
}

