import { mergeSinaQuoteIntoMarketQuotes } from '../../market-quotes/merge.js'
import { fetchSinaHqQuote } from '../../market-quotes/sina-hq.js'

export async function runSinaDceI0Step(params: {
  enabled: boolean
  code: string
  outDir: string
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}) {
  if (!params.enabled) return

  try {
    const parsed = await fetchSinaHqQuote({ code: params.code, timeoutMs: 4500, fetchTextWithTimeout: params.fetchTextWithTimeout })
    if (!parsed) throw new Error('Sina HQ: parse falhou')

    await mergeSinaQuoteIntoMarketQuotes(params.outDir, {
      seriesKey: 'DCE_I0',
      asset: {
        symbol: 'DCE_I0',
        name: parsed.name ? `Minério de Ferro Dalian (Sina • ${parsed.name})` : 'Minério de Ferro Dalian (Sina • I0)',
        exchange: 'DCE',
        category: 'commodities',
        tags: ['china'],
      },
      price: parsed.price,
      change: parsed.change,
      changePct: parsed.changePct,
    })

    process.stdout.write(`OK • Dalian I0=${parsed.price} (Sina)\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao capturar Dalian I0 (Sina): ${String(e instanceof Error ? e.message : e)}\n`)
  }
}
