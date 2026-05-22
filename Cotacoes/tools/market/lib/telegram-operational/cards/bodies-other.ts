import { arrowFromPct, fmtPct } from '../format.js'
import { escapeHtml, htmlShell, lineRow, valueArrow } from '../html.js'
import type { buildAgendaInfo } from './agenda.js'
import type { computeOperationalTelegramSignals } from './signals.js'
import type { createCardsMarketAccess } from './data-access.js'

type AgendaInfo = ReturnType<typeof buildAgendaInfo>
type Signals = ReturnType<typeof computeOperationalTelegramSignals>
type Access = ReturnType<typeof createCardsMarketAccess>
type BuildOtherBodiesParams = {
  now: { date: string; time: string; iso: string }
  sessionLabel: string
  agenda: AgendaInfo
  signals: Signals
  access: Access
  ideasSupplementHtml: string
}

export function buildOtherBodies(params: BuildOtherBodiesParams) {
  const panelBody = buildPanelBody(params)
  const deepDiveBody = buildDeepDiveBody(params)
  const mercosulFxBody = buildMercosulFxBody(params)
  return { panelBody, deepDiveBody, mercosulFxBody }
}

function buildPanelBody(params: BuildOtherBodiesParams) {
  const { now, signals, access } = params
  const pull = access.pull
  return htmlShell(
    'MENSAGEM 3/5 — PAINEL DE VARIAÇÕES',
    `Painel global — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="cols">
        <div class="box">
          <div class="h">ÍNDICES</div>
          <table>
            ${lineRow('S&P Fut (ES)', valueArrow(pull(['ESH26', 'ES']).a, pull(['ESH26', 'ES']).pct))}
            ${lineRow('Nasdaq Fut (NQ)', valueArrow(pull(['NQH26', 'NQ']).a, pull(['NQH26', 'NQ']).pct))}
            ${lineRow('Dow', valueArrow(pull(['.DJI']).a, pull(['.DJI']).pct))}
            ${lineRow('DAX', valueArrow(pull(['DE40']).a, pull(['DE40']).pct))}
            ${lineRow('FTSE', valueArrow(pull(['UK100']).a, pull(['UK100']).pct))}
            ${lineRow('Nikkei', valueArrow(pull(['JP225']).a, pull(['JP225']).pct))}
            ${lineRow('Hang Seng', valueArrow(pull(['HSIQG6']).a, pull(['HSIQG6']).pct))}
            ${lineRow('China A50', valueArrow(pull(['CHINA50']).a, pull(['CHINA50']).pct))}
          </table>
        </div>
        <div class="box">
          <div class="h">STRESS & MOEDAS</div>
          <table>
            ${lineRow('VIX', valueArrow(signals.vixMove.a, signals.vixMove.pct))}
            ${lineRow('DXY', valueArrow(signals.dxyMove.a, signals.dxyMove.pct))}
            ${lineRow('US10Y', valueArrow(signals.us10y.a, signals.us10y.pct))}
            ${lineRow('CDS BR 5Y', valueArrow(pull(['BRGV5YUSAC=R']).a, pull(['BRGV5YUSAC=R']).pct))}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">INTEL — CHINA ⇄ BR</div>
          <table>
            ${lineRow('Regra (A50 + Minério)', signals.chinaBrIntel)}
          </table>
        </div>
        <div class="box">
          <div class="h">INTEL — COMMODITIES BR</div>
          <table>
            ${lineRow('Regra (cesta)', signals.brCommoditiesIntel)}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">COMMODITIES (flash)</div>
          <table>
            ${lineRow('Minério (Investing)', valueArrow(pull(['TIOc1', 'SM58Fc1']).a, pull(['TIOc1', 'SM58Fc1']).pct))}
            ${lineRow('Minério Dalian (Sina)', valueArrow(signals.dalianOreA, signals.dalianOre.pct))}
            ${lineRow('Brent', valueArrow(pull(['LCO']).a, pull(['LCO']).pct))}
            ${lineRow('WTI', valueArrow(pull(['CL']).a, pull(['CL']).pct))}
            ${lineRow('Cobre', valueArrow(pull(['HG', 'HGc1']).a, pull(['HG', 'HGc1']).pct))}
            ${lineRow('Ouro', valueArrow(pull(['GC']).a, pull(['GC']).pct))}
            ${lineRow('Soja', valueArrow(pull(['ZS']).a, pull(['ZS']).pct))}
            ${lineRow('Boi', valueArrow(pull(['LE']).a, pull(['LE']).pct))}
            ${lineRow('Café', valueArrow(pull(['KC']).a, pull(['KC']).pct))}
          </table>
        </div>
        <div class="box">
          <div class="h">CHECKLIST RÁPIDO</div>
          <table>
            ${lineRow('Risco dominante', escapeHtml(signals.thesisDriversGlobal[0] || '—'))}
            ${lineRow('Brasil (driver)', escapeHtml(signals.thesisDriversBr[0] || '—'))}
            ${lineRow('Commodities (driver)', escapeHtml(signals.thesisDriversCom[0] || '—'))}
            ${lineRow('Pares emergentes', escapeHtml(signals.emPulse.state))}
          </table>
        </div>
      </div>
    </div>`,
  )
}

