export type ForeignFlowRow = {
  date: string
  foreigners: number
  institutional: number
  individuals: number
  financial_institutions: number
  other: number
}

export type ForeignFlowPayload =
  | {
      ok: true
      generatedAt: string
      provider: 'dadosdemercado_fluxo_scrape'
      source: { url: string; updatedAt?: string | null; updatedAtText?: string | null }
      latest: ForeignFlowRow
      derived: { foreigners: { cum5: number; cum20: number; ma28: number; unit: number } }
      signal: { score: number; bias: 'inflow' | 'outflow' | 'neutral'; wdo: '↓' | '↑' | '≈'; win: '↑' | '↓' | '≈' }
      series: ForeignFlowRow[]
    }
  | {
      ok: false
      generatedAt: string
      provider: 'dadosdemercado_fluxo_scrape'
      message: string
      source?: { url: string; updatedAt?: string | null; updatedAtText?: string | null }
    }

