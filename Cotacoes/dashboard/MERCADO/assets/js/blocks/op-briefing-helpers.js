function opBriefing_pctAt(data, symbol, minutes) {
    if (!data || !symbol) return null;
    const s = String(symbol || '');
    const series = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : [];
    if (!series.length) return null;
    const last = series[series.length - 1];
    const lastT = last && last.t ? Date.parse(String(last.t)) : NaN;
    const lastP = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
    if (!Number.isFinite(lastT) || lastP === null || !(lastP > 0)) return null;
    const target = lastT - (Number(minutes) * 60 * 1000);
    let prev = null;
    for (let i = series.length - 1; i >= 0; i -= 1) {
        const p = series[i];
        const t = p && p.t ? Date.parse(String(p.t)) : NaN;
        const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        if (!Number.isFinite(t) || price === null || !(price > 0)) continue;
        if (t <= target) { prev = { t, price }; break; }
    }
    if (!prev) return null;
    return ((lastP / prev.price) - 1) * 100;
}

function opBriefing_computeVolAmp({ data, pulseNow }) {
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    if (!data || !pulseNow || !pulseNow.sym) return { amp: 1, vix: null, vxbr: null };
    const spot = (s) => {
        if (!s) return null;
        const p = (getMostRecentPointWithPrice(data, s) || getLastPoint(data, s));
        const px = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
        return px;
    };
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const vixSym = pulseNow.sym.vix || pulseNow.sym.vix30 || pulseNow.sym.vix9d || null;
    const vxbrSym = pulseNow.sym.vxbr || null;
    const vix = spot(vixSym);
    const vxbr = spot(vxbrSym);
    const vixRel = isNum(vix) ? clamp(vix / 20, 0.75, 1.4) : null;
    const vxbrRel = isNum(vxbr) ? clamp(vxbr / 18, 0.75, 1.5) : null;
    const amp = (vixRel !== null && vxbrRel !== null)
        ? ((vixRel + vxbrRel) / 2)
        : (vixRel !== null ? vixRel : (vxbrRel !== null ? vxbrRel : 1));
    return { amp: isNum(amp) ? amp : 1, vix: isNum(vix) ? vix : null, vxbr: isNum(vxbr) ? vxbr : null };
}

function opBriefing_computePriceLead({ data, pulseNow, volAmp }) {
    if (!data) return { active: false, reason: '' };
    const winPct = pulseNow && pulseNow.market ? pulseNow.market.winPct : null;
    const wdoPct = pulseNow && pulseNow.market ? pulseNow.market.wdoPct : null;
    const usdSym = (pulseNow && pulseNow.sym && pulseNow.sym.usdbrl)
        || findAliasSymbolBest(data, 'USD_BRL')
        || findAliasSymbol(data, 'USD_BRL')
        || findAssetSymbol(data, /^USD\/BRL\b/i);
    const usdPct = usdSym ? getChangePct(data, usdSym) : null;
    const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
    const thWin = 0.25 / amp;
    const thWdo = 0.25 / amp;
    const okWinWdo = typeof winPct === 'number' && Number.isFinite(winPct) && typeof wdoPct === 'number' && Number.isFinite(wdoPct);
    if (!okWinWdo) return { active: false, reason: '' };

    const riskOn = (winPct >= thWin && wdoPct <= -thWdo);
    const riskOff = (winPct <= -thWin && wdoPct >= thWdo);
    const usdTh = 0.04 / amp;
    const okUsdOn = typeof usdPct === 'number' && Number.isFinite(usdPct) ? (usdPct <= -usdTh) : true;
    const okUsdOff = typeof usdPct === 'number' && Number.isFinite(usdPct) ? (usdPct >= usdTh) : true;

    const volTxt = volAmp && (volAmp.vix !== null || volAmp.vxbr !== null) ? ` • volAmp ${formatNumber(amp, 2)}` : '';
    if (riskOn && okUsdOn) return { active: true, mode: 'risk_on', reason: `WIN ${formatPercent(winPct, 2)} • WDO ${formatPercent(wdoPct, 2)} • USD/BRL ${typeof usdPct === 'number' && Number.isFinite(usdPct) ? formatPercent(usdPct, 2) : '—'}${volTxt}` };
    if (riskOff && okUsdOff) return { active: true, mode: 'risk_off', reason: `WIN ${formatPercent(winPct, 2)} • WDO ${formatPercent(wdoPct, 2)} • USD/BRL ${typeof usdPct === 'number' && Number.isFinite(usdPct) ? formatPercent(usdPct, 2) : '—'}${volTxt}` };
    return { active: false, reason: '' };
}

function opBriefing_computeTrendLead({ data, pulseNow, volAmp }) {
    if (!data || !pulseNow || !pulseNow.sym) return { active: false, mode: '', reason: '' };
    const symWin = pulseNow.sym.win;
    const symWdo = pulseNow.sym.wdo;
    const win60 = opBriefing_pctAt(data, symWin, 60);
    const wdo60 = opBriefing_pctAt(data, symWdo, 60);
    const win15 = opBriefing_pctAt(data, symWin, 15);
    const wdo15 = opBriefing_pctAt(data, symWdo, 15);
    const win5 = opBriefing_pctAt(data, symWin, 5);
    const wdo5 = opBriefing_pctAt(data, symWdo, 5);
    const ok = (x) => (typeof x === 'number' && Number.isFinite(x));
    if (!ok(win60) || !ok(wdo60) || !ok(win15) || !ok(wdo15)) return { active: false, mode: '', reason: '' };

    const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
    const th60 = 0.22 / amp;
    const th15 = 0.10 / amp;
    const th5 = 0.06 / amp;

    const riskOn60 = (win60 >= th60 && win15 >= th15 && wdo60 <= -th60 && wdo15 <= -th15);
    const riskOff60 = (win60 <= -th60 && win15 <= -th15 && wdo60 >= th60 && wdo15 >= th15);

    const ok5 = ok(win5) && ok(wdo5);
    const microConflict = ok5 && (
        (riskOn60 && (win5 <= -th5 || wdo5 >= th5))
        || (riskOff60 && (win5 >= th5 || wdo5 <= -th5))
    );
    if (microConflict) return { active: false, mode: '', reason: '' };

    const fastAllowed = amp >= 1.12 && ok5;
    const fastOn = fastAllowed
        && (win15 >= th15 && win5 >= th5 && wdo15 <= -th15 && wdo5 <= -th5)
        && (win60 > -th60 * 0.6 && wdo60 < th60 * 0.6);
    const fastOff = fastAllowed
        && (win15 <= -th15 && win5 <= -th5 && wdo15 >= th15 && wdo5 >= th5)
        && (win60 < th60 * 0.6 && wdo60 > -th60 * 0.6);

    const riskOn = riskOn60 || (!riskOff60 && fastOn);
    const riskOff = riskOff60 || (!riskOn60 && fastOff);
    if (!riskOn && !riskOff) return { active: false, mode: '', reason: '' };

    const fast = !riskOn60 && !riskOff60;
    const sfx5 = ok5 ? ` / ${formatPercent(win5, 2)}` : '';
    const sfxW5 = ok5 ? ` / ${formatPercent(wdo5, 2)}` : '';
    const tag = fast ? 'Tendência 15m/5m' : 'Tendência 60m/15m';
    const volTxt = volAmp && (volAmp.vix !== null || volAmp.vxbr !== null) ? ` • volAmp ${formatNumber(amp, 2)}` : '';
    const reason = `${tag}: WIN ${formatPercent(win60, 2)} / ${formatPercent(win15, 2)}${sfx5} • WDO ${formatPercent(wdo60, 2)} / ${formatPercent(wdo15, 2)}${sfxW5}${volTxt}`;
    return { active: true, mode: riskOff ? 'risk_off' : 'risk_on', reason };
}

function opBriefing_computeLocalTapeLead({ data, pulseNow, volAmp }) {
    if (!data || !pulseNow || !pulseNow.sym) return { active: false, mode: '', reason: '' };

    const ok = v => typeof v === 'number' && Number.isFinite(v);
    const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
    const th60 = 0.18 / amp;
    const th15 = 0.08 / amp;
    const th5 = 0.05 / amp;
    const thEq = 0.10 / amp;
    const thFx = 0.05 / amp;
    const thVx = 0.18 / amp;

    const symWin = pulseNow.sym.win || null;
    const symWdo = pulseNow.sym.wdo || null;
    const symIbov = pulseNow.sym.ibov || findAliasSymbolBest(data, 'IBOV') || findAliasSymbol(data, 'IBOV') || findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b|\bIBOV\b)/i);
    const symEwz = pulseNow.sym.ewz || findAliasSymbolBest(data, 'EWZ') || findAliasSymbol(data, 'EWZ') || findAssetSymbol(data, /^EWZ(\.\w+)?$/i);
    const symUsd = pulseNow.sym.usdbrl || findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i);
    const symVxbr = pulseNow.sym.vxbr || findAliasSymbolBest(data, 'VXBR') || findAssetSymbol(data, /(^\.VXBR$|\bVXBR\b)/i);

    const win60 = opBriefing_pctAt(data, symWin, 60);
    const win15 = opBriefing_pctAt(data, symWin, 15);
    const win5 = opBriefing_pctAt(data, symWin, 5);
    const wdo60 = opBriefing_pctAt(data, symWdo, 60);
    const wdo15 = opBriefing_pctAt(data, symWdo, 15);
    const ibov15 = opBriefing_pctAt(data, symIbov, 15);
    const ewz15 = opBriefing_pctAt(data, symEwz, 15);
    const usd15 = opBriefing_pctAt(data, symUsd, 15);
    const vxbr15 = opBriefing_pctAt(data, symVxbr, 15);

    const winDown = ok(win60) && ok(win15) && win60 <= -th60 && win15 <= -th15 && (!ok(win5) || win5 <= th5);
    const winUp = ok(win60) && ok(win15) && win60 >= th60 && win15 >= th15 && (!ok(win5) || win5 >= -th5);
    const wdoUp = ok(wdo60) && ok(wdo15) && wdo60 >= th60 && wdo15 >= th15;
    const wdoDown = ok(wdo60) && ok(wdo15) && wdo60 <= -th60 && wdo15 <= -th15;

    const confirmSell = [
        ok(ibov15) && ibov15 <= -thEq,
        ok(ewz15) && ewz15 <= -thEq,
        ok(usd15) && usd15 >= thFx,
        ok(vxbr15) && vxbr15 >= thVx,
        wdoUp,
    ].filter(Boolean).length;

    const confirmBuy = [
        ok(ibov15) && ibov15 >= thEq,
        ok(ewz15) && ewz15 >= thEq,
        ok(usd15) && usd15 <= -thFx,
        ok(vxbr15) && vxbr15 <= -thVx,
        wdoDown,
    ].filter(Boolean).length;

    const reasonBase = `WIN ${ok(win60) ? formatPercent(win60, 2) : '—'} / ${ok(win15) ? formatPercent(win15, 2) : '—'}${ok(win5) ? ` / ${formatPercent(win5, 2)}` : ''} • IBOV15 ${ok(ibov15) ? formatPercent(ibov15, 2) : '—'} • EWZ15 ${ok(ewz15) ? formatPercent(ewz15, 2) : '—'} • USD/BRL15 ${ok(usd15) ? formatPercent(usd15, 2) : '—'} • VXBR15 ${ok(vxbr15) ? formatPercent(vxbr15, 2) : '—'}`;

    if (winDown && confirmSell >= 2) {
        return { active: true, mode: 'risk_off_local', reason: `Fita local fraca: ${reasonBase}` };
    }
    if (winUp && confirmBuy >= 2) {
        return { active: true, mode: 'risk_on_local', reason: `Fita local forte: ${reasonBase}` };
    }
    return { active: false, mode: '', reason: '' };
}

function opBriefing_computePulseLead({ pulseNow }) {
    if (!pulseNow || !pulseNow.pulse) return { active: false, wdo: null, win: null, reason: '' };
    const w = pulseNow.pulse.wdo;
    const i = pulseNow.pulse.win;
    const strong = x => x && typeof x.net === 'number' && Number.isFinite(x.net) && Math.abs(x.net) >= 0.95;
    if (!strong(w) || !strong(i)) return { active: false, wdo: null, win: null, reason: '' };
    const wb = w && w.bias ? w.bias : 'neutral';
    const ib = i && i.bias ? i.bias : 'neutral';
    const coherent =
        (wb === 'buy' && ib === 'sell')
        || (wb === 'sell' && ib === 'buy');
    if (!coherent) return { active: false, wdo: null, win: null, reason: '' };
    const reason = `WDO net ${formatNumber(w.net, 2)} • WIN net ${formatNumber(i.net, 2)}`;
    return { active: true, wdo: wb, win: ib, reason };
}

