import type { FedWatchRatesPayload } from './types.ts'

import { fetchInvestingFedRateMonitorHtml } from './fetch.ts'
import {
  computeDaysRemaining,
  parseInvestingMeetings,
  parseInvestingNextMeetingAndRate,
  parseInvestingUpdatedText,
  stripHtmlToText,
} from './parse.ts'
import { verifyMeetings } from './verify.ts'

export async function buildFedWatchRatesFromInvesting(params: {
  timeoutMs: number
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}): Promise<FedWatchRatesPayload> {
  const generatedAt = new Date().toISOString()
  try {
    const fetched = await fetchInvestingFedRateMonitorHtml(params)
    const url = fetched.url
    const html = fetched.html

    const updatedText = parseInvestingUpdatedText(html)
    const { currentRateText, nextMeetingText } = parseInvestingNextMeetingAndRate(html)
    const meetingsRaw = parseInvestingMeetings(html)
    const meetings = meetingsRaw.map(m => ({
      date: m.dateText,
      days_remaining: computeDaysRemaining(m.dateText),
      current_rate:
        nextMeetingText && currentRateText && String(nextMeetingText).trim() === String(m.dateText).trim() ? currentRateText : null,
      probs: m.probs,
    }))

    if (!meetings.length) {
      const head = stripHtmlToText(html).slice(0, 260)
      throw new Error(`parse falhou${head ? ` • head=${JSON.stringify(head)}` : ''}`)
    }
    const warnings = verifyMeetings(meetings)
    return {
      ok: true,
      generatedAt,
      provider: 'investing_fed_rate_monitor',
      source: { url, updatedText },
      warnings,
      meetings,
    }
  } catch (e) {
    const url = 'https://www.investing.com/central-banks/fed-rate-monitor'
    return {
      ok: false,
      generatedAt,
      provider: 'investing_fed_rate_monitor',
      source: { url },
      warnings: [],
      message: String(e instanceof Error ? e.message : e),
    }
  }
}
