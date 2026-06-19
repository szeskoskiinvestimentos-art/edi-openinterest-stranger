import path from 'node:path'

import type { ControleDeDadosSnapshot } from './types.js'
import { readLogTail, readMarketDownloadSignalsFromLog } from './log.js'
import { tryReadMarketDataSummary } from './market-data.js'
import { listRecentFiles } from './fs-helpers.ts'
import { buildCotacoesDataFiles } from './cotacoes-section.ts'
import { buildBarchartCsvDolarSummary, buildBarchartCsvIndiceSummary } from './options-section.ts'
import {
  buildYahooCompare,
  buildYahooCoverageFromAudit,
  readForeignFlow,
  readMarketQuotesFile,
  readYahooAuditFile,
  readZqCurve,
} from './market-extras.ts'
import { buildState } from './state-section.ts'
import { buildSinaSection } from './sina-section.ts'
import { buildTradingViewSection } from './tradingview-section.ts'
import { buildPublishSection } from './publish-section.ts'

export async function buildControleDeDadosSnapshot(input: {
  nowISO: () => string
  workspaceRoot: string
  marketStatus?: unknown
  logPath?: string | null
  gitSyncStatus?: string | null
}): Promise<ControleDeDadosSnapshot> {
  const wdoJson = path.resolve(input.workspaceRoot, 'dashboard_unificado', 'WDO', 'assets', 'data', 'market_data.json')
  const winJson = path.resolve(input.workspaceRoot, 'dashboard_unificado', 'WIN', 'assets', 'data', 'market_data.json')
  const assetsDataDir = path.resolve(input.workspaceRoot, 'Cotacoes', 'dashboard', 'MERCADO', 'assets', 'data')
  const autoB3Root = path.resolve(input.workspaceRoot, 'Auto_B3_System')
  const [wdo, win, downloads, logTail, wdoCsv, idxCsv, cotLogs, optLogs, dataFiles, marketQuotesFile, yahooAuditFile, zqCurve, foreignFlow, publish] =
    await Promise.all([
    tryReadMarketDataSummary(wdoJson),
    tryReadMarketDataSummary(winJson),
    input.logPath ? readMarketDownloadSignalsFromLog(input.logPath) : Promise.resolve(null),
    input.logPath ? readLogTail(input.logPath, 80) : Promise.resolve(null),
    buildBarchartCsvDolarSummary({ workspaceRoot: input.workspaceRoot }),
    buildBarchartCsvIndiceSummary({ workspaceRoot: input.workspaceRoot }),
    listRecentFiles(path.resolve(input.workspaceRoot, 'Cotacoes', '.edi-market-guardin', 'logs'), 10),
    listRecentFiles(path.resolve(autoB3Root, 'Debug'), 10),
    buildCotacoesDataFiles({ workspaceRoot: input.workspaceRoot }),
    readMarketQuotesFile({ assetsDataDir }),
    readYahooAuditFile({ assetsDataDir }),
    readZqCurve({ assetsDataDir }),
    readForeignFlow({ assetsDataDir }),
    buildPublishSection({ workspaceRoot: input.workspaceRoot }),
  ])

  const gitFromLog = downloads?.git_sync?.detail ? String(downloads.git_sync.detail) : null

  const wdoOk = wdoCsv.ok && wdoCsv.files_total > 0
  const idxOk = idxCsv.ok && idxCsv.files_total > 0
  const optionsExitCode = wdoOk && idxOk ? 0 : (wdoOk || idxOk ? 1 : null)

  const mqMetaBase = marketQuotesFile && marketQuotesFile.meta ? marketQuotesFile.meta : {}
  const auditRaw = yahooAuditFile ? yahooAuditFile.raw : null
  const yahooCoverage = buildYahooCoverageFromAudit({ auditRaw })
  const mqMeta = {
    ...(mqMetaBase && typeof mqMetaBase === 'object' ? mqMetaBase : {}),
    ...(yahooCoverage ? { yahooCoverage, yahooUpdatedAt: yahooCoverage.lastRunAt || null } : {}),
  }

  const yahooCompare =
    marketQuotesFile && auditRaw ? buildYahooCompare({ marketQuotes: { meta: mqMeta, series: marketQuotesFile.series }, auditRaw }) : null

  const auditMissing =
    auditRaw && Array.isArray(auditRaw.items) ? auditRaw.items.filter((it: any) => String(it && it.status).toLowerCase() !== 'updated') : []

  const tradingview =
    marketQuotesFile
      ? await buildTradingViewSection({
          workspaceRoot: input.workspaceRoot,
          marketQuotesMeta: mqMeta,
          marketQuotesSeries: marketQuotesFile.series,
          marketQuotesFs: { path: marketQuotesFile.path, mtime: marketQuotesFile.mtime, mtime_fmt: marketQuotesFile.mtime_fmt },
        })
      : { exists: false }

  const sina = marketQuotesFile ? buildSinaSection({ marketQuotesSeries: marketQuotesFile.series }) : { present: false, last: null }

  return {
    generated_at: input.nowISO(),
    root_dir: input.workspaceRoot,
    state: buildState({
      logPath: input.logPath ?? null,
      gitSyncStatus: input.gitSyncStatus ?? gitFromLog ?? null,
      publish: { ok: publish ? publish.ok : null, error: publish ? publish.error : null },
      optionsExitCode,
      wdoLastUpdated: wdo?.lastUpdated ?? null,
      winLastUpdated: win?.lastUpdated ?? null,
    }),
    cotacoes: {
      market_status: input.marketStatus,
      last_log_hint: null,
      log_tail: logTail,
      data_files: dataFiles,
      downloads,
    },
    options: {
      last_log_hint: null,
      wdo_expected_contracts: wdoCsv.expected_contracts,
      csv_dolar: {
        dir: wdoCsv.dir,
        files_total: wdoCsv.files_total,
        latest_by_prefix: wdoCsv.latest_by_prefix,
        missing_prefixes: wdoCsv.missing_prefixes,
      },
      csv_indice: {
        dir: idxCsv.dir,
        files_total: idxCsv.files_total,
        files_recent: idxCsv.files_recent,
      },
      dashboard_unificado: {
        wdo_last_updated: wdo?.lastUpdated ?? null,
        win_last_updated: win?.lastUpdated ?? null,
        wdo_volume_total: wdo?.volumeTotal ?? null,
        win_volume_total: win?.volumeTotal ?? null,
        wdo_open_interest_total: wdo?.oiTotal ?? null,
        win_open_interest_total: win?.oiTotal ?? null,
      },
    },
    logs: {
      options_recent: optLogs.map(l => ({ name: l.name, path: l.path, mtime: l.mtime ?? null, mtime_fmt: l.mtime_fmt ?? null })),
      cotacoes_recent: cotLogs.map(l => ({ name: l.name, path: l.path, mtime: l.mtime ?? null, mtime_fmt: l.mtime_fmt ?? null })),
    },
    market_quotes:
      marketQuotesFile && marketQuotesFile.path
        ? { path: marketQuotesFile.path, mtime: marketQuotesFile.mtime, mtime_fmt: marketQuotesFile.mtime_fmt, meta: mqMeta }
        : null,
    yahoo_audit: yahooAuditFile
      ? {
          path: yahooAuditFile.path,
          mtime: yahooAuditFile.mtime,
          mtime_fmt: yahooAuditFile.mtime_fmt,
          generatedAt: yahooAuditFile.generatedAt,
          missing: auditMissing,
          compareCritical: yahooCompare ? yahooCompare.compareCritical : [],
          compareTop: yahooCompare ? yahooCompare.compareTop : [],
        }
      : null,
    zq_curve: zqCurve,
    foreign_flow: foreignFlow,
    tradingview,
    sina,
  }
}
