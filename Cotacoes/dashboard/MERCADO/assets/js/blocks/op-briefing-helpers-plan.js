function opBriefing_makePlanHtml({
    item,
    finalBias,
    fmt0,
    fmt1,
    badge,
    biasTone,
    biasLabel,
    gaugeHtml,
    finalScoreFor,
    escapeHtml,
    regime,
    newsTilt,
    web,
    priceLead,
    trendLead,
    localTapeLead,
    pulseLead,
    pulseNow,
    combined,
    macroWdo,
    macroWin,
    brBreadthSectorSignal,
    diSignal,
    agendaIntel,
    agendaIfThen,
    agendaValidation,
    formatPercent,
    formatNumber,
}) {
    const sym = item && item.symbol ? String(item.symbol) : '—';
    const spot = item && typeof item.spot === 'number' ? item.spot : null;
    const r = item && item.regime ? String(item.regime) : '';
    const gammaTone = /negativo/i.test(r) ? 'negative' : /positivo/i.test(r) ? 'positive' : 'neutral';
    const gammaLabel = r ? r : 'Gamma N/A';
    const key = item && item.keyLevels ? item.keyLevels : {};

    const gf = typeof key.gammaFlip === 'number' && Number.isFinite(key.gammaFlip) ? key.gammaFlip : null;
    const put = typeof key.effectivePutWall === 'number' && Number.isFinite(key.effectivePutWall)
        ? key.effectivePutWall
        : (typeof key.putWall === 'number' && Number.isFinite(key.putWall) ? key.putWall : null);
    const call = typeof key.effectiveCallWall === 'number' && Number.isFinite(key.effectiveCallWall)
        ? key.effectiveCallWall
        : (typeof key.callWall === 'number' && Number.isFinite(key.callWall) ? key.callWall : null);
    const rangeLow = typeof key.rangeLow === 'number' && Number.isFinite(key.rangeLow) ? key.rangeLow : null;
    const rangeHigh = typeof key.rangeHigh === 'number' && Number.isFinite(key.rangeHigh) ? key.rangeHigh : null;
    const maxPain = typeof key.maxPain === 'number' && Number.isFinite(key.maxPain) ? key.maxPain : null;

    const width = (typeof rangeLow === 'number' && typeof rangeHigh === 'number' && rangeHigh > rangeLow)
        ? rangeHigh - rangeLow
        : (typeof spot === 'number' ? Math.abs(spot) * 0.012 : 0);
    const near = width > 0 ? width * 0.12 : 0;
    const isNear = (a, b) => typeof a === 'number' && typeof b === 'number' && near > 0 ? Math.abs(a - b) <= near : false;

    const fb = sym === 'WDO' ? finalBias.WDO : sym === 'WIN' ? finalBias.WIN : { bias: 'neutral', source: '—' };
    const bias = fb.bias;

    const gate = (() => {
        if (bias === 'buy') {
            if (typeof gf === 'number' && typeof spot === 'number') return spot >= gf ? `Manter compra acima do Gamma Flip (${fmt0(gf)})` : `Aguardar retomar Gamma Flip (${fmt0(gf)})`;
            return 'Comprar apenas com confirmação (evitar “chase”).';
        }
        if (bias === 'sell') {
            if (typeof gf === 'number' && typeof spot === 'number') return spot <= gf ? `Manter venda abaixo do Gamma Flip (${fmt0(gf)})` : `Aguardar perder Gamma Flip (${fmt0(gf)})`;
            return 'Vender apenas com confirmação (evitar “chase”).';
        }
        if (/positivo/i.test(r)) return 'Sem viés claro: priorize range (comprar perto do fundo, vender perto do topo).';
        if (/negativo/i.test(r)) return 'Sem viés claro: aguarde rompimento com confirmação (tendência).';
        return 'Sem viés claro: reduzir tamanho e operar só nos níveis.';
    })();

    const targets = (() => {
        if (bias === 'buy') {
            const t1 = typeof call === 'number' ? `Alvo 1: ${fmt0(call)} (CallWall)` : (typeof rangeHigh === 'number' ? `Alvo 1: ${fmt0(rangeHigh)} (Range High)` : null);
            const t2 = typeof maxPain === 'number' ? `Referência: ${fmt0(maxPain)} (MaxPain)` : null;
            return [t1, t2].filter(Boolean).join(' • ') || 'Alvos: —';
        }
        if (bias === 'sell') {
            const t1 = typeof put === 'number' ? `Alvo 1: ${fmt0(put)} (PutWall)` : (typeof rangeLow === 'number' ? `Alvo 1: ${fmt0(rangeLow)} (Range Low)` : null);
            const t2 = typeof maxPain === 'number' ? `Referência: ${fmt0(maxPain)} (MaxPain)` : null;
            return [t1, t2].filter(Boolean).join(' • ') || 'Alvos: —';
        }
        return `Níveis: GF ${fmt0(gf)} • Put ${fmt0(put)} • Call ${fmt0(call)} • Range ${fmt0(rangeLow)}–${fmt0(rangeHigh)}`;
    })();

    const stop = (() => {
        if (bias === 'buy') {
            const s = typeof put === 'number' ? `Stop: abaixo de ${fmt0(put)} (PutWall)` : (typeof rangeLow === 'number' ? `Stop: abaixo de ${fmt0(rangeLow)} (Range Low)` : 'Stop: invalidar no rompimento contra.');
            return s;
        }
        if (bias === 'sell') {
            const s = typeof call === 'number' ? `Stop: acima de ${fmt0(call)} (CallWall)` : (typeof rangeHigh === 'number' ? `Stop: acima de ${fmt0(rangeHigh)} (Range High)` : 'Stop: invalidar no rompimento contra.');
            return s;
        }
        return '';
    })();

    const zone = (() => {
        if (typeof spot !== 'number') return 'Zona: —';
        if (isNear(spot, rangeHigh) || isNear(spot, call)) return 'Zona: perto do topo';
        if (isNear(spot, rangeLow) || isNear(spot, put)) return 'Zona: perto do fundo';
        if (typeof gf === 'number') return `Zona: ${spot >= gf ? 'acima' : 'abaixo'} do Gamma Flip`;
        return 'Zona: —';
    })();

    const note = /positivo/i.test(r)
        ? 'Gamma +: tende a mean reversion; prefira entradas “bem posicionadas” em nível.'
        : /negativo/i.test(r)
            ? 'Gamma -: tende a acelerar; prefira rompimento confirmado e gestão rápida.'
            : 'Gamma: sem leitura.';

    const whyLines = (() => {
        const lines = [];
        const symKey = sym === 'WDO' ? 'wdo' : sym === 'WIN' ? 'win' : '';
        const biasTxt = bias === 'buy' ? 'COMPRA' : bias === 'sell' ? 'VENDA' : 'NEUTRO';
        if (regime && regime.label && regime.operational && symKey && regime.operational[symKey]) {
            lines.push(`Regime (${regime.label}): ${String(regime.operational[symKey])}`);
        } else if (regime && regime.label) {
            lines.push(`Regime: ${String(regime.label)}`);
        }
        const nt = sym === 'WDO' ? newsTilt.wdo : newsTilt.win;
        if (web && typeof nt.score === 'number' && Number.isFinite(nt.score)) {
            const nb = nt.bias === 'buy' ? 'COMPRA' : nt.bias === 'sell' ? 'VENDA' : 'NEUTRO';
            lines.push(`News tilt: ${fmt1(nt.score)} → ${nb}`);
        }
        if (priceLead.active && fb.source === 'PREÇO') {
            lines.push(`Preço liderando: ${priceLead.reason}`);
        }
        if (!priceLead.active && trendLead.active && fb.source === 'TENDÊNCIA') {
            lines.push(trendLead.reason);
        }
        if (!priceLead.active && !trendLead.active && localTapeLead.active && fb.source === 'FITA_LOCAL') {
            lines.push(localTapeLead.reason);
        }
        if (!priceLead.active && pulseLead.active && fb.source === 'PULSO') {
            lines.push(`Pulso (drivers+preço): ${pulseLead.reason}`);
        }
        if (pulseNow && pulseNow.align && pulseNow.align.wdo_usdbrl && pulseNow.align.wdo_usdbrl.ok === false) {
            const a = pulseNow.align.wdo_usdbrl;
            const ax = (typeof a.a === 'number' && Number.isFinite(a.a)) ? formatPercent(a.a, 2) : '—';
            const bx = (typeof a.b === 'number' && Number.isFinite(a.b)) ? formatPercent(a.b, 2) : '—';
            lines.push(`Alerta: WDO vs USD/BRL desalinhados (WDO ${ax} vs USD/BRL ${bx})`);
        }
        if (combined && ((sym === 'WDO' && combined.wdo && combined.wdo.conflict) || (sym === 'WIN' && combined.win && combined.win.conflict))) {
            lines.push('Regime x News em conflito → decisão por Macro');
        }
        if (fb.source === 'MACRO') {
            const m = sym === 'WDO' ? macroWdo : macroWin;
            const mb = m && m.bias ? (m.bias === 'buy' ? 'COMPRA' : m.bias === 'sell' ? 'VENDA' : 'NEUTRO') : 'NEUTRO';
            const ms = m && typeof m.score === 'number' && Number.isFinite(m.score) ? fmt1(m.score) : '—';
            lines.push(`Macro: score ${ms} → ${mb}`);
            const parts = m && Array.isArray(m.parts) ? m.parts.slice() : [];
            parts.sort((a, b) => Math.abs(b.val || 0) - Math.abs(a.val || 0));
            const top = parts.slice(0, 3).map(p => String(p.label || '')).filter(Boolean);
            if (top.length) lines.push(`Drivers: ${top.join(' • ')}`);
        }
        if (brBreadthSectorSignal && brBreadthSectorSignal.ok && brBreadthSectorSignal.detail) {
            lines.push(`Fita BR (breadth/setores): ${brBreadthSectorSignal.detail}`);
        }
        if (diSignal && diSignal.ok) {
            const a = diSignal.anchors || {};
            const anchorShort = a && a.short ? a.short : null;
            const d = anchorShort && typeof anchorShort.chgPct === 'number' && Number.isFinite(anchorShort.chgPct) ? `${(anchorShort.chgPct * 10) > 0 ? '+' : ''}${formatNumber(anchorShort.chgPct * 10, 1)}bp` : '—';
            const b = sym === 'WDO' ? diSignal.wdoBias : sym === 'WIN' ? diSignal.winBias : 'neutral';
            const bt = b === 'buy' ? 'COMPRA' : b === 'sell' ? 'VENDA' : 'NEUTRO';
            const lab = anchorShort && anchorShort.symbol ? `Curto ${anchorShort.symbol}` : 'Curto';
            lines.push(`DI (B3): ${diSignal.shape} • ${lab} Δ ${d} → ${bt}`);
        }
        const a = agendaIntel && agendaIntel.inWindow ? agendaIntel.inWindow : [];
        if (a && a.length) {
            const top = a.slice(0, 2).map(e => {
                const imp = String(e.impact || '').toUpperCase();
                const cur = String(e.currency || '').toUpperCase();
                const tt = e.time ? String(e.time) : '';
                const ev = e.event ? String(e.event) : '';
                const wdo = e.wdo ? String(e.wdo) : '—';
                const win = e.win ? String(e.win) : '—';
                return `${imp} ${cur} ${tt} • ${ev} • WDO ${wdo} / WIN ${win}`;
            });
            lines.push(`Agenda: janela de evento (${top.join(' | ')})`);
            if (agendaIfThen && Array.isArray(agendaIfThen.lines) && agendaIfThen.lines.length) {
                const conf = agendaValidation && typeof agendaValidation.score === 'number' && Number.isFinite(agendaValidation.score)
                    ? ` • Conf ${agendaValidation.label} (${formatNumber(agendaValidation.score * 100, 0)}%)`
                    : '';
                const val = agendaValidation && Array.isArray(agendaValidation.keys) && agendaValidation.keys.length
                    ? ` • Validar ${agendaValidation.keys.join('/')}`
                    : '';
                lines.push(`Se–então (matriz): ${agendaIfThen.lines.join(' | ')}${agendaIfThen.source ? ` • ${agendaIfThen.source}` : ''}${conf}${val}`);
            }
        }
        if (r) lines.push(`Execução: ${gammaLabel} (define tipo de execução, não o lado)`);
        lines.push(`Saída: ${sym} ${biasTxt} (Fonte: ${fb.source})`);
        return lines;
    })();

    return `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(sym)}</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(biasTone(bias), biasLabel(sym, bias))}
                        ${badge(gammaTone, gammaLabel)}
                        ${badge('neutral', `Fonte: ${fb.source}`)}
                    </div>
                    <div style="margin-top:8px;width:100%;">${gaugeHtml(sym, finalScoreFor(sym))}</div>
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
                    <div style="opacity:.92;">
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">Spot: ${fmt0(spot)}</div>
                        <div style="opacity:.85;margin-top:6px;">${escapeHtml(zone)}</div>
                        <div style="opacity:.85;margin-top:6px;">GF ${fmt0(gf)} • Put ${fmt0(put)} • Call ${fmt0(call)}</div>
                        <div style="opacity:.85;margin-top:6px;">Range ${fmt0(rangeLow)}–${fmt0(rangeHigh)} • MaxPain ${fmt0(maxPain)}</div>
                    </div>
                    <div style="opacity:.92;line-height:1.4;">
                        <div style="font-weight:900;letter-spacing:.6px;">Plano</div>
                        <div style="margin-top:6px;">${escapeHtml(gate)}</div>
                        <div style="margin-top:6px;">${escapeHtml(targets)}</div>
                        ${stop ? `<div style="margin-top:6px;opacity:.90;">${escapeHtml(stop)}</div>` : ''}
                        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                            <div style="font-weight:900;letter-spacing:.6px;">Por quê</div>
                            <ul style="margin:6px 0 0 18px;padding:0;opacity:.84;font-size:12px;line-height:1.35;">
                                ${(whyLines || []).map(x => `<li>${escapeHtml(x)}</li>`).join('') || '<li>—</li>'}
                            </ul>
                        </div>
                        <div style="margin-top:6px;opacity:.78;font-size:12px;">${escapeHtml(note)}</div>
                    </div>
                </div>
            </div>
        `;
}
