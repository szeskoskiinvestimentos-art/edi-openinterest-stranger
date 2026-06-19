function opBriefing_pctAt(data, symbol, minutes) {
    if (!data || !symbol) return null;
    const s = String(symbol || '');
    const series = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : [];
    if (!series.length) return null;
    const msOf = (iso) => {
        const t = iso ? Date.parse(String(iso)) : NaN;
        return Number.isFinite(t) ? t : null;
    };
    const best = (() => {
        let out = null;
        let bestAsOf = -Infinity;
        let bestT = -Infinity;
        for (let i = 0; i < series.length; i += 1) {
            const p = series[i];
            const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            if (price === null || !(price > 0)) continue;
            const asOfMs = msOf(p.asOf);
            const tMs = msOf(p.t);
            const a = asOfMs !== null ? asOfMs : -Infinity;
            const t = tMs !== null ? tMs : -Infinity;
            if (a > bestAsOf || (a === bestAsOf && t > bestT)) {
                out = p;
                bestAsOf = a;
                bestT = t;
            }
        }
        return out;
    })();
    const last = best || series[series.length - 1];
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
    const symWin = pulseNow && pulseNow.sym ? pulseNow.sym.win : null;
    const symWdo = pulseNow && pulseNow.sym ? pulseNow.sym.wdo : null;
    const winPct =
        (pulseNow && pulseNow.market && typeof pulseNow.market.winPct === 'number' && Number.isFinite(pulseNow.market.winPct))
            ? pulseNow.market.winPct
            : (symWin ? opBriefing_pctAt(data, symWin, 15) : null);
    const wdoPct =
        (pulseNow && pulseNow.market && typeof pulseNow.market.wdoPct === 'number' && Number.isFinite(pulseNow.market.wdoPct))
            ? pulseNow.market.wdoPct
            : (symWdo ? opBriefing_pctAt(data, symWdo, 15) : null);
    const usdSym = (pulseNow && pulseNow.sym && pulseNow.sym.usdbrl)
        || findAliasSymbolBest(data, 'USD_BRL')
        || findAliasSymbol(data, 'USD_BRL')
        || findAssetSymbol(data, /^USD\/BRL\b/i);
    const usdPct = usdSym ? opBriefing_pctAt(data, usdSym, 15) : null;
    const amp = volAmp && typeof volAmp.amp === 'number' && Number.isFinite(volAmp.amp) ? volAmp.amp : 1;
    const thWin = 0.12 / amp;
    const thWdo = 0.12 / amp;
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