function opBriefing_computeConfidence({ regime, combined, newsTilt, agendaIntel, macroWdo, macroWin, priceLead, trendLead, localTapeLead, pulseLead, pulseNow }) {
    const base = regime && typeof regime.convictionScore === 'number' && Number.isFinite(regime.convictionScore)
        ? regime.convictionScore
        : 0.55;
    const conflicts = (combined.wdo.conflict ? 1 : 0) + (combined.win.conflict ? 1 : 0);
    const newsW = newsTilt.wdo.w || 0;
    const newsAdj = newsW >= 4 ? 0.06 : newsW >= 2 ? 0.03 : 0;
    const agendaAdj = (() => {
        const win = Array.isArray(agendaIntel.inWindow) ? agendaIntel.inWindow : [];
        const hasHigh = win.some(x => String(x.impact || '').toUpperCase() === 'ALTO');
        const hasMed = win.some(x => String(x.impact || '').toUpperCase() === 'MÉDIO' || String(x.impact || '').toUpperCase() === 'MEDIO');
        if (hasHigh) return -0.10;
        if (hasMed) return -0.06;
        if (String(agendaIntel.risk || '') === 'alto') return -0.06;
        if (String(agendaIntel.risk || '') === 'médio' || String(agendaIntel.risk || '') === 'medio') return -0.03;
        return 0;
    })();
    const macroAdj = (() => {
        let adj = 0;
        if (macroWdo.bias !== 'neutral' && macroWdo.bias === combined.wdo.bias) adj += 0.03;
        if (macroWin.bias !== 'neutral' && macroWin.bias === combined.win.bias) adj += 0.03;
        if (combined.wdo.conflict || combined.win.conflict) {
            if (macroWdo.bias === 'neutral' && macroWin.bias === 'neutral') adj -= 0.04;
            else adj += 0.00;
        }
        return adj;
    })();
    const priceAdj = priceLead.active ? 0.06 : 0;
    const trendAdj = (!priceLead.active && trendLead.active) ? 0.04 : 0;
    const localTapeAdj = (!priceLead.active && !trendLead.active && localTapeLead.active) ? 0.03 : 0;
    const pulseAdj = (!priceLead.active && !trendLead.active && pulseLead.active) ? 0.05 : 0;
    const alignAdj = (() => {
        if (!pulseNow || !pulseNow.align) return 0;
        let adj = 0;
        const wdo = pulseNow.align.wdo_usdbrl;
        if (wdo && wdo.ok === false) {
            const strong = typeof wdo.a === 'number' && Number.isFinite(wdo.a) && Math.abs(wdo.a) >= 0.12
                && typeof wdo.b === 'number' && Number.isFinite(wdo.b) && Math.abs(wdo.b) >= 0.12;
            if (strong) adj -= 0.06;
        }
        const winIbov = pulseNow.align.win_ibov;
        const winEwz = pulseNow.align.win_ewz;
        const misaligned =
            (winIbov && winIbov.ok === false && typeof winIbov.a === 'number' && typeof winIbov.b === 'number' && Math.abs(winIbov.a) >= 0.10 && Math.abs(winIbov.b) >= 0.10)
            || (winEwz && winEwz.ok === false && typeof winEwz.a === 'number' && typeof winEwz.b === 'number' && Math.abs(winEwz.a) >= 0.10 && Math.abs(winEwz.b) >= 0.10);
        if (misaligned) adj -= 0.05;
        return adj;
    })();
    const out = Math.max(0, Math.min(1, base + newsAdj + agendaAdj + macroAdj + priceAdj + trendAdj + localTapeAdj + pulseAdj + alignAdj - conflicts * 0.10));
    const label = out >= 0.72 ? 'ALTA' : out >= 0.56 ? 'MÉDIA' : 'BAIXA';
    return { score: out, label };
}

function opBriefing_computeAgendaIntel({ dc }) {
    const items = Array.isArray(agendaAutoCache)
        ? agendaAutoCache
        : (window.ECONOMIC_CALENDAR_DATA && Array.isArray(window.ECONOMIC_CALENDAR_DATA.items) ? window.ECONOMIC_CALENDAR_DATA.items : []);
    if (!dc || typeof dc.analyzeAgenda !== 'function') return { upcoming: [], next: { any: null, high: null, medium: null }, inWindow: [], risk: 'baixo' };
    return dc.analyzeAgenda(items, { now: new Date(), lookaheadMinutes: 240 });
}

function opBriefing_computeAgendaValidation({ dc, data, agendaNext, agendaIfThen, dcDeps, pickFreshestCandidate, rcKey, formatNumber }) {
    if (!dc || !data || !agendaNext) return { score: null, label: '—', detail: '', keys: [] };
    const cur = String(agendaNext.currency || '').toUpperCase();
    const pick = (candidates) => pickFreshestCandidate(candidates);

    const candFor = (k) => {
        const key = String(k || '').toUpperCase();
        if (key === 'DXY') return [{ aliasKey: 'DXY' }, { matcher: /(^\.DXY$|\bDXY\b)/i }];
        if (key === 'US10Y') {
            const sym = rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'US10Y' }, { matcher: /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b)/i }];
        }
        if (key === 'US2Y') {
            const sym = rcKey('US_2Y', /(^US2YT=RR$|\bUS\s*2Y\b)/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'US2Y' }, { matcher: /(^US2YT=RR$|\bUS\s*2Y\b)/i }];
        }
        if (key === 'VIX') return [{ aliasKey: 'VIX9D' }, { aliasKey: 'VIX30' }, { aliasKey: 'VIX' }, { matcher: /^\.?VIX(9D)?$/i }];
        if (key === 'SPX') return [{ aliasKey: 'SPX' }, { matcher: /(^\^GSPC$|\bS&P\s*500\b|^SPX$)/i }];
        if (key === 'HYG') {
            const sym = rcKey('ETF_HYG', /^HYG$/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'HYG' }, { matcher: /^HYG$/i }];
        }
        if (key === 'LQD') {
            const sym = rcKey('ETF_LQD', /^LQD$/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'LQD' }, { matcher: /^LQD$/i }];
        }

        if (key === 'USD_BRL') return [{ aliasKey: 'USD_BRL' }, { matcher: /^USD\/BRL\b/i }];
        if (key === 'BR10Y') {
            const sym = rcKey('BR_10Y', /^BR10YT=RR$/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'BR10Y' }, { matcher: /^BR10YT=RR$/i }];
        }
        if (key === 'IBOV') return [{ aliasKey: 'IBOV' }, { matcher: /(^\.BVSP$|\bIbovespa\b|\bIBOV\b)/i }];
        if (key === 'EWZ') return [{ aliasKey: 'EWZ' }, { matcher: /^EWZ$/i }];

        if (key === 'USD_CNH') return [{ aliasKey: 'USD_CNH' }, { aliasKey: 'USD_CNY' }, { matcher: /^USD\/CNH\b/i }, { matcher: /^USD\/CNY\b/i }];
        if (key === 'IRON') return [{ aliasKey: 'IRON' }, { matcher: /(^DCE_I0$|\bmin[eé]rio\b)/i }];
        if (key === 'COPPER') return [{ aliasKey: 'COPPER' }, { matcher: /(^HG$|HG=F|\bcobre\b)/i }];
        if (key === 'BRENT') return [{ aliasKey: 'BRENT' }, { aliasKey: 'WTI' }, { matcher: /\bBrent\b/i }, { matcher: /\bWTI\b/i }];
        if (key === 'FXI') return [{ aliasKey: 'FXI' }, { matcher: /^FXI$/i }];
        return [];
    };

    const defaultKeys = (() => {
        if (cur === 'USD') return ['DXY', 'US10Y', 'VIX', 'SPX'];
        if (cur === 'BRL') return ['USD_BRL', 'BR10Y', 'IBOV', 'EWZ'];
        if (cur === 'CNY' || cur === 'CNH' || cur === 'HKD') return ['USD_CNH', 'IRON', 'COPPER', 'BRENT', 'FXI'];
        return [];
    })();

    const keys = (agendaIfThen && Array.isArray(agendaIfThen.validators) && agendaIfThen.validators.length)
        ? agendaIfThen.validators.slice(0, 6).map(x => String(x || '').toUpperCase()).filter(Boolean)
        : defaultKeys;

    const syms = keys.map(k => pick(candFor(k))).filter(Boolean);
    if (!syms.length) return { score: null, label: '—', detail: '', keys };
    if (typeof dc.computeCoverage !== 'function') return { score: null, label: '—', detail: '', keys };
    const cov = dc.computeCoverage(dcDeps, data, syms, { staleMs: 6 * 60 * 60 * 1000 });
    if (!cov || !cov.ratios || !cov.counts) return { score: null, label: '—', detail: '', keys };
    const chg = (typeof cov.ratios.change === 'number' && Number.isFinite(cov.ratios.change)) ? cov.ratios.change : null;
    const fr = (typeof cov.ratios.freshness === 'number' && Number.isFinite(cov.ratios.freshness)) ? cov.ratios.freshness : null;
    const score = Math.max(0, Math.min(1, (0.55 * (chg !== null ? chg : 0)) + (0.45 * (fr !== null ? fr : 0))));
    const label = score >= 0.78 ? 'ALTA' : score >= 0.60 ? 'MÉDIA' : 'BAIXA';
    const freshPct = (typeof formatNumber === 'function' && fr !== null)
        ? formatNumber(fr * 100, 0)
        : (fr !== null ? String(Math.round(fr * 100)) : '—');
    const withChg = cov.counts && typeof cov.counts.withChange === 'number' && Number.isFinite(cov.counts.withChange) ? cov.counts.withChange : 0;
    const expected = cov.counts && typeof cov.counts.expected === 'number' && Number.isFinite(cov.counts.expected) ? cov.counts.expected : syms.length;
    const detail = `validadores ${withChg}/${expected} • fresh ${freshPct}%`;
    return { score, label, detail, keys };
}

function opBriefing_computeFallbackRegime({ data, computeFlowScore }) {
    if (!data) return null;
    if (typeof computeFlowScore !== 'function') return null;
    const flow = computeFlowScore(data);
    const label = flow && typeof flow.label === 'string' ? flow.label : 'Neutro';
    const score = flow && typeof flow.score === 'number' && Number.isFinite(flow.score) ? flow.score : 0;
    const operational =
        label === 'Risk-On'
            ? { wdo: 'VENDA', win: 'COMPRA', hint: 'Risk-on tende a WDO↓ / WIN↑ (filtro, não gatilho).' }
            : label === 'Risk-Off'
                ? { wdo: 'COMPRA', win: 'VENDA', hint: 'Risk-off tende a WDO↑ / WIN↓ (filtro, não gatilho).' }
                : { wdo: '—', win: '—', hint: 'Regime indefinido (filtro, não gatilho).' };
    return { label, score, convictionLabel: '—', convictionScore: 0.55, operational, divergences: [], updatedAt: null };
}

function opBriefing_computeNewsTilt({ web }) {
    const items = web && Array.isArray(web.items) ? web.items.slice(0, 8) : [];
    const weight = conf => {
        const c = String(conf || '').toLowerCase();
        if (c.includes('alta')) return 2.0;
        if (c.includes('média') || c.includes('media')) return 1.0;
        if (c.includes('baixa')) return 0.5;
        return 0.75;
    };
    const aScore = a => (a === '↑' ? 1 : a === '↓' ? -1 : 0);
    const sum = { wdo: 0, win: 0, w: 0 };
    for (const it of items) {
        const w = weight(it && it.confidence);
        const impact = it && it.impact ? it.impact : null;
        sum.wdo += w * aScore(impact && impact.wdo ? String(impact.wdo) : '≈');
        sum.win += w * aScore(impact && impact.win ? String(impact.win) : '≈');
        sum.w += w;
    }
    const norm = k => (sum.w > 0 ? sum[k] / sum.w : 0);
    const toBias = v => (v > 0.22 ? 'buy' : v < -0.22 ? 'sell' : 'neutral');
    return {
        wdo: { bias: toBias(norm('wdo')), score: norm('wdo'), w: sum.w },
        win: { bias: toBias(norm('win')), score: norm('win'), w: sum.w },
    };
}

function opBriefing_biasFromLabel(raw) {
    const s = String(raw || '').toUpperCase();
    if (s.includes('COMPRA')) return 'buy';
    if (s.includes('VENDA')) return 'sell';
    return 'neutral';
}

function opBriefing_combineBias(a, b) {
    if (a === 'neutral') return { bias: b, conflict: false };
    if (b === 'neutral') return { bias: a, conflict: false };
    if (a === b) return { bias: a, conflict: false };
    return { bias: 'neutral', conflict: true };
}

