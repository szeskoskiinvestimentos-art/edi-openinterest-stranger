import { arrowFromPct, fmtPct } from '../format.js'
import { escapeHtml, lineRow, valueArrow } from '../html.js'
import type { MarketQuotes } from '../../../types.ts'
import type { buildAgendaInfo } from './agenda.js'
import type { computeOperationalTelegramSignals } from './signals.js'
import type { createCardsMarketAccess } from './data-access.js'
import { fmtLevel } from './data-access.js'
import { macroShell } from './bodies-macro/header.js'

type AgendaInfo = ReturnType<typeof buildAgendaInfo>
type Signals = ReturnType<typeof computeOperationalTelegramSignals>
type Access = ReturnType<typeof createCardsMarketAccess>
type BuildMacroBodiesParams = {
  now: { date: string; time: string; iso: string }
  sessionLabel: string
  quotes: MarketQuotes | null
  agenda: AgendaInfo
  signals: Signals
  access: Access
}

export function buildMacroBodies(params: BuildMacroBodiesParams) {
  const macroBodyA = buildMacroBodyA(params)
  const macroBodyB = buildMacroBodyB(params)
  return { macroBodyA, macroBodyB }
}

function buildMacroBodyA(params: BuildMacroBodiesParams) {
  const { now, sessionLabel, quotes, agenda, signals, access } = params
  const pull = access.pull
  return macroShell({
    title: 'MENSAGEM 1/5 — MACRO & TÁTICO',
    subtitle: `${sessionLabel} B3 — ${now.date} • ${now.time} BRT`,
    bodyHtml: `<div class="grid">
      <div class="box">
        <div class="h">VIÉS (abertura × dia)</div>
        <table>
          ${lineRow('WIN (30–90m)', valueArrow(arrowFromPct(signals.win30_90), fmtPct(signals.win30_90)))}
          ${lineRow('WIN (dia)', valueArrow(arrowFromPct(signals.winDay), fmtPct(signals.winDay)))}
          ${lineRow('WDO (30–90m)', valueArrow(arrowFromPct(signals.wdo30_90), fmtPct(signals.wdo30_90)))}
          ${lineRow('WDO (dia)', valueArrow(arrowFromPct(signals.wdoDay), fmtPct(signals.wdoDay)))}
          ${lineRow('Sentimento (manchetes)', escapeHtml(signals.sentiment))}
          ${lineRow('Fluxo Emergentes', `${signals.emPill} ${escapeHtml(signals.emPulse.state)} <span class="muted">(score ${escapeHtml(signals.emScore)} • ${escapeHtml(signals.emThresholdLabel)})</span>`)}
          ${lineRow(
            'Pressão EM (WDO/WIN)',
            '<span class="muted">RISK-OFF → tende a WDO↑ / WIN↓ • RISK-ON → tende a WDO↓ / WIN↑ • filtro, não gatilho.</span>',
          )}
          ${lineRow('Divergências (FX)', escapeHtml(signals.fxDivergences))}
          ${lineRow('Risk-on/off (VIX/DXY/US10Y/CDS)', signals.riskRadar)}
          ${lineRow('Carry trade (FX)', signals.carryLine)}
          ${lineRow('Beta (FX) Oceania/Ásia', signals.betaLine)}
          ${lineRow('Macro Risk (final)', signals.macroRisk)}
        </table>
        ${signals.conflicts.length ? `<div class="small muted" style="margin-top:10px;">${escapeHtml(signals.conflicts[0]!)}</div>` : ''}
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">SAÚDE DOS DADOS</div>
          <table>
            ${lineRow('Quotes (idade)', escapeHtml(signals.quotesAge))}
            ${lineRow('Notícias (idade)', escapeHtml(signals.webAge))}
            ${lineRow('Opções (idade)', escapeHtml(signals.optionsAge))}
            ${lineRow('Cobertura crítica', escapeHtml(signals.coverage ? (signals.coverage.ok ? 'OK' : 'INCOMPLETA') : 'n/d'))}
            ${lineRow('Críticos faltando', escapeHtml(signals.coverage && !signals.coverage.ok ? signals.missingCriticalLabel : '—'))}
          </table>
        </div>
        <div class="box">
          <div class="h">ATIVOS (referência)</div>
          <table>
            ${lineRow('WIN (símbolo)', escapeHtml(signals.winKey || 'n/d'))}
            ${lineRow('WDO (símbolo)', escapeHtml(signals.wdoKey || 'n/d'))}
            ${lineRow('Fonte', escapeHtml(quotes && quotes.meta ? quotes.meta.source : 'n/d'))}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">GLOBAL (core)</div>
          <table>
            ${lineRow('S&P Fut (ES)', valueArrow(pull(['ESH26', 'ES']).a, pull(['ESH26', 'ES']).pct))}
            ${lineRow('Nasdaq Fut (NQ)', valueArrow(pull(['NQH26', 'NQ']).a, pull(['NQH26', 'NQ']).pct))}
            ${lineRow('VIX', valueArrow(signals.vixMove.a, signals.vixMove.pct))}
            ${lineRow('US10Y', valueArrow(signals.us10y.a, signals.us10y.pct))}
            ${lineRow('DXY', valueArrow(signals.dxyMove.a, signals.dxyMove.pct))}
          </table>
        </div>
        <div class="box">
          <div class="h">COMMODITIES (impacto BR)</div>
          <table>
            ${lineRow('Minério (Investing)', valueArrow(pull(['TIOc1', 'SM58Fc1']).a, pull(['TIOc1', 'SM58Fc1']).pct))}
            ${lineRow('Minério Dalian (Sina)', valueArrow(signals.dalianOreA, signals.dalianOre.pct))}
            ${lineRow('Brent', valueArrow(pull(['LCO']).a, pull(['LCO']).pct))}
            ${lineRow('WTI', valueArrow(pull(['CL']).a, pull(['CL']).pct))}
            ${lineRow('Cobre', valueArrow(pull(['HG', 'HGc1']).a, pull(['HG', 'HGc1']).pct))}
            ${lineRow('Soja', valueArrow(pull(['ZS']).a, pull(['ZS']).pct))}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">BRASIL (core)</div>
          <table>
            ${lineRow('Curva DI (curta)', valueArrow(signals.diShort.a, signals.diShort.pct))}
            ${lineRow('Curva DI (longa)', valueArrow(signals.diLong.a, signals.diLong.pct))}
            ${lineRow('Shape', escapeHtml(signals.diShape))}
            ${lineRow('Risco BR (CDS 5Y)', valueArrow(signals.brRisk.a, signals.brRisk.pct))}
            ${lineRow('VXEWZ', valueArrow(signals.vxewz.a, signals.vxewz.pct))}
          </table>
        </div>
        <div class="box">
        <div class="h">AGENDA (hoje • resumo)</div>
        <table>
          ${lineRow('Itens (≠ baixo)', escapeHtml(`BR ${agenda.agendaDay.BR.length} • EUA ${agenda.agendaDay.EUA.length} • CHINA/HK ${agenda.agendaDay['CHINA/HK'].length}`))}
          ${lineRow('Horários', `<span class="muted">${escapeHtml(agenda.agendaLine)}</span>`)}
          ${lineRow('Detalhe', '<span class="muted">Calendário completo + reações WDO/WIN na Mensagem 4/5.</span>')}
        </table>
        </div>
      </div>

    </div>`,
  })
}

