import { readFile } from 'node:fs/promises'

import type { ControleDeDadosSnapshot, LogSignal } from './types.js'

export async function readGitSyncStatusFromLog(logPath: string) {
  try {
    const raw = await readFile(logPath, 'utf8')
    const re = /^GIT_SYNC status=([a-z_]+)(?:\s*•\s*(.*))?$/gim
    let last: { status: string; detail?: string } | null = null
    for (const m of raw.matchAll(re)) {
      const status = String(m[1] || '').trim()
      const detail = String(m[2] || '').trim()
      if (status) last = detail ? { status, detail } : { status }
    }
    if (last) return last
    return null
  } catch {
    return null
  }
}

export async function readLogTail(logPath: string, maxLines = 80) {
  try {
    const raw = await readFile(logPath, 'utf8')
    const lines = raw
      .split(/\r?\n/g)
      .map(s => s.trim())
      .filter(Boolean)
    return lines.slice(Math.max(0, lines.length - maxLines))
  } catch {
    return null
  }
}

export async function readMarketDownloadSignalsFromLog(logPath: string) {
  try {
    const raw = await readFile(logPath, 'utf8')
    const lines = raw.split(/\r?\n/g).map(s => s.trim())

    const out: NonNullable<ControleDeDadosSnapshot['cotacoes']>['downloads'] = {}

    for (const line of lines) {
      if (!line) continue

      const yahooOk = line.match(/^OK\s+•\s+Yahoo quotes:\s*(.*)$/i)
      const yahooFail = line.match(/^(FAIL|ERROR)\s+•\s+Yahoo quotes:\s*(.*)$/i)
      if (yahooOk) out.yahoo = { status: 'ok', detail: yahooOk[1] ? yahooOk[1].trim() : null }
      if (yahooFail) out.yahoo = { status: 'fail', detail: yahooFail[2] ? yahooFail[2].trim() : null }

      const pf = line.match(/^(OK|SKIP|FAIL|ERROR)\s+•\s+Portfolio Investing(?:\s*\((.*)\))?$/i)
      if (pf) {
        const status = pf[1].toLowerCase()
        out.portfolio = { status: status === 'error' ? 'fail' : (status as LogSignal['status']), detail: pf[2] ? pf[2].trim() : null }
      }

      const di = line.match(/^(OK|SKIP|FAIL|ERROR)\s+•\s+DI\b.*$/i)
      if (di) {
        const status = di[1].toLowerCase()
        out.di = { status: status === 'error' ? 'fail' : (status as LogSignal['status']), detail: line.replace(/^(OK|SKIP|FAIL|ERROR)\s+•\s+/i, '') }
      }

      const cal = line.match(/^(OK|SKIP|FAIL|ERROR)\s+•\s+Calendar\b.*$/i)
      if (cal) {
        const status = cal[1].toLowerCase()
        out.calendar = { status: status === 'error' ? 'fail' : (status as LogSignal['status']), detail: line.replace(/^(OK|SKIP|FAIL|ERROR)\s+•\s+/i, '') }
      }

      const pdf = line.match(/^OK\s+•\s+dashboard PDF\b.*$/i)
      if (pdf) out.pdf = { status: 'ok', detail: line.replace(/^OK\s+•\s+/i, '') }

      const tv = line.match(/^SUGGEST\s+•\s+MARKET_TRADINGVIEW_SYMBOL_OVERRIDES\b.*$/i)
      if (tv) out.tradingview = { status: 'warn', detail: line.replace(/^SUGGEST\s+•\s+/i, '') }

      const git = line.match(/^GIT_SYNC status=([a-z_]+)(?:\s*•\s*(.*))?$/i)
      if (git) {
        const s = String(git[1] || '').trim().toLowerCase()
        const detail = git[2] ? String(git[2]).trim() : null
        const status: LogSignal['status'] = s === 'pushed' || s === 'committed' ? 'ok' : s === 'failed' ? 'fail' : 'warn'
        out.git_sync = { status, detail: detail || s }
      }
    }

    const hasAny = Object.keys(out).length > 0
    return hasAny ? out : null
  } catch {
    return null
  }
}
