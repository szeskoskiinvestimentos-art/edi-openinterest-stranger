import type { UpdateSummary } from '../lib/investing-sync/types.js'

export function logStdout(line: string) {
  process.stdout.write(`${line}\n`)
}

export function writeSummary(summary: UpdateSummary) {
  process.stdout.write(`SUMMARY_JSON ${JSON.stringify(summary)}\n`)
}