function opBriefing_computeMacroBias({ symbol, data, macro, foreignFlow, brFlowSignal, brBreadthSectorSignal, operationalTuning, rcKey, aliasSym, pickBestByMatchers, yieldBp10FromSymbol }) {
    if (!macro) return { bias: 'neutral', score: 0, parts: [] };
    const tuning = operationalTuning || {};
    const neutral = t => String(t || '').toLowerCase().includes('neutro');
    let s = 0;
    let w = 0;
    const parts = [];
    const push = (label, val, wVal) => {
        if (!(typeof val === 'number' && Number.isFinite(val))) return;
        if (!(typeof wVal === 'number' && Number.isFinite(wVal) && wVal > 0)) return;
        s += val * wVal;
        w += wVal;
        if (val !== 0) parts.push({ label: String(label || '—'), val: Number(val) * Number(wVal) });
    };

    if (macro.flow && !neutral(macro.flow.label)) {
        const b = macro.flow.label === 'Risk-On' ? (symbol === 'WDO' ? -1 : +1) : (symbol === 'WDO' ? +1 : -1);
        push(`Flow (${macro.flow.label})`, b, tuning.weight && typeof tuning.weight.flow === 'number' ? tuning.weight.flow : 0);
    }
    if (foreignFlow && foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score)) {
        const t = tuning.threshold && typeof tuning.threshold.foreignFlow === 'number' ? tuning.threshold.foreignFlow : 0.25;
        const dir = foreignFlow.signal.score > t ? +1 : foreignFlow.signal.score < -t ? -1 : 0;
        const b = symbol === 'WDO' ? -dir : +dir;
        const wFlow = tuning.weight && typeof tuning.weight.foreignFlow === 'number' ? tuning.weight.foreignFlow : 0.22;
        push('Fluxo estrangeiro', b, wFlow);
    }
    if (typeof macro.dxyPct === 'number' && Number.isFinite(macro.dxyPct)) {
        const t = tuning.threshold && typeof tuning.threshold.dxy === 'number' ? tuning.threshold.dxy : 0.12;
        const wDxy = tuning.weight && typeof tuning.weight.dxy === 'number' ? tuning.weight.dxy : 0.18;
        const dir = macro.dxyPct > t ? +1 : macro.dxyPct < -t ? -1 : 0;
        const b = symbol === 'WDO' ? dir : -dir;
        push('DXY', b, wDxy);
    }
    if (typeof macro.exportScore === 'number' && Number.isFinite(macro.exportScore)) {
        const t = tuning.threshold && typeof tuning.threshold.export === 'number' ? tuning.threshold.export : 0.25;
        const wExport = tuning.weight && typeof tuning.weight.export === 'number' ? tuning.weight.export : 0.10;
        const dir = macro.exportScore > t ? +1 : macro.exportScore < -t ? -1 : 0;
        const b = symbol === 'WDO' ? -dir : +dir;
        push('Exportadoras/Commodities', b, wExport);
    }
    if (macro.em && typeof macro.em.pct === 'number' && Number.isFinite(macro.em.pct)) {
        const t = tuning.threshold && typeof tuning.threshold.em === 'number' ? tuning.threshold.em : 0.12;
        const wEm = tuning.weight && typeof tuning.weight.em === 'number' ? tuning.weight.em : 0.12;
        const dir = macro.em.pct > t ? +1 : macro.em.pct < -t ? -1 : 0;
        const b = symbol === 'WDO' ? dir : -dir;
        push('Emergentes (EM)', b, wEm);
    }
    if (brFlowSignal && typeof brFlowSignal.score === 'number' && Number.isFinite(brFlowSignal.score)) {
        const t = tuning.threshold && typeof tuning.threshold.brFlow === 'number' && Number.isFinite(tuning.threshold.brFlow) ? tuning.threshold.brFlow : 0.22;
        const dir = brFlowSignal.score > t ? +1 : brFlowSignal.score < -t ? -1 : 0;
        const b = symbol === 'WDO' ? -dir : +dir;
        const wBr = tuning.weight && typeof tuning.weight.brFlow === 'number' && Number.isFinite(tuning.weight.brFlow) ? tuning.weight.brFlow : 0.28;
        push(`Fluxo global→BR (${brFlowSignal.label})`, b, wBr);
    }
    if (brBreadthSectorSignal && brBreadthSectorSignal.ok) {
        const bScore = brBreadthSectorSignal.breadth && typeof brBreadthSectorSignal.breadth.score === 'number' && Number.isFinite(brBreadthSectorSignal.breadth.score) ? brBreadthSectorSignal.breadth.score : null;
        const sScore = brBreadthSectorSignal.sectors && typeof brBreadthSectorSignal.sectors.score === 'number' && Number.isFinite(brBreadthSectorSignal.sectors.score) ? brBreadthSectorSignal.sectors.score : null;
        const rScore = brBreadthSectorSignal.rotation && typeof brBreadthSectorSignal.rotation.score === 'number' && Number.isFinite(brBreadthSectorSignal.rotation.score) ? brBreadthSectorSignal.rotation.score : null;
        const tBreadth = tuning.threshold && typeof tuning.threshold.brBreadth === 'number' && Number.isFinite(tuning.threshold.brBreadth) ? tuning.threshold.brBreadth : 0.22;
        const tSectors = tuning.threshold && typeof tuning.threshold.brSectors === 'number' && Number.isFinite(tuning.threshold.brSectors) ? tuning.threshold.brSectors : 0.18;
        const wBreadth = tuning.weight && typeof tuning.weight.brBreadth === 'number' && Number.isFinite(tuning.weight.brBreadth) ? tuning.weight.brBreadth : 0.30;
        const wSectors = tuning.weight && typeof tuning.weight.brSectors === 'number' && Number.isFinite(tuning.weight.brSectors) ? tuning.weight.brSectors : 0.32;
        const tRot = tuning.threshold && typeof tuning.threshold.brRotation === 'number' && Number.isFinite(tuning.threshold.brRotation) ? tuning.threshold.brRotation : 0.12;
        const wRot = tuning.weight && typeof tuning.weight.brRotation === 'number' && Number.isFinite(tuning.weight.brRotation) ? tuning.weight.brRotation : 0.22;
        const dirB = (typeof bScore === 'number' && Number.isFinite(bScore)) ? (bScore > tBreadth ? +1 : bScore < -tBreadth ? -1 : 0) : 0;
        const dirS = (typeof sScore === 'number' && Number.isFinite(sScore)) ? (sScore > tSectors ? +1 : sScore < -tSectors ? -1 : 0) : 0;
        const dirR = (typeof rScore === 'number' && Number.isFinite(rScore)) ? (rScore > tRot ? +1 : rScore < -tRot ? -1 : 0) : 0;
        if (dirB) push('Breadth BR (15m)', symbol === 'WDO' ? -dirB : +dirB, wBreadth);
        if (dirS) push('Setores-peso WIN (15m)', symbol === 'WDO' ? -dirS : +dirS, wSectors);
        if (dirR) {
            const b = symbol === 'WDO' ? -dirR : +dirR;
            const label = dirR > 0 ? 'Rotação BR (small>large)' : 'Rotação BR (large>small)';
            push(label, b, wRot);
        }
    }
    if (data) {
        const t = tuning.threshold && typeof tuning.threshold.yields === 'number' && Number.isFinite(tuning.threshold.yields)
            ? tuning.threshold.yields
            : 0.12;
        const wY = tuning.weight && typeof tuning.weight.yields === 'number' ? tuning.weight.yields : 0.12;
        const symUs10 = (typeof rcKey === 'function' ? rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i) : null)
            || (typeof aliasSym === 'function' ? aliasSym('US10Y') : null)
            || (typeof pickBestByMatchers === 'function' ? pickBestByMatchers([/(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i]) : null);
        const us10 = typeof yieldBp10FromSymbol === 'function' ? yieldBp10FromSymbol(symUs10) : null;
        if (typeof us10 === 'number' && Number.isFinite(us10)) {
            const dir = us10 > t ? +1 : us10 < -t ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push('US10Y (Δbp)', b, wY);
        }

        const symBr10 = (typeof rcKey === 'function' ? rcKey('BR_10Y', /^BR10YT=RR$/i) : null)
            || (typeof aliasSym === 'function' ? aliasSym('BR10Y') : null)
            || (typeof pickBestByMatchers === 'function' ? pickBestByMatchers([/^BR10YT=RR$/i]) : null);
        const br10 = typeof yieldBp10FromSymbol === 'function' ? yieldBp10FromSymbol(symBr10) : null;
        if (typeof br10 === 'number' && Number.isFinite(br10)) {
            const dir = br10 > t ? +1 : br10 < -t ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push('BR10Y (Δbp)', b, wY * 0.8);
        }
    }
    if (macro.zq && typeof macro.zq.slopePct === 'number' && Number.isFinite(macro.zq.slopePct)) {
        const t = tuning.threshold && typeof tuning.threshold.zqSlope === 'number' && Number.isFinite(tuning.threshold.zqSlope)
            ? tuning.threshold.zqSlope
            : 0.08;
        const dir = macro.zq.slopePct > t ? +1 : macro.zq.slopePct < -t ? -1 : 0;
        const b = symbol === 'WDO' ? dir : -dir;
        const wZq = tuning.weight && typeof tuning.weight.zq === 'number' && Number.isFinite(tuning.weight.zq) ? tuning.weight.zq : 0.22;
        push('Curva ZQ (Fed Funds)', b, wZq);
    }
    if (macro.flowSentinel && typeof macro.flowSentinel.composite === 'number' && Number.isFinite(macro.flowSentinel.composite)) {
        const fs = macro.flowSentinel;
        if (!fs.divergence) {
            const t = tuning.threshold && typeof tuning.threshold.flowSentinel === 'number' && Number.isFinite(tuning.threshold.flowSentinel)
                ? tuning.threshold.flowSentinel
                : 0.25;
            const dirUsd = fs.composite < -t ? +1 : fs.composite > t ? -1 : 0;
            const b = symbol === 'WDO' ? dirUsd : -dirUsd;
            const wFs = tuning.weight && typeof tuning.weight.flowSentinel === 'number' && Number.isFinite(tuning.weight.flowSentinel) ? tuning.weight.flowSentinel : 0.18;
            push('Flow Sentinel', b, wFs);
        }
    }
    const score = w > 0 ? s / w : 0;
    const bias = score > 0.22 ? 'buy' : score < -0.22 ? 'sell' : 'neutral';
    return { bias, score, parts };
}

function opBriefing_computeFinalScore({ symbol, newsTilt, macroWdo, macroWin, finalBias, regimeBias }) {
    const nb = symbol === 'WDO' ? newsTilt.wdo.score : newsTilt.win.score;
    const mb = symbol === 'WDO' ? macroWdo.score : macroWin.score;
    const fb = symbol === 'WDO' ? finalBias.WDO : finalBias.WIN;
    const bDir = fb && fb.bias === 'buy' ? 1 : fb && fb.bias === 'sell' ? -1 : 0;
    const src = fb && fb.source ? String(fb.source) : '';
    const clamp = (x) => Math.max(-1, Math.min(1, x));
    if (bDir !== 0 && (src === 'PREÇO' || src === 'TENDÊNCIA' || src === 'FITA_LOCAL' || src === 'PULSO')) {
        const w = src === 'PREÇO' ? 0.9 : src === 'TENDÊNCIA' ? 0.8 : src === 'FITA_LOCAL' ? 0.82 : 0.75;
        return clamp((w * bDir) + (0.15 * nb) + (0.10 * mb));
    }
    const rb = symbol === 'WDO' ? regimeBias.wdo : regimeBias.win;
    const dir = rb === 'buy' ? 1 : rb === 'sell' ? -1 : 0;
    return clamp((0.5 * dir) + (0.4 * nb) + (0.3 * mb));
}

function opBriefing_gaugeHtml({ label, score, escapeHtml, toneBadgeHtmlFromTone, formatNumber }) {
    const safeLabel = typeof escapeHtml === 'function' ? escapeHtml(label) : String(label || '');
    const deg = Math.round(Math.max(-1, Math.min(1, score)) * 60);
    const tone = score > 0.22 ? 'positive' : score < -0.22 ? 'negative' : 'neutral';
    const arcGrad = 'linear-gradient(90deg, rgba(255,60,80,.85) 0%, rgba(255,210,74,.85) 50%, rgba(0,255,160,.85) 100%)';
    const glow = tone === 'positive' ? '0 0 18px rgba(0,255,160,.35)' : tone === 'negative' ? '0 0 18px rgba(255,60,80,.35)' : '0 0 18px rgba(255,210,74,.28)';
    const scoreTxt = typeof formatNumber === 'function' ? formatNumber(score, 2) : String(score);
    const badge = typeof toneBadgeHtmlFromTone === 'function' ? toneBadgeHtmlFromTone(tone, score, scoreTxt, { maxAbs: 1 }) : scoreTxt;
    const needleClr = tone === 'positive' ? 'rgba(0,255,160,.95)' : tone === 'negative' ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
    return `
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:98px;height:54px;border:1px solid rgba(255,255,255,.18);border-radius:98px 98px 0 0;background:rgba(0,0,0,.22);position:relative;overflow:hidden;box-shadow:${glow};">
                    <div style="position:absolute;left:6px;right:6px;bottom:6px;height:10px;border-radius:999px;background:${arcGrad};opacity:.85;"></div>
                    <div style="position:absolute;left:50%;bottom:6px;width:3px;height:42px;background:${needleClr};transform-origin:bottom center;transform:translateX(-50%) rotate(${deg}deg);box-shadow:0 0 14px rgba(255,255,255,.22);border-radius:3px;"></div>
                    <div style="position:absolute;left:10px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.35);"></div>
                    <div style="position:absolute;left:26px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.25);"></div>
                    <div style="position:absolute;right:26px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.25);"></div>
                    <div style="position:absolute;right:10px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.35);"></div>
                </div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.5px;">${safeLabel} ${badge}</div>
            </div>
        `;
}

function opBriefing_biasTone(b) {
    return b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral';
}

function opBriefing_biasLabel(symbol, b) {
    if (b === 'buy') return `${symbol}: COMPRA`;
    if (b === 'sell') return `${symbol}: VENDA`;
    return `${symbol}: NEUTRO`;
}

