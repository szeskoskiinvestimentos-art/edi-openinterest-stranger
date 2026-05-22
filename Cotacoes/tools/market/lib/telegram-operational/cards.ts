import path from 'node:path'
import { fmtBrtNow } from './format.js'
import { fetchJson, readJsonSafe } from './io.js'
import { buildAgendaInfo } from './cards/agenda.js'
import { buildMacroBodies } from './cards/bodies-macro.js'
import { buildOtherBodies } from './cards/bodies-other.js'
import { createCardsMarketAccess } from './cards/data-access.js'
import { buildIdeasSupplementHtml } from './cards/ideas.js'
import { computeOperationalTelegramSignals } from './cards/signals.js'
import type { MarketQuotes } from '../../types.ts'
import type { TelegramCard } from './types.js'

type OptionsSummary = Parameters<typeof computeOperationalTelegramSignals>[0]['options']
type WebNewsModulePayload = Parameters<typeof computeOperationalTelegramSignals>[0]['web']

export async function buildOperationalTelegramCards(params: {
  baseUrl: string
  sourceDataDir: string
  sessionLabel?: string
}) {
  const now = fmtBrtNow()
  const sessionLabel = String(params.sessionLabel || 'Pré-mercado').trim() || 'Pré-mercado'

  const ideasSupplementHtml = await buildIdeasSupplementHtml()

  const quotesPath = path.join(params.sourceDataDir, 'market_quotes.json')
  const calendarPath = path.join(params.sourceDataDir, 'economic_calendar.json')

  const quotes = await readJsonSafe<MarketQuotes>(quotesPath)
  const calendar = await readJsonSafe<Parameters<typeof buildAgendaInfo>[0]>(calendarPath)

  const web = await fetchJson<WebNewsModulePayload>(`${params.baseUrl}/api/news/web/module?limit=40`, 7500)
  const options = await fetchJson<OptionsSummary>(`${params.baseUrl}/api/options/summary`, 6500)

  const agenda = buildAgendaInfo(calendar)
  const access = createCardsMarketAccess(quotes)
  const signals = computeOperationalTelegramSignals({ quotes, access, web, options })

  const { macroBodyA, macroBodyB } = buildMacroBodies({ now, sessionLabel, quotes, agenda, signals, access })
  const { panelBody, deepDiveBody, mercosulFxBody } = buildOtherBodies({
    now,
    sessionLabel,
    agenda,
    signals,
    access,
    ideasSupplementHtml,
  })

  const cards: TelegramCard[] = [
    {
      key: 'macro_a',
      filename: `telegram_1_macro_a_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 1/5 (${sessionLabel}) — ${now.date} ${now.time} BRT`,
      html: macroBodyA,
    },
    {
      key: 'macro_b',
      filename: `telegram_2_macro_b_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 2/5 (Níveis WDO/WIN) — ${now.date} ${now.time} BRT`,
      html: macroBodyB,
    },
    {
      key: 'panel',
      filename: `telegram_3_painel_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 3/5 (Painel de Variações) — ${now.date} ${now.time} BRT`,
      html: panelBody,
    },
    {
      key: 'deep_dive',
      filename: `telegram_4_deepdive_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 4/5 (Deep Dive) — ${now.date} ${now.time} BRT`,
      html: deepDiveBody,
    },
    {
      key: 'mercosul_fx',
      filename: `telegram_5_mercosul_fx_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 5/5 (Mercosul + Fluxo FX) — ${now.date} ${now.time} BRT`,
      html: mercosulFxBody,
    },
  ]

  return { ok: true, generatedAt: now.iso, cards }
}