function buildDeepDiveBody(params: BuildOtherBodiesParams) {
  const { now, agenda, signals, ideasSupplementHtml } = params
  return htmlShell(
    'MENSAGEM 4/5 — DEEP DIVE',
    `Cenário & correlações — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="box">
        <div class="h">TESE DO DIA (síntese)</div>
        <ul class="list">
          <li><span class="pill">Global</span> <span class="muted">${escapeHtml(signals.thesisDriversGlobal.join(' / ') || '—')}</span></li>
          <li><span class="pill">Brasil</span> <span class="muted">${escapeHtml(signals.thesisDriversBr.join(' / ') || '—')}</span></li>
          <li><span class="pill">Commodities</span> <span class="muted">${escapeHtml(signals.thesisDriversCom.join(' / ') || '—')}</span></li>
          <li><span class="pill">EM (oculto)</span> <span class="muted">${escapeHtml(signals.emPulse.state)}</span></li>
        </ul>
      </div>

      ${agenda.agendaTodaySupplementHtml}
      ${ideasSupplementHtml}

      <div class="cols">
        <div class="box">
          <div class="h">MICROESTRUTURA (opções/gamma)</div>
          <table>
            ${lineRow('WDO — Regime', escapeHtml(signals.oWdo && signals.oWdo.regime ? signals.oWdo.regime : 'n/d'))}
            ${lineRow('WDO — Gamma Flip', escapeHtml(signals.oWdo && signals.oWdo.keyLevels ? fmtLevel(signals.oWdo.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('WDO — Call Wall', escapeHtml(fmtLevel(signals.pickWall(signals.oWdo, 'call'))))}
            ${lineRow('WDO — Put Wall', escapeHtml(fmtLevel(signals.pickWall(signals.oWdo, 'put'))))}
            ${lineRow('WIN — Regime', escapeHtml(signals.oWin && signals.oWin.regime ? signals.oWin.regime : 'n/d'))}
            ${lineRow('WIN — Gamma Flip', escapeHtml(signals.oWin && signals.oWin.keyLevels ? fmtLevel(signals.oWin.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('WIN — Call Wall', escapeHtml(fmtLevel(signals.pickWall(signals.oWin, 'call'))))}
            ${lineRow('WIN — Put Wall', escapeHtml(fmtLevel(signals.pickWall(signals.oWin, 'put'))))}
          </table>
        </div>
        <div class="box">
          <div class="h">GATILHOS (operacionais)</div>
          <ul class="list">
            <li><span class="pill">Confirmação</span> <span class="muted">confluência entre DXY/US10Y, risco BR e microestrutura.</span></li>
            <li><span class="pill">Invalidação</span> <span class="muted">mudança abrupta no bloco global ou perda de coerência entre WDO e WIN.</span></li>
            <li><span class="pill">Calendário</span> <span class="muted">${escapeHtml(agenda.agendaLine)} • ver bloco de calendário nesta imagem.</span></li>
          </ul>
        </div>
      </div>

      <div class="box">
        <div class="h">PARÁGRAFO EMERGENTES (sem tickers)</div>
        <div class="muted">
          Quando o fluxo em pares emergentes está favorável, a assimetria costuma reduzir o prêmio de risco local e melhora a “tolerância” do mercado a ruídos.
          Quando há pressão em emergentes, o canal de contágio costuma dominar e exige mais confirmação por commodities/juros/risco Brasil antes de operar direção.
        </div>
      </div>
    </div>`,
  )
}

function buildMercosulFxBody(params: BuildOtherBodiesParams) {
  const { now, sessionLabel, signals } = params

  const miniArrow = (label: string, a: string) =>
    `<span class="muted">${escapeHtml(label)}</span><span class="muted" style="margin-left:4px;">${escapeHtml(a)}</span>`

  const miniMove = (label: string, a: string, pct: string) => `${miniArrow(label, a)} <span class="muted">${escapeHtml(pct)}</span>`

  return htmlShell(
    'MENSAGEM 5/5 — MERCOSUL + SENTINELA DE FLUXO (FX)',
    `${sessionLabel} B3 — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="cols">
        <div class="box">
          <div class="h">MERCOSUL PULSE (70% FX + 30% Proxies)</div>
          <table>
            ${signals.mercosulComponents.map(x => lineRow(x.label, valueArrow(x.a, fmtPct(x.pct)))).join('')}
            ${lineRow('Mercosul Score', `${intelPill(signals.mercosulPulse.mode, signals.mercosulPulse.state)} <span class="muted">${escapeHtml(fmtPct(signals.mercosulPulse.score))}</span>`)}
          </table>
        </div>
        <div class="box">
          <div class="h">SENTINELA DE FLUXO (FX EMERGENTES)</div>
          <table>
            ${lineRow('Flow Sentinel (FX)', `${signals.emPill} ${escapeHtml(signals.emPulse.state)} <span class="muted">(score ${escapeHtml(signals.emScore)} • ${escapeHtml(signals.emThresholdLabel)})</span>`)}
            ${lineRow(
              'Operacional (WDO/WIN)',
              '<span class="muted">RISK-OFF → tende a WDO↑ / WIN↓ • RISK-ON → tende a WDO↓ / WIN↑ • filtro, não gatilho.</span>',
            )}
            ${lineRow('Divergências (FX)', escapeHtml(signals.fxDivergences))}
            ${lineRow('Carry trade (FX)', signals.carryLine)}
            ${lineRow('Risco BR (CDS/VXEWZ)', `${miniMove('CDS', signals.brRisk.a, signals.brRisk.pct)} <span class="muted">•</span> ${miniMove('VXEWZ', signals.vxewz.a, signals.vxewz.pct)}`)}
          </table>
        </div>
      </div>
    </div>`,
  )
}

function fmtLevel(v: unknown) {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : 'n/d'
}

function intelPill(mode: 'good' | 'bad' | 'mid', label: string) {
  const cls = mode === 'good' ? 'pillGood' : mode === 'bad' ? 'pillBad' : 'pillMid'
  return `<span class="pill ${escapeHtml(cls)}">${escapeHtml(label)}</span>`
}
