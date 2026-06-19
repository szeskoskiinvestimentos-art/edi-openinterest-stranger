function opBriefing_computeFactorsRowsHtml({
    data,
    regime,
    macro,
    macroWdo,
    macroWin,
    newsTilt,
    priceLead,
    trendLead,
    localTapeLead,
    pulseLead,
    operationalTuning,
    diSignal,
    cdsSignal,
    getLastPoint,
    pointPct,
    formatPercent,
    formatNumber,
    escapeHtml,
    toneBadgeHtmlFromTone,
}) {
    const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });
    const mkPct = v => (typeof v === 'number' ? formatPercent(v, 2) : '—');
    const mkNum = v => (typeof v === 'number' ? formatNumber(v, 2) : '—');
    const dirTone = d => d > 0 ? 'positive' : d < 0 ? 'negative' : 'neutral';
    const link = (href, label) => {
        if (!href) return escapeHtml(label);
        return `<a href="${href}" style="color:inherit;text-decoration:underline;text-decoration-color:rgba(255,255,255,.25);text-underline-offset:3px;">${escapeHtml(label)}</a>`;
    };

    const sideLabel = (x) => x > 0 ? 'Compra' : x < 0 ? 'Venda' : 'Neutro';

    const valuePricePct = (symbol) => {
        const last = getLastPoint(data, symbol) || null;
        const price = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        const pct = pointPct(last);
        const px = price !== null ? mk('neutral', mkNum(price)) : mk('neutral', '—');
        const pp = pct !== null ? mk('neutral', mkPct(pct)) : mk('neutral', '—');
        return { pct, html: `${px} • ${pp}` };
    };

    const rows = [];

    rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#regimeConviction', 'Flow (Regime)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', regime ? regime.label : '—')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.flow))}</td>
                            </tr>
                        `);
    rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#newsWebModule', 'Notícias (tilt)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">WDO ${mkNum(newsTilt.wdo.score)} • WIN ${mkNum(newsTilt.win.score)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(newsTilt.wdo.score), newsTilt.wdo.score > 0.22 ? 'Compra' : newsTilt.wdo.score < -0.22 ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(newsTilt.win.score), newsTilt.win.score > 0.22 ? 'Compra' : newsTilt.win.score < -0.22 ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', '0.4')}</td>
                            </tr>
                        `);
    rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#operational-now', 'Confirmação (lead)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const pick = (x, label) => (x && x.active) ? { ...x, _label: label } : null;
                                    const lead = pick(priceLead, 'PREÇO') || pick(trendLead, 'TENDÊNCIA') || pick(localTapeLead, 'FITA_LOCAL') || pick(pulseLead, 'PULSO') || null;
                                    if (!lead) return mk('neutral', 'Sem lead forte (micro misto)');
                                    const tone = lead._label === 'PREÇO' ? 'positive' : lead._label === 'TENDÊNCIA' ? 'neutral' : lead._label === 'FITA_LOCAL' ? 'neutral' : 'neutral';
                                    const txt = `${lead._label}: ${String(lead.reason || '—')}`;
                                    return mk(tone, txt);
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const pick = (x, label) => (x && x.active) ? { ...x, _label: label } : null;
                                    const lead = pick(priceLead, 'PREÇO') || pick(trendLead, 'TENDÊNCIA') || pick(localTapeLead, 'FITA_LOCAL') || pick(pulseLead, 'PULSO') || null;
                                    if (!lead) return mk('neutral', 'n/d');
                                    if (lead._label === 'PULSO') {
                                        const b = lead.wdo;
                                        return mk(dirTone(b === 'buy' ? +1 : b === 'sell' ? -1 : 0), b === 'buy' ? 'Compra' : b === 'sell' ? 'Venda' : 'Neutro');
                                    }
                                    const mode = String(lead.mode || '');
                                    if (mode === 'risk_off' || mode === 'risk_off_local') return mk('positive', 'Compra');
                                    if (mode === 'risk_on' || mode === 'risk_on_local') return mk('negative', 'Venda');
                                    return mk('neutral', 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${(() => {
                                    const pick = (x, label) => (x && x.active) ? { ...x, _label: label } : null;
                                    const lead = pick(priceLead, 'PREÇO') || pick(trendLead, 'TENDÊNCIA') || pick(localTapeLead, 'FITA_LOCAL') || pick(pulseLead, 'PULSO') || null;
                                    if (!lead) return mk('neutral', 'n/d');
                                    if (lead._label === 'PULSO') {
                                        const b = lead.win;
                                        return mk(dirTone(b === 'buy' ? +1 : b === 'sell' ? -1 : 0), b === 'buy' ? 'Compra' : b === 'sell' ? 'Venda' : 'Neutro');
                                    }
                                    const mode = String(lead.mode || '');
                                    if (mode === 'risk_off' || mode === 'risk_off_local') return mk('negative', 'Venda');
                                    if (mode === 'risk_on' || mode === 'risk_on_local') return mk('positive', 'Compra');
                                    return mk('neutral', 'Neutro');
                                })()}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'tático')}</td>
                            </tr>
                        `);
    rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#overview', 'DXY')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro ? macro.dxyPct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.dxy))}</td>
                            </tr>
                        `);

    {
        const snap = valuePricePct('USDX');
        const t = (operationalTuning && operationalTuning.threshold && typeof operationalTuning.threshold.dxy === 'number' && Number.isFinite(operationalTuning.threshold.dxy))
            ? operationalTuning.threshold.dxy
            : 0.12;
        const pct = snap.pct;
        const dirWdo = typeof pct === 'number' ? (pct > t ? +1 : pct < -t ? -1 : 0) : 0;
        const dirWin = typeof pct === 'number' ? (pct > t ? -1 : pct < -t ? +1 : 0) : 0;
        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#overview', 'USDX (DX=F)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${snap.html}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(dirWdo), sideLabel(dirWdo))}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(dirWin), sideLabel(dirWin))}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
    }

    rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#chinaBrazil', 'Export Basket')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro ? macro.exportScore : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'sell' ? 'Venda' : macroWdo.bias === 'buy' ? 'Compra' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.export))}</td>
                            </tr>
                        `);
    rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#chinaBrazil', 'EM Basket (USD/EM)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mkPct(macro && macro.em ? macro.em.pct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.em))}</td>
                            </tr>
                        `);

    {
        const snap = valuePricePct('HTDIX.O');
        const t = 0.25;
        const pct = snap.pct;
        const dirWdo = typeof pct === 'number' ? (pct > t ? -1 : pct < -t ? +1 : 0) : 0;
        const dirWin = typeof pct === 'number' ? (pct > t ? +1 : pct < -t ? -1 : 0) : 0;
        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#us-equities', 'HTDIX (Dividend+Momentum)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${snap.html}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(dirWdo), sideLabel(dirWdo))}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(dirWin), sideLabel(dirWin))}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
    }

    {
        const fs = macro && macro.flowSentinel ? macro.flowSentinel : null;
        const cell = (() => {
            if (!fs || typeof fs.composite !== 'number' || !Number.isFinite(fs.composite)) return mk('neutral', '—');
            const lab = fs.label ? String(fs.label) : '';
            const txt = `${lab ? `${lab} ` : ''}${formatNumber(fs.composite, 3)}${fs.divergence ? ' • DIVERGENTE' : ''}`;
            return mk(fs.divergence ? 'negative' : 'neutral', txt);
        })();
        const impacts = (() => {
            if (!fs || fs.divergence || typeof fs.composite !== 'number' || !Number.isFinite(fs.composite)) return { wdo: mk('neutral', 'Neutro'), win: mk('neutral', 'Neutro') };
            const t = typeof operationalTuning.threshold.flowSentinel === 'number' && Number.isFinite(operationalTuning.threshold.flowSentinel) ? operationalTuning.threshold.flowSentinel : 0.25;
            const dirUsd = fs.composite < -t ? +1 : fs.composite > t ? -1 : 0;
            const w = mk(dirTone(dirUsd), sideLabel(dirUsd));
            const b = -dirUsd;
            const i = mk(dirTone(b), sideLabel(b));
            return { wdo: w, win: i };
        })();
        const wTxt = String((typeof operationalTuning.weight.flowSentinel === 'number' && Number.isFinite(operationalTuning.weight.flowSentinel)) ? operationalTuning.weight.flowSentinel : 0.18);
        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#flow-sentinel', 'Sentinela de Fluxo (FX)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${cell}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${impacts.wdo}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${impacts.win}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', wTxt)}</td>
                            </tr>
                        `);
    }

    rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#ratesBuckets', 'Juros (US10Y/BR10Y)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">US ${mkPct(macro && macro.yields ? macro.yields.us10yPct : null)} • BR ${mkPct(macro && macro.yields ? macro.yields.br10yPct : null)}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWdo.score), macroWdo.bias === 'buy' ? 'Compra' : macroWdo.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(dirTone(macroWin.score), macroWin.bias === 'buy' ? 'Compra' : macroWin.bias === 'sell' ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', String(operationalTuning.weight.yields))}</td>
                            </tr>
                        `);

    {
        const value = (() => {
            if (!diSignal || !diSignal.ok) return mk('neutral', '—');
            const fmtRate = v => (typeof v === 'number' && Number.isFinite(v) ? `${formatNumber(v, 2)}%` : '—');
            const fmtChg = v => (typeof v === 'number' && Number.isFinite(v) ? `${(v * 10) > 0 ? '+' : ''}${formatNumber(v * 10, 1)}bp` : '—');
            const a = diSignal.anchors || {};
            const s = a.short || null;
            const m = a.mid || null;
            const l = a.long || null;
            const pickTxt = (label, x) => {
                if (!x) return `${label} —`;
                const sym = x.symbol ? String(x.symbol) : '—';
                return `${label} ${sym} ${fmtRate(x.rate)} (${fmtChg(x.chgPct)})`;
            };
            const label = `${pickTxt('Curto', s)} • ${pickTxt('Médio', m)} • ${pickTxt('Longo', l)} • ${String(diSignal.shape || '')}`;
            return escapeHtml(label);
        })();
        const wdo = (() => {
            if (!diSignal || !diSignal.ok) return mk('neutral', 'Neutro');
            const b = diSignal.wdoBias;
            const tone = b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral';
            return mk(tone, b === 'buy' ? 'Compra' : b === 'sell' ? 'Venda' : 'Neutro');
        })();
        const win = (() => {
            if (!diSignal || !diSignal.ok) return mk('neutral', 'Neutro');
            const b = diSignal.winBias;
            const tone = b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral';
            return mk(tone, b === 'buy' ? 'Compra' : b === 'sell' ? 'Venda' : 'Neutro');
        })();
        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#ratesBuckets', 'DI1 (B3)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${value}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${wdo}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${win}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
    }

    {
        const value = `${mkPct(cdsSignal && cdsSignal.drivers ? cdsSignal.drivers.cds : null)} • ${mk(cdsSignal ? cdsSignal.tone : 'neutral', cdsSignal ? cdsSignal.label : 'n/d')}`;
        const wdo = (() => {
            if (!cdsSignal) return mk('neutral', 'Neutro');
            if (cdsSignal.mode === 'risk_off_classic') return mk('positive', 'Compra');
            if (cdsSignal.mode === 'relief_risk_on') return mk('negative', 'Venda');
            if (cdsSignal.mode === 'hedge_on_risk_on') return mk('neutral', 'Venda');
            return mk('neutral', 'Neutro');
        })();
        const win = (() => {
            if (!cdsSignal) return mk('neutral', 'Neutro');
            if (cdsSignal.mode === 'risk_off_classic') return mk('negative', 'Venda');
            if (cdsSignal.mode === 'relief_risk_on') return mk('positive', 'Compra');
            if (cdsSignal.mode === 'hedge_on_risk_on') return mk('neutral', 'Compra');
            return mk('neutral', 'Neutro');
        })();
        rows.push(`
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#operational-now', 'CDS Brasil (fluxo x hedge)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${value}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${wdo}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${win}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk('neutral', 'informativo')}</td>
                            </tr>
                        `);
    }

    return rows.join('');
}