function buildMacroBodyB(params: BuildMacroBodiesParams) {
  const { now, signals } = params
  return macroShell({
    title: 'MENSAGEM 2/5 — NÍVEIS (WDO/WIN)',
    subtitle: `Opções/gamma — ${now.date} • ${now.time} BRT`,
    bodyHtml: `<div class="grid">
      <div class="cols">
        <div class="box">
          <div class="h">NÍVEIS — WDO (opções/gamma)</div>
          <table>
            ${lineRow('Regime', escapeHtml(signals.oWdo && signals.oWdo.regime ? signals.oWdo.regime : 'n/d'))}
            ${lineRow('Gamma Flip', escapeHtml(signals.oWdo && signals.oWdo.keyLevels ? fmtLevel(signals.oWdo.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('Call/Put Wall', escapeHtml(signals.fmtWalls(signals.oWdo)))}
          </table>
        </div>
        <div class="box">
          <div class="h">NÍVEIS — WIN (opções/gamma)</div>
          <table>
            ${lineRow('Regime', escapeHtml(signals.oWin && signals.oWin.regime ? signals.oWin.regime : 'n/d'))}
            ${lineRow('Gamma Flip', escapeHtml(signals.oWin && signals.oWin.keyLevels ? fmtLevel(signals.oWin.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('Call/Put Wall', escapeHtml(signals.fmtWalls(signals.oWin)))}
          </table>
        </div>
      </div>
      <div class="cols">
        <div class="box">
          <div class="h">SENTINELA DE FLUXO (FX)</div>
          ${signals.g10MetricsRow}
          <table>
            ${lineRow('FX Bloco A', `<span class="v">${escapeHtml(signals.riskBlockAction)}</span>`)}
            ${lineRow('FX Bloco B', `<span class="v">${escapeHtml(signals.protBlockAction)}</span>`)}
            ${lineRow('Petróleo & Geopolítica', `<span class="muted">${escapeHtml(signals.oilIntel)}</span>`)}
            ${lineRow('Regime → Execução', `<span class="v">${escapeHtml(signals.regimeLabel)}</span> <span class="muted">•</span> <span class="muted">${escapeHtml(signals.regimeAction)}</span>`)}
            ${lineRow('Divergências (contexto)', escapeHtml(signals.g10Divergences))}
          </table>
          <div class="small muted" style="margin-top:10px;">
            Execução: use Regime/Termômetro como contexto e só então execute nos níveis de WDO/WIN. Use a “regra dos 30%” em dias de tendência forte.
          </div>
        </div>
        <div class="box">
          <div class="h">FLUXO EMERGENTES</div>
          ${signals.emMetricsRow}
          <table>
            ${lineRow('Fluxo Emergentes', `${signals.emPill} <span class="muted">${escapeHtml(signals.emPulse.state)} • score ${escapeHtml(signals.emScore)}</span>`)}
            ${lineRow('Divergências (FX)', escapeHtml(signals.fxDivergences))}
            ${lineRow('Carry trade (FX)', signals.carryLine)}
            ${lineRow('Beta (FX) Oceania/Ásia', signals.betaLine)}
            ${lineRow('Radar (stress)', signals.riskRadar)}
          </table>
          <div style="margin-top:12px;">
            <div class="h" style="margin:0 0 8px 0;">Componentes (USD vs EM)</div>
            ${signals.emPairsHtml}
          </div>
          <div class="h" style="margin-top:12px;">Guia (execução)</div>
          <ul class="list small">
            <li><span class="pill">Ordem</span> <span class="muted">1) Regime (Sentinela FX) → 2) Fluxo Emergentes → 3) Níveis WDO/WIN.</span></li>
            <li><span class="pill">Confirmação</span> <span class="muted">confluência entre DXY/VIX/US10Y/CDS e microestrutura.</span></li>
            <li><span class="pill">Regra</span> <span class="muted">“30%” em dias de tendência forte para evitar caça de topo/fundo.</span></li>
          </ul>
          <div class="small muted" style="margin-top:10px;">
            Qualidade: quotes ${escapeHtml(signals.quotesAge)} • opções ${escapeHtml(signals.optionsAge)} • web ${escapeHtml(signals.webAge)} • faltantes ${escapeHtml(signals.missingCriticalLabel)}
          </div>
        </div>
      </div>
    </div>`,
    height: 1320,
  })
}
