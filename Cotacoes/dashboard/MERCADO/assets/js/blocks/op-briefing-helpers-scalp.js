function opBriefing_computeScalpModuleHtml({
    pulseNow,
    data,
    options,
    volAmp,
    foreignFlow,
    brFlowSignal,
    operationalTuning,
    findAliasSymbolBest,
    findAssetSymbol,
    getChangePct,
    formatNumber,
    formatPercent,
    escapeHtml,
    badge,
    biasTone,
    biasLabel,
    fmt0,
}) {
    if (!pulseNow) return '';
    const symWdo = pulseNow.sym && pulseNow.sym.wdo ? String(pulseNow.sym.wdo) : '';
    const symWin = pulseNow.sym && pulseNow.sym.win ? String(pulseNow.sym.win) : '';

    const microStats = (symbol, tune) => typeof opBriefing_scalpMicroStats === 'function' ? opBriefing_scalpMicroStats(data, symbol, tune) : null;
    const keyLevelsFor = (symKey) => typeof opBriefing_scalpKeyLevelsFor === 'function' ? opBriefing_scalpKeyLevelsFor(options, symKey) : null;

    const mk = (label, sym, symKey, tune) => {
        if (!sym) return '';
        const m = microStats(sym, tune);
        if (!m) return '';
        const side = symKey === 'WDO' ? 'wdo' : 'win';
        const scalpBiasRaw = m.scalp && m.scalp.signal ? m.scalp.signal : 'neutral';
        const ctx = pulseNow && pulseNow.pulse && pulseNow.pulse[side] ? pulseNow.pulse[side] : null;
        const ctxBias = ctx && ctx.bias ? String(ctx.bias) : 'neutral';
        const ctxNet = ctx && typeof ctx.net === 'number' && Number.isFinite(ctx.net) ? ctx.net : 0;
        const ctxStrong = Math.abs(ctxNet) >= 0.35;

        const usdSym = pulseNow && pulseNow.sym && pulseNow.sym.usdbrl ? String(pulseNow.sym.usdbrl) : ((typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'USD_BRL') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^USD\/BRL\b/i) : null) || '');
        const ibovSym = pulseNow && pulseNow.sym && pulseNow.sym.ibov ? String(pulseNow.sym.ibov) : ((typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'IBOV') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^\.BVSP$/i) : null) || '');
        const pctAt = (symbol, minutes) => {
            if (!symbol) return null;
            if (typeof opBriefing_pctAt === 'function') return opBriefing_pctAt(data, symbol, minutes);
            const s = String(symbol || '');
            const series = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastT = last && last.t ? Date.parse(String(last.t)) : NaN;
            const lastP = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            if (!Number.isFinite(lastT) || lastP === null || !(lastP > 0)) return null;
            const target = lastT - (Number(minutes) * 60 * 1000);
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const t = p && p.t ? Date.parse(String(p.t)) : NaN;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (!Number.isFinite(t) || price === null || !(price > 0)) continue;
                if (t <= target) return ((lastP / price) - 1) * 100;
            }
            return null;
        };
        const usdPct = usdSym ? pctAt(usdSym, 15) : null;
        const ibovPct = ibovSym ? pctAt(ibovSym, 15) : null;
        const selfPct = typeof m.ret15 === 'number' && Number.isFinite(m.ret15) ? m.ret15 : pctAt(sym, 15);
        const sign = (v, th) => {
            if (!(typeof v === 'number' && Number.isFinite(v))) return null;
            const t = typeof th === 'number' && Number.isFinite(th) ? th : 0.10;
            if (v > t) return +1;
            if (v < -t) return -1;
            return 0;
        };
        const parity = (() => {
            const thSelf = tune && typeof tune.th15 === 'number' && Number.isFinite(tune.th15) ? tune.th15 : 0.10;
            const sSelf = sign(selfPct, thSelf);
            if (side === 'wdo') {
                const sUsd = sign(usdPct, thSelf);
                if (sSelf === null || sUsd === null) return { ok: null, label: 'Paridade USD/BRL: n/d' };
                if (sSelf === 0 && sUsd === 0) return { ok: true, label: 'Paridade USD/BRL: neutra' };
                if (sSelf === 0 || sUsd === 0) return { ok: null, label: 'Paridade USD/BRL: sem confirmação' };
                const ok = sSelf === sUsd;
                return { ok, label: `Paridade USD/BRL: ${ok ? 'OK' : 'DIVERGE'}` };
            }
            const sIbov = sign(ibovPct, thSelf);
            if (sSelf === null || sIbov === null) return { ok: null, label: 'Paridade IBOV: n/d' };
            if (sSelf === 0 && sIbov === 0) return { ok: true, label: 'Paridade IBOV: neutra' };
            if (sSelf === 0 || sIbov === 0) return { ok: null, label: 'Paridade IBOV: sem confirmação' };
            const ok = sSelf === sIbov;
            return { ok, label: `Paridade IBOV: ${ok ? 'OK' : 'DIVERGE'}` };
        })();

        const flowScore = foreignFlow && foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score)
            ? foreignFlow.signal.score
            : null;
        const tFlow = operationalTuning && operationalTuning.threshold && typeof operationalTuning.threshold.foreignFlow === 'number' && Number.isFinite(operationalTuning.threshold.foreignFlow) ? operationalTuning.threshold.foreignFlow : 0.25;
        const flowDir = typeof flowScore === 'number'
            ? (flowScore > tFlow ? +1 : flowScore < -tFlow ? -1 : 0)
            : 0;
        const flowBias = side === 'win' ? (flowDir > 0 ? 'buy' : flowDir < 0 ? 'sell' : 'neutral') : (flowDir > 0 ? 'sell' : flowDir < 0 ? 'buy' : 'neutral');
        const flowStrong = typeof flowScore === 'number' && Math.abs(flowScore) >= tFlow;

        const brScore = brFlowSignal && typeof brFlowSignal.score === 'number' && Number.isFinite(brFlowSignal.score) ? brFlowSignal.score : null;
        const tBr = operationalTuning && operationalTuning.threshold && typeof operationalTuning.threshold.brFlow === 'number' && Number.isFinite(operationalTuning.threshold.brFlow) ? operationalTuning.threshold.brFlow : 0.22;
        const brDir = typeof brScore === 'number' ? (brScore > tBr ? +1 : brScore < -tBr ? -1 : 0) : 0;
        const brBias = side === 'win' ? (brDir > 0 ? 'buy' : brDir < 0 ? 'sell' : 'neutral') : (brDir > 0 ? 'sell' : brDir < 0 ? 'buy' : 'neutral');
        const brStrong = typeof brScore === 'number' && Math.abs(brScore) >= Math.max(0.28, tBr) && (brFlowSignal && typeof brFlowSignal.confidence === 'number' ? brFlowSignal.confidence >= 0.62 : true);

        const conflictsWith = (a, b) => (a !== 'neutral' && b !== 'neutral' && a !== b);
        const hardBlock = conflictsWith(scalpBiasRaw, ctxBias) && ctxStrong;
        const flowBlock = conflictsWith(scalpBiasRaw, flowBias) && flowStrong;
        const brFlowBlock = conflictsWith(scalpBiasRaw, brBias) && brStrong;
        const parityBlock = parity.ok === false && (typeof selfPct === 'number' && Number.isFinite(selfPct) && Math.abs(selfPct) > 0.02);

        const scalpBias = (hardBlock || flowBlock || brFlowBlock || parityBlock) ? 'neutral' : scalpBiasRaw;
        const tone = scalpBias === 'buy' ? 'positive' : scalpBias === 'sell' ? 'negative' : 'neutral';
        const txt = scalpBias === 'buy' ? 'COMPRA' : scalpBias === 'sell' ? 'VENDA' : 'NEUTRO';
        const ctxTxt = ctxBias === 'buy' ? 'Compra' : ctxBias === 'sell' ? 'Venda' : 'Neutro';
        const flowTxt = typeof flowScore === 'number' ? `Fluxo ${formatNumber(flowScore, 2)} (${flowBias === 'buy' ? 'Compra' : flowBias === 'sell' ? 'Venda' : 'Neutro'})` : 'Fluxo: —';
        const brTxt = typeof brScore === 'number' ? `Fluxo→BR ${brFlowSignal && brFlowSignal.label ? brFlowSignal.label : ''} ${formatNumber(brScore, 2)} (${brBias === 'buy' ? 'Compra' : brBias === 'sell' ? 'Venda' : 'Neutro'})` : 'Fluxo→BR: —';
        const ctxTone = conflictsWith(scalpBiasRaw, ctxBias) ? 'negative' : (ctxBias !== 'neutral' ? 'positive' : 'neutral');
        const blockReason = hardBlock ? 'Bloqueado por risco/paridade (contexto forte)' : flowBlock ? 'Bloqueado por fluxo estrangeiro (forte)' : brFlowBlock ? 'Bloqueado por fluxo global→BR (forte)' : parityBlock ? 'Bloqueado por paridade' : '';

        const winStats = (lookbackMs) => typeof opBriefing_scalpWinStats === 'function' ? opBriefing_scalpWinStats(data, sym, lookbackMs) : null;
        const s15 = winStats(15 * 60 * 1000);
        const s30 = winStats(30 * 60 * 1000);
        const priceNow = typeof m.lastPrice === 'number' && Number.isFinite(m.lastPrice) ? m.lastPrice : null;
        const range30Pts = s30 && typeof s30.rangePts === 'number' && Number.isFinite(s30.rangePts) ? s30.rangePts : null;
        const range30Pct = s30 && typeof s30.rangePct === 'number' && Number.isFinite(s30.rangePct) ? s30.rangePct : null;

        const scalpState = (() => {
            if (hardBlock || flowBlock || parityBlock) return { label: 'BLOQUEADO', tone: 'negative', reason: blockReason || 'Bloqueado' };
            if (ctxBias !== 'neutral' && conflictsWith(scalpBiasRaw, ctxBias)) return { label: 'CAUTELA', tone: 'neutral', reason: 'Contexto diverge (reduzir mão / exigir confirmação)' };
            if (parity.ok === null) return { label: 'CAUTELA', tone: 'neutral', reason: 'Sem paridade (reduzir mão / exigir confirmação)' };
            return { label: 'OK', tone: 'positive', reason: 'Liberado (micro + paridade/contexto ok)' };
        })();

        const microGate = scalpBiasRaw;
        const setups = typeof opBriefing_scalpComputeSetups === 'function'
            ? opBriefing_scalpComputeSetups({
                data,
                symbol: sym,
                microGate,
                priceNow,
                range30Pts,
                range30Pct,
                s15,
                s30,
                parityOk: parity.ok,
                formatNumber,
                formatPercent,
            })
            : { pullback: { mode: 'N/D' }, breakout: { mode: 'N/D' }, failure: { mode: 'N/D' }, notes: [], lines: [] };

        const setupBadges = (() => {
            const mkB = (name, st) => {
                const mode = st && st.mode ? String(st.mode) : 'N/D';
                const tone = mode === 'ACIONADO' ? 'positive' : mode === 'ARMADO' ? 'neutral' : mode === 'ESPERE' ? 'neutral' : 'neutral';
                return badge(tone, `${name}: ${mode}`);
            };
            const notes = Array.isArray(setups.notes) ? setups.notes : [];
            const notesHtml = notes.length
                ? `<div style="margin-top:6px;opacity:.78;font-size:12px;line-height:1.35;">${notes.map(n => `• ${escapeHtml(n)}`).join('<br>')}</div>`
                : '';
            return `
                    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${mkB('Pullback', setups.pullback)}
                        ${mkB('Romp.', setups.breakout)}
                        ${mkB('Falha', setups.failure)}
                    </div>
                    ${notesHtml}
                `;
        })();
        const setupLines = Array.isArray(setups.lines) ? setups.lines : [];

        const r5 = typeof m.ret5 === 'number' && Number.isFinite(m.ret5) ? formatPercent(m.ret5, 2) : '—';
        const r15 = typeof m.ret15 === 'number' && Number.isFinite(m.ret15) ? formatPercent(m.ret15, 2) : '—';
        const r60 = typeof m.ret60 === 'number' && Number.isFinite(m.ret60) ? formatPercent(m.ret60, 2) : '—';
        const rangeP = m.range30 && typeof m.range30.pct === 'number' && Number.isFinite(m.range30.pct) ? formatPercent(m.range30.pct, 2) : '—';
        const rangePts = m.range30 && typeof m.range30.pts === 'number' && Number.isFinite(m.range30.pts) ? formatNumber(m.range30.pts, 0) : '—';

        const stop = m.risk && typeof m.risk.stopPct === 'number' && Number.isFinite(m.risk.stopPct) ? formatPercent(m.risk.stopPct, 2) : '—';
        const alvo = m.risk && typeof m.risk.alvoPct === 'number' && Number.isFinite(m.risk.alvoPct) ? formatPercent(m.risk.alvoPct, 2) : '—';
        const stopPts = m.risk && typeof m.risk.stopPts === 'number' && Number.isFinite(m.risk.stopPts) ? formatNumber(m.risk.stopPts, 0) : '—';
        const alvoPts = m.risk && typeof m.risk.alvoPts === 'number' && Number.isFinite(m.risk.alvoPts) ? formatNumber(m.risk.alvoPts, 0) : '—';

        const lvl = keyLevelsFor(symKey);
        const gf = lvl && typeof lvl.gf === 'number' ? fmt0(lvl.gf) : '—';
        const rl = lvl && typeof lvl.rangeLow === 'number' ? fmt0(lvl.rangeLow) : '—';
        const rh = lvl && typeof lvl.rangeHigh === 'number' ? fmt0(lvl.rangeHigh) : '—';

        const plan = (() => {
            if (scalpBias === 'buy') return `Scalp: comprar a favor (5m×15m) • Stop ~${stop} (~${stopPts} pts) • Alvo ~${alvo} (~${alvoPts} pts) • Pivô GF ${gf}`;
            if (scalpBias === 'sell') return `Scalp: vender a favor (5m×15m) • Stop ~${stop} (~${stopPts} pts) • Alvo ~${alvo} (~${alvoPts} pts) • Pivô GF ${gf}`;
            return `Scalp: sem edge (5m×15m) • Range ${rl}–${rh} • Pivô GF ${gf}`;
        })();

        return `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(label)}</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(tone, `Scalp: ${txt}`)}
                            ${badge('neutral', `${escapeHtml(sym)}`)}
                            ${badge(ctxTone, `Contexto: ${escapeHtml(ctxTxt)} (${formatNumber(ctxNet, 2)})`)}
                            ${badge(scalpState.tone, `Estado: ${escapeHtml(scalpState.label)}`)}
                        </div>
                    </div>
                    <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                        Micro: 5m ${escapeHtml(r5)} • 15m ${escapeHtml(r15)} • 60m ${escapeHtml(r60)} • Range30 ${escapeHtml(rangeP)} (${escapeHtml(rangePts)} pts)
                    </div>
                    <div style="margin-top:8px;opacity:.90;font-size:12px;line-height:1.35;">
                        ${escapeHtml(m.scalp && m.scalp.label ? m.scalp.label : '—')}
                    </div>
                    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(parity.ok === false ? 'negative' : parity.ok === true ? 'positive' : 'neutral', escapeHtml(parity.label))}
                        ${badge(flowStrong && conflictsWith(scalpBiasRaw, flowBias) ? 'negative' : flowBias !== 'neutral' ? 'neutral' : 'neutral', escapeHtml(flowTxt))}
                        ${badge(brStrong && conflictsWith(scalpBiasRaw, brBias) ? 'negative' : brBias !== 'neutral' ? 'neutral' : 'neutral', escapeHtml(brTxt))}
                    </div>
                    <div style="margin-top:10px;border:1px dashed rgba(255,255,255,.16);border-radius:12px;padding:10px;background:rgba(0,0,0,.14);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Gatilhos (entrada)</div>
                        ${setupBadges}
                        <div style="opacity:.86;font-size:12px;line-height:1.45;">
                            ${setupLines.map(x => `• ${escapeHtml(x)}`).join('<br>')}
                        </div>
                    </div>
                    <div style="margin-top:10px;opacity:.92;line-height:1.35;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Plano (scalp)</div>
                        <div style="opacity:.86;font-size:12px;">${escapeHtml(plan)}</div>
                        ${blockReason ? `<div style="margin-top:6px;opacity:.78;font-size:12px;">${escapeHtml(blockReason)}</div>` : ''}
                    </div>
                </div>
            `;
    };

    const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
    const adj = amp >= 1.25 ? 1.25 : amp >= 1.12 ? 1.12 : amp <= 0.90 ? 0.85 : 1;
    const wdoCard = mk('WDO (Day Trade)', symWdo, 'WDO', { th5: 0.05 * adj, th15: 0.10 * adj });
    const winCard = mk('WIN (Day Trade)', symWin, 'WIN', { th5: 0.05 * adj, th15: 0.10 * adj });
    if (!wdoCard && !winCard) return '';

    return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">⚡ Scalp (Day Trade) — WDO • WIN</div>
                    <div style="opacity:.78;font-size:12px;">Sinal curto baseado em 5m×15m (microtendência) + Range30 (gestão) • thresholds ajustam por volAmp.</div>
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">
                    ${wdoCard}
                    ${winCard}
                </div>
            </div>
        `;
}
