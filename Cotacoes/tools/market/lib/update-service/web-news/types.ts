export type WebNewsItem = {
  id: string
  title: string
  url: string
  publishedAt: string | null
  source: string | null
  bucket: 'GLOBAL' | 'BRASIL' | 'COMMODITIES'
  driver: string
  impact: { wdo: '↑' | '↓' | '≈'; win: '↑' | '↓' | '≈' }
  confidence: 'alta' | 'média' | 'baixa'
}
