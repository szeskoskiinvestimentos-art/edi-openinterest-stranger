export type FocusAnualRow = {
  Indicador: string
  IndicadorDetalhe?: string | null
  Data: string
  DataReferencia: string
  Media?: number | null
  Mediana?: number | null
  DesvioPadrao?: number | null
  Minimo?: number | null
  Maximo?: number | null
  numeroRespondentes?: number | null
  baseCalculo?: number | null
}

export type FocusYearPack = {
  updatedAt: string | null
  ipca: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
  selic: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
  cambio: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
  pib: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
}

export type FocusDerived = {
  referenceYear: string
  score: number
  bias: 'hawkish' | 'dovish' | 'mixed'
  wdo: '↓' | '↑' | '≈'
  win: '↑' | '↓' | '≈'
}

export type FocusReportMeta = {
  pageUrl: string
  pdfUrl: string | null
  publishedAt: string | null
  cutoffDate: string | null
}

export type FocusSource = {
  pageUrl: string
  pdfUrl: string | null
  datasetUrl: string
  cutoffDate: string | null
  publishedAt: string | null
}

export type FocusSummaryPayload =
  | {
      ok: true
      generatedAt: string
      provider: 'bcb_olinda_expectativas'
      source: FocusSource
      years: Record<string, FocusYearPack>
      derived: FocusDerived
    }
  | {
      ok: false
      generatedAt: string
      provider: 'bcb_olinda_expectativas'
      message: string
      source: FocusSource
    }

