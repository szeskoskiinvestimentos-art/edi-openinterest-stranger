export type FedWatchRatesPayload =
  | {
      ok: true
      generatedAt: string
      provider: 'investing_fed_rate_monitor'
      source: { url: string; updatedText: string | null }
      warnings: string[]
      meetings: Array<{
        date: string
        days_remaining: number | null
        current_rate: string | null
        probs: Record<string, number>
      }>
    }
  | {
      ok: false
      generatedAt: string
      provider: 'investing_fed_rate_monitor'
      source: { url: string }
      warnings: string[]
      message: string
    }