function opBriefing_formatAgendaLine({ agendaNext, agendaIfThen, agendaValidation, formatNumber }) {
    const next = agendaNext || null;
    if (!next) return 'Agenda: —';
    const imp = String(next.impact || '').toUpperCase() || '—';
    const cur = String(next.currency || '').toUpperCase() || '—';
    const tt = next.time ? String(next.time) : '—';
    const ev = next.event ? String(next.event) : '—';
    const wdo = next.wdo ? String(next.wdo) : '—';
    const win = next.win ? String(next.win) : '—';
    const key = next.matrixKey ? ` • key ${String(next.matrixKey)}` : '';
    const m = typeof next.minutesTo === 'number' && Number.isFinite(next.minutesTo) ? next.minutesTo : null;
    const when = m === null ? '' : (m < 0 ? ` (há ${String(Math.abs(Math.round(m)))}m)` : ` (em ${String(Math.round(m))}m)`);
    const seEntao = (agendaIfThen && Array.isArray(agendaIfThen.lines) && agendaIfThen.lines.length)
        ? ` • Se–então: ${agendaIfThen.lines.join(' | ')}${agendaIfThen.source ? ` (${agendaIfThen.source})` : ''}`
        : '';
    const conf = agendaValidation && typeof agendaValidation.score === 'number' && Number.isFinite(agendaValidation.score)
        ? ` • Conf ${agendaValidation.label} (${typeof formatNumber === 'function' ? formatNumber(agendaValidation.score * 100, 0) : String(Math.round(agendaValidation.score * 100))}%)`
        : '';
    const val = agendaValidation && Array.isArray(agendaValidation.keys) && agendaValidation.keys.length
        ? ` • Validar ${agendaValidation.keys.join('/')}`
        : '';
    return `Agenda: ${imp} ${cur} ${tt}${when} • WDO ${wdo} / WIN ${win}${key} • ${ev}${seEntao}${conf}${val}`;
}

