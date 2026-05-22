import path from 'node:path'

import type { ControleDeDadosSnapshot } from './types.js'
import { readLogTail, readMarketDownloadSignalsFromLog } from './log.js'
import { tryReadMarketDataSummary } from './market-data.js'

export async function buildControleDeDadosSnapshot(input: {
  nowISO: () => string
  workspaceRoot: string
  marketStatus?: unknown
  logPath?: string | null
  gitSyncStatus?: string | null
}): Promise<ControleDeDadosSnapshot> {
  const wdoJson = path.resolve(input.workspaceRoot, 'dashboard_unificado', 'WDO', 'assets', 'data', 'market_data.json')
  const winJson = path.resolve(input.workspaceRoot, 'dashboard_unificado', 'WIN', 'assets', 'data', 'market_data.json')
  const [wdo, win, downloads, logTail] = await Promise.all([
    tryReadMarketDataSummary(wdoJson),
    tryReadMarketDataSummary(winJson),
    input.logPath ? readMarketDownloadSignalsFromLog(input.logPath) : Promise.resolve(null),
    input.logPath ? readLogTail(input.logPath, 80) : Promise.resolve(null),
  ])
  const gitFromLog = downloads?.git_sync?.detail ? String(downloads.git_sync.detail) : null
  return {
    generated_at: input.nowISO(),
    root_dir: input.workspaceRoot,
    state: {
      last_cotacoes_finished_iso: null,
      last_cotacoes_log_path: input.logPath ?? null,
      last_cotacoes_git_status: input.gitSyncStatus ?? gitFromLog ?? null,
      last_options_wdo_last_updated: wdo?.lastUpdated ?? null,
      last_options_win_last_updated: win?.lastUpdated ?? null,
    },
    cotacoes: {
      market_status: input.marketStatus,
      last_log_hint: null,
      log_tail: logTail,
      downloads,
    },
    options: {
      dashboard_unificado: {
        wdo_last_updated: wdo?.lastUpdated ?? null,
        win_last_updated: win?.lastUpdated ?? null,
        wdo_volume_total: wdo?.volumeTotal ?? null,
        win_volume_total: win?.volumeTotal ?? null,
        wdo_open_interest_total: wdo?.oiTotal ?? null,
        win_open_interest_total: win?.oiTotal ?? null,
      },
    },
  }
}