function opBriefing_formatNewsLine({ web, newsTilt, fmt1 }) {
    if (!web) return 'News tilt: —';
    return `News tilt (-1..+1): WDO ${fmt1(newsTilt.wdo.score)} • WIN ${fmt1(newsTilt.win.score)}`;
}

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

    const microStats = (symbol, tune) => {
        const s = String(symbol || '');
        if (!s) return null;
        const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!series.length) return null;
        const last = series[series.length - 1];
        const lastPrice = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
        const lastTmsRaw = last && last.t ? Date.parse(last.t) : NaN;
        const lastTms = Number.isFinite(lastTmsRaw) ? lastTmsRaw : null;
        if (lastPrice === null || lastTms === null) return null;

        const findAt = (lookbackMs) => {
            const target = lastTms - lookbackMs;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t <= target) return { tMs: t, price };
            }
            return null;
        };
        const pctFrom = (priceThen) => (typeof priceThen === 'number' && Number.isFinite(priceThen) && priceThen > 0 ? ((lastPrice / priceThen) - 1) * 100 : null);

        const p5 = findAt(5 * 60 * 1000);
        const p15 = findAt(15 * 60 * 1000);
        const p60 = findAt(60 * 60 * 1000);
        const ret5 = p5 ? pctFrom(p5.price) : null;
        const ret15 = p15 ? pctFrom(p15.price) : null;
        const ret60 = p60 ? pctFrom(p60.price) : null;

        const range30 = (() => {
            const cut = lastTms - 30 * 60 * 1000;
            let hi = -Infinity;
            let lo = +Infinity;
            let n = 0;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const tRaw = p && p.t ? Date.parse(p.t) : NaN;
                const t = Number.isFinite(tRaw) ? tRaw : null;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (t === null || price === null) continue;
                if (t < cut) break;
                n += 1;
                if (price > hi) hi = price;
                if (price < lo) lo = price;
            }
            if (n < 4 || !Number.isFinite(hi) || !Number.isFinite(lo) || lo <= 0) return null;
            const pct = ((hi / lo) - 1) * 100;
            const pts = hi - lo;
            return { pct, pts, n, hi, lo };
        })();

        const scalp = (() => {
            const th5 = tune && typeof tune.th5 === 'number' && Number.isFinite(tune.th5) ? tune.th5 : 0.05;
            const th15 = tune && typeof tune.th15 === 'number' && Number.isFinite(tune.th15) ? tune.th15 : 0.10;
            const s5 = typeof ret5 === 'number' && Number.isFinite(ret5) ? ret5 : null;
            const s15 = typeof ret15 === 'number' && Number.isFinite(ret15) ? ret15 : null;
            if (s5 === null || s15 === null) return { signal: 'neutral', label: 'n/d' };
            const alignedUp = s5 >= th5 && s15 >= th15;
            const alignedDn = s5 <= -th5 && s15 <= -th15;
            if (alignedUp) return { signal: 'buy', label: '5m×15m alinhado (↑)' };
            if (alignedDn) return { signal: 'sell', label: '5m×15m alinhado (↓)' };
            const conflict = (s5 > 0 && s15 < 0) || (s5 < 0 && s15 > 0);
            if (conflict && Math.abs(s5) >= th5) return { signal: 'neutral', label: 'conflito 5m×15m' };
            return { signal: 'neutral', label: 'range/ruído' };
        })();

        const risk = (() => {
            const rp = range30 && typeof range30.pct === 'number' && Number.isFinite(range30.pct) ? range30.pct : null;
            const stopPct = rp !== null ? Math.max(0.08, rp * 0.25) : null;
            const alvoPct = rp !== null ? Math.max(0.12, rp * 0.5) : null;
            const stopPts = stopPct !== null ? (lastPrice * (stopPct / 100)) : null;
            const alvoPts = alvoPct !== null ? (lastPrice * (alvoPct / 100)) : null;
            return { stopPct, alvoPct, stopPts, alvoPts };
        })();

        return { lastPrice, ret5, ret15, ret60, range30, scalp, risk };
    };

    const keyLevelsFor = (symKey) => {
        if (!options || !options.items) return null;
        const it = options.items[symKey];
        const key = it && it.keyLevels ? it.keyLevels : null;
        if (!key) return null;
        const gf = typeof key.gammaFlip === 'number' && Number.isFinite(key.gammaFlip) ? key.gammaFlip : null;
        const rangeLow = typeof key.rangeLow === 'number' && Number.isFinite(key.rangeLow) ? key.rangeLow : null;
        const rangeHigh = typeof key.rangeHigh === 'number' && Number.isFinite(key.rangeHigh) ? key.rangeHigh : null;
        return { gf, rangeLow, rangeHigh };
    };

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
        const usdPct = usdSym ? getChangePct(data, usdSym) : null;
        const ibovPct = ibovSym ? getChangePct(data, ibovSym) : null;
        const selfPct = getChangePct(data, sym);
        const sign = (v, th = 0.06) => (typeof v === 'number' && Number.isFinite(v) ? (v > th ? +1 : v < -th ? -1 : 0) : 0);
        const parity = (() => {
            const sSelf = sign(selfPct);
            if (side === 'wdo') {
                const sUsd = sign(usdPct);
                if (!sSelf || !sUsd) return { ok: null, label: 'Paridade: —' };
                const ok = sSelf === sUsd;
                return { ok, label: `Paridade USD/BRL: ${ok ? 'OK' : 'DIVERGE'}` };
            }
            const sIbov = sign(ibovPct);
            if (!sSelf || !sIbov) return { ok: null, label: 'Paridade: —' };
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
        const parityBlock = parity.ok === false && Math.abs(sign(selfPct)) > 0;

        const scalpBias = (hardBlock || flowBlock || brFlowBlock || parityBlock) ? 'neutral' : scalpBiasRaw;
        const tone = scalpBias === 'buy' ? 'positive' : scalpBias === 'sell' ? 'negative' : 'neutral';
        const txt = scalpBias === 'buy' ? 'COMPRA' : scalpBias === 'sell' ? 'VENDA' : 'NEUTRO';
        const ctxTxt = ctxBias === 'buy' ? 'Compra' : ctxBias === 'sell' ? 'Venda' : 'Neutro';
        const flowTxt = typeof flowScore === 'number' ? `Fluxo ${formatNumber(flowScore, 2)} (${flowBias === 'buy' ? 'Compra' : flowBias === 'sell' ? 'Venda' : 'Neutro'})` : 'Fluxo: —';
        const brTxt = typeof brScore === 'number' ? `Fluxo→BR ${brFlowSignal && brFlowSignal.label ? brFlowSignal.label : ''} ${formatNumber(brScore, 2)} (${brBias === 'buy' ? 'Compra' : brBias === 'sell' ? 'Venda' : 'Neutro'})` : 'Fluxo→BR: —';
        const ctxTone = conflictsWith(scalpBiasRaw, ctxBias) ? 'negative' : (ctxBias !== 'neutral' ? 'positive' : 'neutral');
        const blockReason = hardBlock ? 'Bloqueado por risco/paridade (contexto forte)' : flowBlock ? 'Bloqueado por fluxo estrangeiro (forte)' : brFlowBlock ? 'Bloqueado por fluxo global→BR (forte)' : parityBlock ? 'Bloqueado por paridade' : '';

        const winStats = (lookbackMs) => {
            const s = String(sym || '');
            const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastMs = last && last.t ? Date.parse(last.t) : NaN;
            if (!Number.isFinite(lastMs)) return null;
            const cut = lastMs - lookbackMs;
            let hi = -Infinity;
            let lo = +Infinity;
            let hiPrev = -Infinity;
            let loPrev = +Infinity;
            let n = 0;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const ms = p && p.t ? Date.parse(p.t) : NaN;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (!Number.isFinite(ms) || price === null) continue;
                if (ms < cut) break;
                n += 1;
                if (price > hi) hi = price;
                if (price < lo) lo = price;
                if (i < series.length - 1) {
                    if (price > hiPrev) hiPrev = price;
                    if (price < loPrev) loPrev = price;
                }
            }
            if (n < 4 || !Number.isFinite(hi) || !Number.isFinite(lo)) return null;
            const rangePts = hi - lo;
            const rangePct = lo > 0 ? ((hi / lo) - 1) * 100 : null;
            return {
                hi,
                lo,
                hiPrev: Number.isFinite(hiPrev) ? hiPrev : hi,
                loPrev: Number.isFinite(loPrev) ? loPrev : lo,
                rangePts: Number.isFinite(rangePts) ? rangePts : null,
                rangePct: typeof rangePct === 'number' && Number.isFinite(rangePct) ? rangePct : null,
                n,
            };
        };
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
        const pbFrac = 0.25;
        const pbLevel = (() => {
            if (priceNow === null || range30Pts === null) return null;
            const d = range30Pts * pbFrac;
            if (microGate === 'buy') return priceNow - d;
            if (microGate === 'sell') return priceNow + d;
            return null;
        })();
        const reArm = (() => {
            if (priceNow === null || range30Pts === null) return null;
            const b = range30Pts * 0.10;
            if (microGate === 'buy') return priceNow + b;
            if (microGate === 'sell') return priceNow - b;
            return null;
        })();

        const windowStats = (lookbackMs) => {
            const s = String(sym || '');
            const series = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
            if (!series.length) return null;
            const last = series[series.length - 1];
            const lastMs = last && last.t ? Date.parse(last.t) : NaN;
            if (!Number.isFinite(lastMs)) return null;
            const cut = lastMs - lookbackMs;
            let hi = -Infinity;
            let lo = +Infinity;
            let n = 0;
            let lastPrice = null;
            let prevPrice = null;
            for (let i = series.length - 1; i >= 0; i -= 1) {
                const p = series[i];
                const ms = p && p.t ? Date.parse(p.t) : NaN;
                const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                if (!Number.isFinite(ms) || price === null) continue;
                if (lastPrice === null) lastPrice = price;
                else if (prevPrice === null) prevPrice = price;
                if (ms < cut) break;
                n += 1;
                if (price > hi) hi = price;
                if (price < lo) lo = price;
            }
            if (n < 3 || !Number.isFinite(hi) || !Number.isFinite(lo)) return null;
            return { hi, lo, n, lastPrice, prevPrice };
        };

        const setups = (() => {
            const fmtLvl = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
            const status = (mode, note = '') => ({ mode, note });
            const w10 = windowStats(10 * 60 * 1000);
            const w5 = windowStats(5 * 60 * 1000);
            const h15 = s15 && typeof s15.hiPrev === 'number' && Number.isFinite(s15.hiPrev) ? s15.hiPrev : null;
            const l15 = s15 && typeof s15.loPrev === 'number' && Number.isFinite(s15.loPrev) ? s15.loPrev : null;
            const rPts = range30Pts;
            const cur = priceNow;

            const distPB = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.25 : (cur ? cur * 0.0018 : null);
            const distResume = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.10 : (cur ? cur * 0.0008 : null);

            const pullback = (() => {
                if (!w10 || !distPB || !distResume || cur === null) return status('N/D');
                if (microGate !== 'buy' && microGate !== 'sell') return status('N/D');
                const anchor = microGate === 'buy' ? h15 : l15;
                if (typeof anchor !== 'number' || !Number.isFinite(anchor)) return status('N/D');
                const levelPB = microGate === 'buy' ? (anchor - distPB) : (anchor + distPB);
                const levelResume = microGate === 'buy' ? (anchor - distResume) : (anchor + distResume);
                const touched = microGate === 'buy' ? (w10.lo <= levelPB) : (w10.hi >= levelPB);
                const confirm = microGate === 'buy' ? (cur >= levelResume) : (cur <= levelResume);
                if (touched && confirm) return status('ACIONADO', `Retomada confirmada acima/abaixo de ${fmtLvl(levelResume)}`);
                if (touched) return status('ARMADO', `Aguardando retomada em ${fmtLvl(levelResume)}`);
                const near = microGate === 'buy' ? (cur <= levelResume && cur >= levelPB) : (cur >= levelResume && cur <= levelPB);
                if (near) return status('ARMADO', `Na zona (PB ${fmtLvl(levelPB)} → retomar ${fmtLvl(levelResume)})`);
                return status('ESPERE', `PB ${fmtLvl(levelPB)} → retomar ${fmtLvl(levelResume)}`);
            })();

            const breakout = (() => {
                if (!w5 || cur === null) return status('N/D');
                if (microGate === 'buy' && typeof h15 === 'number' && Number.isFinite(h15)) {
                    const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
                    const armed = cur >= (h15 - pad) && cur <= (h15 + pad);
                    const fired = cur > (h15 + pad) && typeof w5.prevPrice === 'number' && w5.prevPrice <= (h15 + pad);
                    if (fired) return status('ACIONADO', `Rompimento confirmado > ${fmtLvl(h15)}`);
                    if (armed) return status('ARMADO', `Próximo do H15 ${fmtLvl(h15)}`);
                    return status('ESPERE', `H15 ${fmtLvl(h15)}`);
                }
                if (microGate === 'sell' && typeof l15 === 'number' && Number.isFinite(l15)) {
                    const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
                    const armed = cur <= (l15 + pad) && cur >= (l15 - pad);
                    const fired = cur < (l15 - pad) && typeof w5.prevPrice === 'number' && w5.prevPrice >= (l15 - pad);
                    if (fired) return status('ACIONADO', `Rompimento confirmado < ${fmtLvl(l15)}`);
                    if (armed) return status('ARMADO', `Próximo do L15 ${fmtLvl(l15)}`);
                    return status('ESPERE', `L15 ${fmtLvl(l15)}`);
                }
                return status('N/D');
            })();

            const failure = (() => {
                if (!w10 || cur === null) return status('N/D');
                if (typeof h15 === 'number' && Number.isFinite(h15)) {
                    const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
                    const triedUp = w10.hi >= (h15 + pad);
                    const failed = triedUp && cur < h15 && typeof w10.prevPrice === 'number' && w10.prevPrice > h15;
                    if (failed) return status('ACIONADO', `Falha no topo (volta abaixo de H15 ${fmtLvl(h15)})`);
                    if (triedUp) return status('ARMADO', `Tentou romper H15 ${fmtLvl(h15)} (vigiar falha)`);
                }
                if (typeof l15 === 'number' && Number.isFinite(l15)) {
                    const pad = (typeof rPts === 'number' && Number.isFinite(rPts) && rPts > 0) ? rPts * 0.05 : cur * 0.0006;
                    const triedDn = w10.lo <= (l15 - pad);
                    const failed = triedDn && cur > l15 && typeof w10.prevPrice === 'number' && w10.prevPrice < l15;
                    if (failed) return status('ACIONADO', `Falha no fundo (volta acima de L15 ${fmtLvl(l15)})`);
                    if (triedDn) return status('ARMADO', `Tentou romper L15 ${fmtLvl(l15)} (vigiar falha)`);
                }
                return status('ESPERE');
            })();

            return { pullback, breakout, failure };
        })();

        const setupBadges = (() => {
            const mkB = (name, st) => {
                const mode = st && st.mode ? String(st.mode) : 'N/D';
                const tone = mode === 'ACIONADO' ? 'positive' : mode === 'ARMADO' ? 'neutral' : mode === 'ESPERE' ? 'neutral' : 'neutral';
                return badge(tone, `${name}: ${mode}`);
            };
            const notes = [setups.pullback.note, setups.breakout.note, setups.failure.note].filter(Boolean);
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
        const setupLines = (() => {
            const lines = [];
            const fmtLvl = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
            const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
            const h15 = s15 && typeof s15.hiPrev === 'number' && Number.isFinite(s15.hiPrev) ? s15.hiPrev : null;
            const l15 = s15 && typeof s15.loPrev === 'number' && Number.isFinite(s15.loPrev) ? s15.loPrev : null;
            const pb = pbLevel;
            const ra = reArm;

            if (microGate === 'buy') {
                if (pb !== null && priceNow !== null) {
                    const txt = priceNow > pb
                        ? `Setup (preferido): pullback até ≤ ${fmtLvl(pb)} e retomada (5m volta ↑) • stop curto`
                        : `Setup (preferido): já no pullback • entrar na retomada acima de ${fmtLvl(ra)} (ou candle 5m virar)`;
                    lines.push(txt);
                }
                if (h15 !== null) lines.push(`Alternativo: rompimento com confirmação acima de ${fmtLvl(h15)} (H15)`);
                if (h15 !== null) lines.push(`Reversão: falha no topo • vender se perder ${fmtLvl(h15)} após tentativa`);
            } else if (microGate === 'sell') {
                if (pb !== null && priceNow !== null) {
                    const txt = priceNow < pb
                        ? `Setup (preferido): repique até ≥ ${fmtLvl(pb)} e rejeição (5m volta ↓) • stop curto`
                        : `Setup (preferido): já no repique • entrar na rejeição abaixo de ${fmtLvl(ra)} (ou candle 5m virar)`;
                    lines.push(txt);
                }
                if (l15 !== null) lines.push(`Alternativo: rompimento com confirmação abaixo de ${fmtLvl(l15)} (L15)`);
                if (l15 !== null) lines.push(`Reversão: falha no fundo • comprar se recuperar ${fmtLvl(l15)} após tentativa`);
            } else {
                if (h15 !== null && l15 !== null) lines.push(`Range: trabalhar ${fmtLvl(l15)}–${fmtLvl(h15)} com stops curtos`);
                if (parity.ok === false) lines.push('Evitar scalp direcional: paridade divergente');
            }

            const meta = [
                s15 ? `H15 ${fmtLvl(s15.hi)} • L15 ${fmtLvl(s15.lo)}` : null,
                s30 ? `Range30 ${fmtP(range30Pct)} (${fmtLvl(range30Pts)} pts)` : null,
            ].filter(Boolean);
            if (meta.length) lines.push(`Níveis: ${meta.join(' • ')}`);
            return lines;
        })();

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

function opBriefing_computeWinProjectionModuleHtml({
    pulseNow,
    data,
    options,
    findAliasSymbolBest,
    findAssetSymbol,
    getChangePct,
    formatNumber,
    formatPercent,
    formatDateTime,
    escapeHtml,
    badge,
    pillHtml,
}) {
    if (!data) return '';

    const symWin = pulseNow && pulseNow.sym && pulseNow.sym.win ? String(pulseNow.sym.win) : '';
    const symIron = pulseNow && pulseNow.sym && pulseNow.sym.iron ? String(pulseNow.sym.iron) : (findAliasSymbolBest(data, 'IRON') || findAssetSymbol(data, /^DCE_I0$/i) || '');
    const symCopper = pulseNow && pulseNow.sym && pulseNow.sym.copper ? String(pulseNow.sym.copper) : (findAliasSymbolBest(data, 'COPPER') || '');
    const symOil = pulseNow && pulseNow.sym && pulseNow.sym.brent ? String(pulseNow.sym.brent) : (findAliasSymbolBest(data, 'BRENT') || '');

    const lastPoint = (symbol) => {
        const s = String(symbol || '');
        if (!s) return null;
        const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        for (let i = pts.length - 1; i >= 0; i -= 1) {
            const p = pts[i];
            const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            if (price === null) continue;
            const t = p && p.t ? String(p.t) : null;
            return { price, t };
        }
        return null;
    };
    const lastPrice = s => {
        const p = lastPoint(s);
        return p && typeof p.price === 'number' ? p.price : null;
    };
    const lastTime = s => {
        const p = lastPoint(s);
        return p && p.t ? p.t : null;
    };

    const pct = s => {
        const v = s ? getChangePct(data, s) : null;
        return typeof v === 'number' && Number.isFinite(v) ? v : null;
    };
    const fmtP = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
    const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');

    const readState = () => {
        try {
            const raw = localStorage.getItem('mercado_win_proj_v1');
            const obj = raw ? JSON.parse(raw) : null;
            return obj && typeof obj === 'object' ? obj : {};
        } catch {
            return {};
        }
    };
    const st = (() => {
        const cur = readState();
        const today = (() => {
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dd}`;
        })();
        const day = typeof cur.day === 'string' ? String(cur.day) : '';
        if (day !== today) {
            const next = { ...cur, day: today, overrides: {} };
            delete next.refClose;
            delete next.refAdjust;
            try { localStorage.setItem('mercado_win_proj_v1', JSON.stringify(next)); } catch { }
            return next;
        }
        return cur;
    })();

    const prevClose = (() => {
        const s = String(symWin || '');
        if (!s) return null;
        const pts = data && data.series && Array.isArray(data.series[s]) ? data.series[s] : [];
        if (!pts.length) return null;
        const last = lastPoint(s);
        if (!last || !last.t || typeof last.price !== 'number') return null;
        const lastYmd = (() => {
            const ms = Date.parse(last.t);
            if (!Number.isFinite(ms)) return '';
            return new Date(ms).toISOString().slice(0, 10);
        })();
        if (!lastYmd) return null;
        for (let i = pts.length - 1; i >= 0; i -= 1) {
            const p = pts[i];
            const t = p && p.t ? String(p.t) : '';
            const ms = Date.parse(t);
            if (!Number.isFinite(ms)) continue;
            const ymd = new Date(ms).toISOString().slice(0, 10);
            const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            if (ymd !== lastYmd && price !== null) return price;
        }
        return null;
    })();

    const defaultClose = (() => {
        if (typeof prevClose === 'number' && Number.isFinite(prevClose)) return prevClose;
        const p = lastPrice(symWin);
        return typeof p === 'number' && Number.isFinite(p) ? p : (options && options.items && options.items.WIN && typeof options.items.WIN.spot === 'number' ? options.items.WIN.spot : null);
    })();
    const defaultAdjust = (options && options.items && options.items.WIN && typeof options.items.WIN.spot === 'number' && Number.isFinite(options.items.WIN.spot)) ? options.items.WIN.spot : lastPrice(symWin);
    const refClose = typeof st.refClose === 'number' && Number.isFinite(st.refClose) ? st.refClose : defaultClose;
    const refAdjust = typeof st.refAdjust === 'number' && Number.isFinite(st.refAdjust) ? st.refAdjust : defaultAdjust;

    const betaIron = typeof st.betaIron === 'number' && Number.isFinite(st.betaIron) ? st.betaIron : 1.0;
    const betaCopper = typeof st.betaCopper === 'number' && Number.isFinite(st.betaCopper) ? st.betaCopper : 1.0;
    const betaOil = typeof st.betaOil === 'number' && Number.isFinite(st.betaOil) ? st.betaOil : 1.0;

    const ovr = st.overrides && typeof st.overrides === 'object' ? st.overrides : {};
    const ironManual = (typeof ovr.ironPct === 'number' && Number.isFinite(ovr.ironPct));
    const copperManual = (typeof ovr.copperPct === 'number' && Number.isFinite(ovr.copperPct));
    const oilManual = (typeof ovr.oilPct === 'number' && Number.isFinite(ovr.oilPct));
    const ironPct = ironManual ? ovr.ironPct : pct(symIron);
    const copperPct = copperManual ? ovr.copperPct : pct(symCopper);
    const oilPct = oilManual ? ovr.oilPct : pct(symOil);

    const proj = (base, driverPct, beta) => {
        if (!(typeof base === 'number' && Number.isFinite(base))) return { lvl: null, dPts: null };
        if (!(typeof driverPct === 'number' && Number.isFinite(driverPct))) return { lvl: null, dPts: null };
        const movePct = (driverPct * beta) / 100;
        const lvl = base * (1 + movePct);
        const dPts = lvl - base;
        return { lvl, dPts };
    };

    const row = (label, driverSym, driverPct, beta, k, isManual) => {
        const t = lastTime(driverSym);
        const fromClose = proj(refClose, driverPct, beta);
        const fromAdj = proj(refAdjust, driverPct, beta);
        const betaTxt = (typeof beta === 'number' && Number.isFinite(beta)) ? formatNumber(beta, 2) : '—';
        const dpTxt = `${fmtP(driverPct)}${isManual ? ' (manual)' : ''}`;
        return `
                <tr>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;opacity:.92;">${escapeHtml(label)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml(driverSym || '—')}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(dpTxt)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(betaTxt)}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(fmt0(fromClose.lvl))} <span style="opacity:.7;">(${escapeHtml(fmt0(fromClose.dPts))})</span></td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(fmt0(fromAdj.lvl))} <span style="opacity:.7;">(${escapeHtml(fmt0(fromAdj.dPts))})</span></td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.78;white-space:nowrap;">${t ? escapeHtml(formatDateTime(t)) : '—'}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;">
                        <button type="button" data-winproj-copy="${escapeHtml(k)}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 8px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;">Copiar</button>
                    </td>
                </tr>
            `;
    };

    const header = (() => {
        const tWin = lastTime(symWin);
        const winLast = lastPrice(symWin);
        const winBadge = (typeof winLast === 'number' && Number.isFinite(winLast)) ? `${fmt0(winLast)} • ${tWin ? formatDateTime(tWin) : '—'}` : '—';
        return winBadge;
    })();

    return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">📐 Projeções WIN (pré) — Ferro • Cobre • Petróleo</div>
                    <div style="opacity:.78;font-size:12px;">Projeção: <span style="font-family:'Share Tech Mono',monospace;font-weight:900;">WIN_ref × (1 + β × Δ%_driver)</span> • Base por Fechamento e por Ajuste.</div>
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge('neutral', `WIN agora: ${header}`)}
                    ${badge('neutral', `Ref Fechamento: ${fmt0(refClose)}`)}
                    ${badge('neutral', `Ref Ajuste: ${fmt0(refAdjust)}`)}
                    ${pillHtml('status', typeof prevClose === 'number' ? 'info' : 'warn', `Fech (ontem): ${fmt0(prevClose)}`, typeof prevClose === 'number' ? 0.55 : 0.85)}
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Ref Fechamento (WIN)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ref-close" type="number" step="1" value="${typeof refClose === 'number' && Number.isFinite(refClose) ? String(Math.round(refClose)) : ''}" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-use-prevclose" data-value="${typeof prevClose === 'number' && Number.isFinite(prevClose) ? String(prevClose) : ''}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Usar</button>
                        </div>
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Ref Ajuste (WIN)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ref-adjust" type="number" step="1" value="${typeof refAdjust === 'number' && Number.isFinite(refAdjust) ? String(Math.round(refAdjust)) : ''}" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-use-now" data-value="${typeof defaultAdjust === 'number' && Number.isFinite(defaultAdjust) ? String(defaultAdjust) : ''}" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Agora</button>
                        </div>
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Ferro→WIN</div>
                        <input id="winproj-beta-iron" type="number" step="0.05" value="${escapeHtml(String(betaIron))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Cobre→WIN</div>
                        <input id="winproj-beta-copper" type="number" step="0.05" value="${escapeHtml(String(betaCopper))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">β Petróleo→WIN</div>
                        <input id="winproj-beta-oil" type="number" step="0.05" value="${escapeHtml(String(betaOil))}" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Ferro override (manual)</div>
                        <input id="winproj-ovr-iron" type="number" step="0.01" value="${ironManual ? escapeHtml(String(ovr.ironPct)) : ''}" placeholder="ex.: 1.00" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Cobre override (manual)</div>
                        <input id="winproj-ovr-copper" type="number" step="0.01" value="${copperManual ? escapeHtml(String(ovr.copperPct)) : ''}" placeholder="ex.: -0.40" style="width:100%;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                    </div>
                    <div>
                        <div style="opacity:.85;font-size:12px;margin-bottom:4px;">Δ% Petróleo override (manual)</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input id="winproj-ovr-oil" type="number" step="0.01" value="${oilManual ? escapeHtml(String(ovr.oilPct)) : ''}" placeholder="ex.: 0.70" style="flex:1;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                            <button type="button" id="winproj-clear-overrides" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;white-space:nowrap;">Limpar</button>
                        </div>
                    </div>
                </div>
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;overflow:hidden;">
                    <div style="overflow:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Driver</th>
                                    <th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Símbolo</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% driver</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">β</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Proj (Fech.)</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Proj (Ajuste)</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Carimbo</th>
                                    <th style="text-align:right;padding:8px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${row('Ferro (Sina/Dalian)', symIron, ironPct, betaIron, 'iron', ironManual)}
                                ${row('Cobre', symCopper, copperPct, betaCopper, 'copper', copperManual)}
                                ${row('Petróleo', symOil, oilPct, betaOil, 'oil', oilManual)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style="margin-top:10px;opacity:.78;font-size:12px;line-height:1.35;">
                    Automático quando os drivers estiverem atualizando no <span style="font-family:'Share Tech Mono',monospace;">market_quotes.json</span>. Quando Sina/driver falhar ou você quiser fixar o valor das 08:55, use o override manual (salva localmente por dia).
                </div>
            </div>
        `;
}

function opBriefing_computeAuditLineHtml({
    data,
    regime,
    rawOptions,
    rawWeb,
    rawForeign,
    rawFocus,
    macro,
    badge,
}) {
    const now = Date.now();
    const staleMs = 6 * 60 * 60 * 1000;
    const ageText = (t) => {
        const ms = t ? Date.parse(String(t)) : NaN;
        if (!Number.isFinite(ms)) return '—';
        const age = now - ms;
        if (!Number.isFinite(age) || age < 0) return '—';
        const m = Math.round(age / 60000);
        if (m < 60) return `${m}m`;
        const h = Math.round(m / 60);
        return `${h}h`;
    };
    const toneFromAge = (t) => {
        const ms = t ? Date.parse(String(t)) : NaN;
        if (!Number.isFinite(ms)) return 'neutral';
        const age = now - ms;
        if (!Number.isFinite(age) || age < 0) return 'neutral';
        if (age <= staleMs) return 'positive';
        return 'neutral';
    };
    const pickTs = (x) => {
        if (!x) return null;
        if (x.generatedAt) return x.generatedAt;
        if (x.source && x.source.updatedAt) return x.source.updatedAt;
        if (x.source && x.source.publishedAt) return x.source.publishedAt;
        return null;
    };
    const quotesTs = data && data.generatedAt ? data.generatedAt : null;
    const optTs = pickTs(rawOptions);
    const webTs = pickTs(rawWeb);
    const flowTs = pickTs(rawForeign);
    const focusTs = pickTs(rawFocus);
    const zqTs = macro && macro.zq && macro.zq.generatedAt ? macro.zq.generatedAt : null;

    const bits = [
        badge(toneFromAge(quotesTs), `Quotes ${ageText(quotesTs)}`),
        badge(regime ? 'neutral' : 'negative', `Regime ${regime ? 'OK' : '—'}`),
        badge(rawOptions && rawOptions.ok === true ? toneFromAge(optTs) : 'neutral', `Opções ${rawOptions && rawOptions.ok === true ? ageText(optTs) : '—'}`),
        badge(rawWeb && rawWeb.ok === true ? toneFromAge(webTs) : 'neutral', `News ${rawWeb && rawWeb.ok === true ? ageText(webTs) : '—'}`),
        badge(rawForeign && rawForeign.ok === true ? toneFromAge(flowTs) : 'neutral', `Fluxo ${rawForeign && rawForeign.ok === true ? ageText(flowTs) : '—'}`),
        badge(rawFocus && rawFocus.ok === true ? toneFromAge(focusTs) : 'neutral', `Focus ${rawFocus && rawFocus.ok === true ? ageText(focusTs) : '—'}`),
        badge(zqTs ? toneFromAge(zqTs) : 'neutral', `ZQ ${zqTs ? ageText(zqTs) : '—'}`),
    ];
    return `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;opacity:.95;">${bits.join('')}</div>`;
}

function opBriefing_computeBrFlowModuleHtml({
    brFlowSignal,
    badge,
    formatNumber,
    escapeHtml,
}) {
    if (!brFlowSignal || typeof brFlowSignal.score !== 'number' || !Number.isFinite(brFlowSignal.score)) return '';
    const s = brFlowSignal.score;
    const c = (typeof brFlowSignal.confidence === 'number' && Number.isFinite(brFlowSignal.confidence)) ? brFlowSignal.confidence : null;
    const tone = (s >= 0.38 && (c === null || c >= 0.62)) ? 'positive' : (s <= -0.38 && (c === null || c >= 0.62)) ? 'negative' : 'neutral';
    const bias = s > 0.22 ? 'Entrada em BR/EM' : s < -0.22 ? 'Saída de BR/EM' : 'Misto';
    const confTxt = c === null ? '—' : `${formatNumber(c * 100, 0)}%`;
    const drivers = Array.isArray(brFlowSignal.drivers) ? brFlowSignal.drivers.slice(0, 6) : [];
    const driversTxt = drivers.length ? drivers.join(' • ') : '—';
    const guide = s > 0.22
        ? 'Tese: fluxo global favorecendo emergentes/Brasil → tende a WIN↑ e WDO↓ (buscar alvos curtos a favor, evitar vender WIN “no dedo”).'
        : s < -0.22
            ? 'Tese: fluxo global saindo de emergentes/Brasil → tende a WIN↓ e WDO↑ (buscar alvos curtos a favor, evitar comprar WIN “no dedo”).'
            : 'Tese: misto → priorize scalp por níveis (range) e confirme em 5m×15m.';

    return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">📌 Fluxo Global → Brasil (sinal de alta prob.)</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `${bias}`)}
                        ${badge('neutral', `Score ${formatNumber(s, 2)}`)}
                        ${badge('neutral', `Conf ${confTxt}`)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">Drivers: ${escapeHtml(driversTxt)}${brFlowSignal.detail ? ` • ${escapeHtml(brFlowSignal.detail)}` : ''}</div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">${escapeHtml(guide)}</div>
            </div>
        `;
}

function opBriefing_computeFocusSummaryHtml({
    rawFocus,
    data,
    diSignal,
    findAliasSymbolBest,
    findAliasSymbol,
    findAssetSymbol,
    getMostRecentPointWithPrice,
    getLastPoint,
    badge,
    escapeHtml,
    formatNumber,
    formatDateTimeLoose,
    toneBadgeHtmlFromTone,
}) {
    const raw = rawFocus || null;
    if (!raw) return '';
    const ok = raw && raw.ok === true;
    const msg = raw && raw.message ? String(raw.message) : 'Indisponível.';
    const pageUrl = raw && raw.source && raw.source.pageUrl ? String(raw.source.pageUrl) : 'https://www.bcb.gov.br/publicacoes/focus';
    const pdfUrl = raw && raw.source && raw.source.pdfUrl ? String(raw.source.pdfUrl) : '';
    const cutoffDate = raw && raw.source && raw.source.cutoffDate ? String(raw.source.cutoffDate) : '';
    const publishedAt = raw && raw.source && raw.source.publishedAt ? String(raw.source.publishedAt) : '';
    const datasetUrl = raw && raw.source && raw.source.datasetUrl ? String(raw.source.datasetUrl) : '';
    const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');
    const fmt4 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 4) : '—');
    const dTone = (k, d) => {
        if (!(typeof d === 'number' && Number.isFinite(d)) || d === 0) return 'neutral';
        if (k === 'pib') return d > 0 ? 'positive' : 'negative';
        return d > 0 ? 'negative' : 'positive';
    };
    const dTxt = d => (typeof d === 'number' && Number.isFinite(d) && d !== 0 ? `${d > 0 ? '+' : ''}${fmt2(d)}` : '0.00');
    const line = (label, k, p, fmtVal) => {
        const med = p && typeof p.mediana === 'number' ? p.mediana : null;
        const d = p && typeof p.deltaMediana === 'number' ? p.deltaMediana : null;
        const t = dTone(k, d);
        const deltaBadge = toneBadgeHtmlFromTone(t, d || 0, `Δ ${dTxt(d)}`, { maxAbs: 2 });
        return `
                    <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">${escapeHtml(label)}</div>
                        <div style="display:flex;gap:8px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                            <span style="opacity:.95;">${escapeHtml(fmtVal(med))}</span>
                            ${deltaBadge}
                        </div>
                    </div>
                `;
    };
    if (!ok) {
        return `
                    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                            <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🧩 Boletim Focus (BCB)</div>
                            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                                ${publishedAt ? badge('neutral', `Publicado: ${formatDateTimeLoose(publishedAt)}`) : ''}
                                ${cutoffDate ? badge('neutral', `Corte: ${cutoffDate}`) : ''}
                                <a href="${escapeHtml(pageUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">página</a>
                                ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">pdf</a>` : ''}
                            </div>
                        </div>
                        <div style="margin-top:8px;opacity:.88;line-height:1.35;">${escapeHtml(msg)}</div>
                    </div>
                `;
    }
    const refYear = raw && raw.derived && raw.derived.referenceYear ? String(raw.derived.referenceYear) : '';
    const yearKeys = (() => {
        const start = /^\d{4}$/.test(refYear) ? Number(refYear) : NaN;
        if (Number.isFinite(start)) return [start, start + 1, start + 2, start + 3].map(y => String(y));
        const ys = raw && raw.years && typeof raw.years === 'object' ? Object.keys(raw.years) : [];
        return ys.filter(y => /^\d{4}$/.test(y)).sort().slice(0, 4);
    })();
    const bias = raw && raw.derived && raw.derived.bias ? String(raw.derived.bias) : 'mixed';
    const score = raw && raw.derived && typeof raw.derived.score === 'number' && Number.isFinite(raw.derived.score) ? raw.derived.score : 0;
    const wdo = raw && raw.derived && raw.derived.wdo ? String(raw.derived.wdo) : '≈';
    const win = raw && raw.derived && raw.derived.win ? String(raw.derived.win) : '≈';
    const biasLabel = bias === 'hawkish' ? 'mais duro' : bias === 'dovish' ? 'mais leve' : 'misto';
    const biasTone = bias === 'hawkish' ? 'negative' : bias === 'dovish' ? 'positive' : 'neutral';
    const interpretation =
        bias === 'hawkish'
            ? 'Leitura: revisões para cima em inflação/juros/câmbio e/ou para baixo em crescimento → piora de condições financeiras. Operacional: tende a WDO↑ / WIN↓ (precisa confirmar com preço/fluxo).'
            : bias === 'dovish'
                ? 'Leitura: revisões para baixo em inflação/juros/câmbio e/ou para cima em crescimento → alívio de condições financeiras. Operacional: tende a WDO↓ / WIN↑ (precisa confirmar com preço/fluxo).'
                : 'Leitura: revisões mistas (sem direção clara). Operacional: tratar como neutro e esperar confirmação por preço/fluxo.';
    const focusInsights = (() => {
        const getPack = y => (raw && raw.years && y && raw.years[y] ? raw.years[y] : null);
        const series = (yearKeys || []).map(y => ({ y, pack: getPack(y) })).filter(x => !!x.pack);
        if (!series.length) return { macroText: '', carryText: '', curveText: '' };
        const getNum = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
        const points = series.map(({ y, pack }) => ({
            y,
            ipcaMed: getNum(pack.ipca && pack.ipca.mediana),
            selicMed: getNum(pack.selic && pack.selic.mediana),
            fxMed: getNum(pack.cambio && pack.cambio.mediana),
            pibMed: getNum(pack.pib && pack.pib.mediana),
            ipcaD: getNum(pack.ipca && pack.ipca.deltaMediana),
            selicD: getNum(pack.selic && pack.selic.deltaMediana),
            fxD: getNum(pack.cambio && pack.cambio.deltaMediana),
            pibD: getNum(pack.pib && pack.pib.deltaMediana),
        }));
        const head = points[0];
        const tail = points[points.length - 1];
        const ipcaMed = head ? head.ipcaMed : null;
        const selicMed = head ? head.selicMed : null;
        const fxMed = head ? head.fxMed : null;
        const ipcaD = head ? head.ipcaD : null;
        const selicD = head ? head.selicD : null;
        const fxD = head ? head.fxD : null;
        const pibD = head ? head.pibD : null;
        const s = v => (typeof v === 'number' && Number.isFinite(v) ? (v > 0 ? '+' : '') + formatNumber(v, 2) : '—');
        const sFx = v => (typeof v === 'number' && Number.isFinite(v) ? (v > 0 ? '+' : '') + formatNumber(v, 4) : '—');
        const avg = arr => {
            const xs = (arr || []).filter(v => typeof v === 'number' && Number.isFinite(v));
            if (!xs.length) return null;
            return xs.reduce((a, b) => a + b, 0) / xs.length;
        };
        const listDelta = (key, fmt) => {
            const parts = points
                .map(p => (typeof p[key] === 'number' ? `${p.y} ${fmt(p[key])}` : ''))
                .filter(Boolean);
            return parts.join(' • ');
        };
        const listLevel = (key, fmt) => {
            const parts = points
                .map(p => (typeof p[key] === 'number' ? `${p.y} ${fmt(p[key])}` : ''))
                .filter(Boolean);
            return parts.join(' • ');
        };
        const ipcaAvgD = avg(points.map(p => p.ipcaD));
        const selicAvgD = avg(points.map(p => p.selicD));
        const fxAvgD = avg(points.map(p => p.fxD));
        const pibAvgD = avg(points.map(p => p.pibD));
        const ipcaShortD = head ? head.ipcaD : null;
        const ipcaLongD = tail ? tail.ipcaD : null;
        const selicShortD = head ? head.selicD : null;
        const selicLongD = tail ? tail.selicD : null;
        const ipcaConcentration = (() => {
            if (typeof ipcaShortD !== 'number' || typeof ipcaLongD !== 'number') return '';
            const aS = Math.abs(ipcaShortD);
            const aL = Math.abs(ipcaLongD);
            if (aS < 0.01 && aL < 0.01) return 'Revisões pequenas ao longo do horizonte.';
            if (aL > aS * 1.4) return 'Revisão mais forte no longo (sinal de desancoragem).';
            if (aS > aL * 1.4) return 'Revisão concentrada no curto (choque mais imediato).';
            return 'Revisão relativamente espalhada no horizonte (curto e longo).';
        })();

        const macroRegime = (() => {
            const infUp = typeof ipcaAvgD === 'number' && ipcaAvgD > 0.03;
            const infDown = typeof ipcaAvgD === 'number' && ipcaAvgD < -0.03;
            const actUp = typeof pibAvgD === 'number' && pibAvgD > 0.03;
            const actDown = typeof pibAvgD === 'number' && pibAvgD < -0.03;
            if (infUp && actDown) return 'Macro: risco de estagflação (inflação ↑ e atividade ↓).';
            if (infUp && actUp) return 'Macro: pressão de demanda (inflação ↑ com atividade ↑).';
            if (infDown && actDown) return 'Macro: desinflação com desaceleração (crescimento sob pressão).';
            if (infDown && actUp) return 'Macro: cenário benigno (inflação ↓ com atividade ↑).';
            return 'Macro: quadro misto (sem diagnóstico único).';
        })();
        const macroParts = [];
        const ipcaDeltaList = listDelta('ipcaD', v => `${s(v)} p.p.`);
        const selicDeltaList = listDelta('selicD', v => `${s(v)} p.p.`);
        const fxDeltaList = listDelta('fxD', v => `${sFx(v)}`);
        const pibDeltaList = listDelta('pibD', v => `${s(v)} p.p.`);
        if (ipcaDeltaList) macroParts.push(`IPCA Δ: ${ipcaDeltaList}`);
        if (selicDeltaList) macroParts.push(`Selic Δ: ${selicDeltaList}`);
        if (fxDeltaList) macroParts.push(`Câmbio Δ: ${fxDeltaList}`);
        if (pibDeltaList) macroParts.push(`PIB Δ: ${pibDeltaList}`);
        const macroText = `${macroRegime} ${ipcaConcentration}${macroParts.length ? ` ${macroParts.join(' • ')}` : ''}`;

        const usdSpot = (() => {
            if (!data) return null;
            const sym = findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i);
            if (!sym) return null;
            const p = getMostRecentPointWithPrice(data, sym) || getLastPoint(data, sym);
            const px = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            return px;
        })();
        const usShort = (() => {
            try {
                const zq = window.ZQ_CURVE_DATA || null;
                const it = zq && Array.isArray(zq.items) ? zq.items[0] : null;
                const r = it && typeof it.impliedRatePct === 'number' && Number.isFinite(it.impliedRatePct) ? it.impliedRatePct : null;
                if (typeof r === 'number') return r;
            } catch {
            }
            if (!data) return null;
            const sym = findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y');
            if (!sym) return null;
            const p = getMostRecentPointWithPrice(data, sym) || getLastPoint(data, sym);
            const px = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            return px;
        })();
        const carryDiff = typeof selicMed === 'number' && typeof usShort === 'number' ? (selicMed - usShort) : null;
        const fxDepPct = typeof fxMed === 'number' && typeof usdSpot === 'number' && usdSpot > 0 ? ((fxMed / usdSpot) - 1) * 100 : null;
        const carryNet = typeof carryDiff === 'number' && typeof fxDepPct === 'number' ? (carryDiff - fxDepPct) : null;
        const realBr = typeof selicMed === 'number' && typeof ipcaMed === 'number' ? (selicMed - ipcaMed) : null;
        const selicLevelList = listLevel('selicMed', v => `${formatNumber(v, 2)}%`);
        const ipcaLevelList = listLevel('ipcaMed', v => `${formatNumber(v, 2)}%`);
        const termLabel = (first, last, unit) => {
            if (typeof first !== 'number' || typeof last !== 'number') return '';
            const d = last - first;
            const arrow = d > 0.02 ? '↑' : d < -0.02 ? '↓' : '≈';
            return `${arrow} ${formatNumber(d, 2)}${unit}`;
        };
        const selicTerm = termLabel(head ? head.selicMed : null, tail ? tail.selicMed : null, ' p.p.');
        const ipcaTerm = termLabel(head ? head.ipcaMed : null, tail ? tail.ipcaMed : null, ' p.p.');
        const carryConclusion = typeof carryNet === 'number'
            ? (carryNet >= 3 ? 'Carry: atrativo (se risco permitir).' : carryNet <= 0.5 ? 'Carry: fraco/assimétrico (risco FX domina).' : 'Carry: moderado (sensível ao risco/FX).')
            : 'Carry: dados insuficientes para estimar diferencial/FX.';
        const carryParts = [];
        if (typeof selicMed === 'number') carryParts.push(`Selic ${formatNumber(selicMed, 2)}%`);
        if (typeof usShort === 'number') carryParts.push(`US ${formatNumber(usShort, 2)}%`);
        if (typeof carryDiff === 'number') carryParts.push(`Dif ${formatNumber(carryDiff, 2)} p.p.`);
        if (typeof usdSpot === 'number' && typeof fxMed === 'number') {
            const fxImp = typeof fxDepPct === 'number' ? `${formatNumber(fxDepPct, 2)}%` : '—';
            carryParts.push(`USD/BRL ${formatNumber(usdSpot, 4)} → ${formatNumber(fxMed, 4)} (FX implícito ${fxImp})`);
        }
        if (typeof carryNet === 'number') carryParts.push(`Carry líquido ~ ${formatNumber(carryNet, 2)} p.p.`);
        if (typeof realBr === 'number') carryParts.push(`Juro real BR ~ ${formatNumber(realBr, 2)} p.p.`);
        if (selicLevelList) carryParts.push(`Termo Selic: ${selicLevelList}${selicTerm ? ` (${selicTerm})` : ''}`);
        if (ipcaLevelList) carryParts.push(`Termo IPCA: ${ipcaLevelList}${ipcaTerm ? ` (${ipcaTerm})` : ''}`);
        const carryText = `${carryConclusion}${carryParts.length ? ` ${carryParts.join(' • ')}` : ''}`;

        const curveText = (() => {
            if (!diSignal || !diSignal.ok) return 'Curva: sem leitura DI (B3) no histórico.';
            const sh = diSignal.shape ? String(diSignal.shape) : '≈';
            const slope = typeof diSignal.slope === 'number' && Number.isFinite(diSignal.slope) ? `${formatNumber(diSignal.slope, 2)} p.p.` : '—';
            const shapeLab = sh === 'STEEPEN' ? 'inclinando' : sh === 'FLATTEN' ? 'achatando' : 'estável';
            const aS = diSignal.anchors && diSignal.anchors.short ? diSignal.anchors.short : null;
            const aL = diSignal.anchors && diSignal.anchors.long ? diSignal.anchors.long : null;
            const shortLab = aS && aS.symbol ? String(aS.symbol) : '';
            const longLab = aL && aL.symbol ? String(aL.symbol) : '';
            const shortChg = aS && typeof aS.chgPct === 'number' && Number.isFinite(aS.chgPct) ? `${(aS.chgPct * 10) > 0 ? '+' : ''}${formatNumber(aS.chgPct * 10, 1)}bp` : '—';
            const longChg = aL && typeof aL.chgPct === 'number' && Number.isFinite(aL.chgPct) ? `${(aL.chgPct * 10) > 0 ? '+' : ''}${formatNumber(aL.chgPct * 10, 1)}bp` : '—';
            const focusJuros = (() => {
                const shortUp = typeof selicShortD === 'number' && selicShortD > 0.03;
                const shortDown = typeof selicShortD === 'number' && selicShortD < -0.03;
                const longUp = typeof selicLongD === 'number' && selicLongD > 0.03;
                const longDown = typeof selicLongD === 'number' && selicLongD < -0.03;
                if (shortUp && longUp) return 'Focus mais duro → pressão generalizada (curto e longo).';
                if (shortDown && longDown) return 'Focus mais leve → alívio generalizado (curto e longo).';
                if (shortUp && !longUp) return 'Focus mais duro → pressão no curto (longo menos afetado).';
                if (shortDown && !longDown) return 'Focus mais leve → alívio no curto (longo menos afetado).';
                if (!shortUp && longUp) return 'Focus mais duro no longo → prêmio/ancoragem em foco.';
                if (!shortDown && longDown) return 'Focus mais leve no longo → alívio de prêmio/ancoragem.';
                if (typeof selicAvgD === 'number' && selicAvgD > 0.03) return 'Selic média revisada para cima no horizonte.';
                if (typeof selicAvgD === 'number' && selicAvgD < -0.03) return 'Selic média revisada para baixo no horizonte.';
                return 'Focus sem choque claro de Selic no horizonte.';
            })();
            const parts = [];
            if (shortLab) parts.push(`${shortLab} Δ ${shortChg}`);
            if (longLab) parts.push(`${longLab} Δ ${longChg}`);
            return `Curva: DI (B3) ${shapeLab} • slope ${slope}. ${focusJuros}${parts.length ? ` ${parts.join(' • ')}` : ''}`;
        })();

        return { macroText, carryText, curveText };
    })();
    const insightCard = (title, text) => {
        if (!text) return '';
        return `
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${escapeHtml(title)}</div>
                        <div style="margin-top:6px;opacity:.86;line-height:1.35;font-size:12px;">${escapeHtml(text)}</div>
                    </div>
                `;
    };
    const insightsHtml = (() => {
        const blocks = [
            insightCard('Macro', focusInsights.macroText),
            insightCard('Carry Trade', focusInsights.carryText),
            insightCard('Curva de Juros', focusInsights.curveText),
        ].filter(Boolean);
        if (!blocks.length) return '';
        return `
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                        ${blocks.join('')}
                    </div>
                `;
    })();
    const yearCard = (title, pack) => {
        if (!pack) return '';
        const updated = pack.updatedAt ? formatDateTimeLoose(pack.updatedAt) : '';
        return `
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                            <div style="font-weight:900;letter-spacing:.8px;">${escapeHtml(title)}</div>
                            <div style="opacity:.75;font-size:12px;white-space:nowrap;">${escapeHtml(updated || '')}</div>
                        </div>
                        <div style="margin-top:8px;">
                            ${line('IPCA (%)', 'ipca', pack.ipca, fmt2)}
                            ${line('Selic (%)', 'selic', pack.selic, fmt2)}
                            ${line('Câmbio (R$/US$)', 'cambio', pack.cambio, fmt4)}
                            ${line('PIB (%)', 'pib', pack.pib, fmt2)}
                        </div>
                    </div>
                `;
    };
    return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🧩 Boletim Focus (BCB)</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(biasTone, `Viés: ${biasLabel}`)}
                            ${badge('neutral', `Score: ${formatNumber(score, 2)}`)}
                            ${badge('neutral', `WDO ${wdo}`)}
                            ${badge('neutral', `WIN ${win}`)}
                            ${publishedAt ? badge('neutral', `Publicado: ${formatDateTimeLoose(publishedAt)}`) : ''}
                            ${cutoffDate ? badge('neutral', `Corte: ${cutoffDate}`) : ''}
                            <a href="${escapeHtml(pageUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">página</a>
                            ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">pdf</a>` : ''}
                            ${datasetUrl ? `<a href="${escapeHtml(datasetUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.75;">dataset</a>` : ''}
                        </div>
                    </div>
                    <div style="margin-top:8px;opacity:.90;line-height:1.35;">${escapeHtml(interpretation)}</div>
                    ${insightsHtml}
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                        ${(yearKeys || [])
                            .map(y => yearCard(`Mediana ${y}`, raw && raw.years ? raw.years[y] : null))
                            .join('')}
                    </div>
                </div>
            `;
}

function opBriefing_computeAdrPremarketHtml({
    data,
    operationalTuning,
    getLastPoint,
    pointPct,
    isBrazilAdr,
    formatPercent,
    escapeHtml,
}) {
    const now = new Date();
    const hr = now.getHours();
    const min = now.getMinutes();
    if (hr > 11 || (hr === 11 && min >= 1)) return '';
    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const isRecentPremarketSnapshot = asOf => {
        if (!(asOf instanceof Date) || !Number.isFinite(asOf.getTime())) return false;
        const ageMs = now.getTime() - asOf.getTime();
        const maxAgeMs = 20 * 60 * 60 * 1000;
        return ageMs >= -2 * 60 * 1000 && ageMs <= maxAgeMs;
    };
    const rows = assets.map(a => {
        const last = getLastPoint(data, a.symbol);
        const asOfVal = last && (last.asOf || last.t) ? (last.asOf || last.t) : null;
        const tMs = asOfVal ? Date.parse(asOfVal) : NaN;
        const asOf = Number.isFinite(tMs) ? new Date(tMs) : null;
        const pct = pointPct(last);
        return { symbol: a.symbol, name: a.name, last, pct, asOf, isAdr: isBrazilAdr({ symbol: a.symbol, name: a.name }) };
    }).filter(r => r.isAdr && r.pct !== null && r.asOf && isRecentPremarketSnapshot(r.asOf));
    if (!rows.length) return '';
    const ups = rows.filter(r => r.pct > 0);
    const downs = rows.filter(r => r.pct < 0);
    const avg = rows.length ? rows.reduce((s, r) => s + r.pct, 0) / rows.length : 0;
    const th = operationalTuning && operationalTuning.threshold && typeof operationalTuning.threshold.export === 'number' && Number.isFinite(operationalTuning.threshold.export)
        ? operationalTuning.threshold.export
        : 0.25;
    const bias = avg > th ? 'ALTISTA' : avg < -th ? 'BAIXISTA' : 'NEUTRO';
    const top = rows.slice().sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 6);
    const toneColor = avg > 0 ? 'rgba(0,255,160,.95)' : avg < 0 ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
    const deg = Math.round(Math.max(-1, Math.min(1, avg / 0.6)) * 60);
    const gauge = `
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:110px;height:60px;border:1px solid rgba(255,255,255,.18);border-radius:110px 110px 0 0;background:rgba(0,0,0,.22);position:relative;overflow:hidden;box-shadow:${avg > 0 ? '0 0 18px rgba(0,255,160,.35)' : avg < 0 ? '0 0 18px rgba(255,60,80,.35)' : '0 0 18px rgba(255,210,74,.28)'};">
                        <div style="position:absolute;left:8px;right:8px;bottom:8px;height:12px;border-radius:999px;background:linear-gradient(90deg, rgba(255,60,80,.85) 0%, rgba(255,210,74,.85) 50%, rgba(0,255,160,.85) 100%);opacity:.85;"></div>
                        <div style="position:absolute;left:50%;bottom:8px;width:3px;height:46px;background:${toneColor};transform-origin:bottom center;transform:translateX(-50%) rotate(${deg}deg);box-shadow:0 0 14px rgba(255,255,255,.22);border-radius:3px;"></div>
                    </div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.6px;">ADR pré • ${bias} • ${formatPercent(avg, 2)}</div>
                </div>
            `;
    const list = top.map(r => {
        const pct = r.pct;
        const c = pct > 0 ? 'rgba(0,255,160,.95)' : pct < 0 ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
        return `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:9px;background:rgba(0,0,0,.16);">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:8px;height:8px;border-radius:999px;background:${c};"></div>
                            <div style="font-weight:700;letter-spacing:.5px;opacity:.92;">${escapeHtml(r.name || r.symbol)}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;">${formatPercent(pct, 2)}</div>
                    </div>
                `;
    }).join('');
    return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">ADR BR (Extended Hours) • até 11:00</div>
                        <div style="opacity:.86;font-size:12px;">${ups.length} ↑ • ${downs.length} ↓ • ${rows.length} total</div>
                    </div>
                    <div style="margin-top:8px;">${gauge}</div>
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;">${list}</div>
                </div>
            `;
}

function opBriefing_computeCdsSignalCardHtml({
    cdsSignal,
    escapeHtml,
    toneBadgeHtmlFromTone,
    formatNumber,
}) {
    if (!cdsSignal) return '';
    if (cdsSignal.mode === 'neutral') return '';
    const tone = cdsSignal.tone;
    const title = 'CDS Brasil: fluxo x hedge';
    const op = cdsSignal.mode === 'hedge_on_risk_on'
        ? 'Leitura: proteção subindo sem “desmontar Brasil” (possível compra de risco com hedge). Operacional: manter viés do regime, mas exigir confirmação e usar stops/hedge.'
        : cdsSignal.mode === 'risk_off_classic'
            ? 'Leitura: proteção subindo com BRL enfraquecendo e bolsa caindo (risk-off clássico). Operacional: reduzir risco e priorizar proteção.'
            : cdsSignal.mode === 'relief_risk_on'
                ? 'Leitura: melhora de risco (CDS↓) com BRL fortalecendo e bolsa subindo. Operacional: favorece risco (desde que o regime confirme).'
                : 'Leitura: CDS sinaliza movimento sem confirmação completa. Operacional: tratar como cautela.';
    return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(title)}</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${toneBadgeHtmlFromTone(tone, cdsSignal.confidence, `${formatNumber(cdsSignal.confidence * 100, 0)}%`, { maxAbs: 1 })}</div>
                    </div>
                    <div style="margin-top:8px;font-weight:900;">${toneBadgeHtmlFromTone(tone, 0, cdsSignal.label, { maxAbs: 1 })}</div>
                    <div style="margin-top:8px;opacity:.86;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(cdsSignal.detail)}</div>
                    <div style="margin-top:8px;opacity:.92;line-height:1.35;">${escapeHtml(op)}</div>
                </div>
            `;
}

function opBriefing_computeFactorsRowsHtml({
    data,
    regime,
    macro,
    macroWdo,
    macroWin,
    newsTilt,
    priceLead,
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
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${link('#operational-now', 'Confirmação (WIN↑ & WDO↓)')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(priceLead.active ? 'positive' : 'neutral', priceLead.active ? priceLead.reason : '—')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(priceLead.active ? 'negative' : 'neutral', priceLead.active ? 'Venda' : 'Neutro')}</td>
                                <td style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06);">${mk(priceLead.active ? 'positive' : 'neutral', priceLead.active ? 'Compra' : 'Neutro')}</td>
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
        const snap = valuePricePct('HTDIX');
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

function opBriefing_computeDiSignal({ data }) {
    if (!data) return { ok: false };
    const seriesKeys = Object.keys((data && data.series) || {});
    const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;

    const monthNum = code => {
        const c = String(code || '').toUpperCase();
        if (c === 'F') return 1;
        if (c === 'G') return 2;
        if (c === 'H') return 3;
        if (c === 'J') return 4;
        if (c === 'K') return 5;
        if (c === 'M') return 6;
        if (c === 'N') return 7;
        if (c === 'Q') return 8;
        if (c === 'U') return 9;
        if (c === 'V') return 10;
        if (c === 'X') return 11;
        if (c === 'Z') return 12;
        return null;
    };

    const symbolsFromSeries = seriesKeys.filter(sym => diMatcher.test(sym));
    const symbolsFromAssets = (data.assets || [])
        .map(a => String(a && a.symbol ? a.symbol : ''))
        .filter(sym => diMatcher.test(sym));
    const symbolsAll = Array.from(new Set([...symbolsFromSeries, ...symbolsFromAssets]));
    if (!symbolsAll.length) return { ok: false };

    const maturityYears = (y, m) => {
        if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
        const now = new Date();
        const t = new Date(y, m - 1, 1);
        const months = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
        if (!Number.isFinite(months)) return null;
        return months / 12;
    };

    const list = symbolsAll
        .map(symbol => {
            const last = getMostRecentPointWithPrice(data, symbol);
            const rate = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            const chg = last && typeof last.change === 'number' && Number.isFinite(last.change) ? last.change : null;
            const chgBp10 = typeof chg === 'number' && Number.isFinite(chg) ? (chg * 100) / 10 : null;
            const chgPct = pointPct(last);
            const y = 2000 + Number(String(symbol).slice(-2));
            const m = monthNum(String(symbol)[3]);
            return { symbol, rate, chgBp10, chgPct, year: Number.isFinite(y) ? y : null, month: m };
        })
        .filter(x => x.rate !== null && x.year !== null && x.month !== null)
        .map(x => ({ ...x, yrs: maturityYears(x.year, x.month) }))
        .filter(x => typeof x.yrs === 'number' && Number.isFinite(x.yrs) && x.yrs > 0);

    if (!list.length) return { ok: false };

    const median = vals => {
        const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v)).slice().sort((a, b) => a - b);
        if (!xs.length) return null;
        const mid = Math.floor(xs.length / 2);
        return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
    };
    const bucketOfYears = yrs => yrs < 2 ? 'short' : yrs <= 5 ? 'mid' : 'long';
    const avg = vals => {
        const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v));
        return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
    };
    const pickAnchor = (bucketItems, targetYrs) => {
        const xs = (bucketItems || []).slice().filter(x => x && typeof x.yrs === 'number' && Number.isFinite(x.yrs));
        if (!xs.length) return null;
        const isJan = x => String(x && x.symbol ? x.symbol : '')[3]?.toUpperCase?.() === 'F';
        const jan = xs.filter(isJan);
        const pool = jan.length ? jan : xs;
        const tgt = typeof targetYrs === 'number' && Number.isFinite(targetYrs) ? targetYrs : null;
        const score = x => {
            if (tgt === null) return x.yrs;
            return Math.abs(x.yrs - tgt);
        };
        return pool.reduce((best, cur) => (best === null || score(cur) < score(best) ? cur : best), null);
    };
    const pick = k => list.filter(x => bucketOfYears(x.yrs) === k);

    const short = pick('short');
    const mid = pick('mid');
    const long = pick('long');

    const shortRate = avg(short.map(x => x.rate));
    const midRate = avg(mid.map(x => x.rate));
    const longRate = avg(long.map(x => x.rate));

    const shortChg = avg(short.map(x => x.chgBp10));
    const midChg = avg(mid.map(x => x.chgBp10));
    const longChg = avg(long.map(x => x.chgBp10));

    const avgChg = avg(list.map(x => x.chgBp10));
    const medChg = median(list.map(x => x.chgBp10));
    const slope = typeof longRate === 'number' && typeof shortRate === 'number' ? (longRate - shortRate) : null;
    const shape = slope === null ? 'N/A' : slope > 0.15 ? 'STEEPEN' : slope < -0.15 ? 'FLATTEN' : '≈';

    const th = 0.35;
    const dirUsd = typeof medChg === 'number' && Number.isFinite(medChg) ? (medChg > th ? 1 : medChg < -th ? -1 : 0) : 0;
    const wdoBias = dirUsd > 0 ? 'buy' : dirUsd < 0 ? 'sell' : 'neutral';
    const winBias = dirUsd > 0 ? 'sell' : dirUsd < 0 ? 'buy' : 'neutral';

    return {
        ok: true,
        shape,
        slope,
        buckets: {
            short: { rate: shortRate, chgPct: shortChg, n: short.length },
            mid: { rate: midRate, chgPct: midChg, n: mid.length },
            long: { rate: longRate, chgPct: longChg, n: long.length },
        },
        anchors: {
            short: pickAnchor(short, 1.0),
            mid: pickAnchor(mid, 3.5),
            long: pickAnchor(long, 8.0),
        },
        avgChg,
        medChg,
        dirUsd,
        wdoBias,
        winBias,
    };
}
