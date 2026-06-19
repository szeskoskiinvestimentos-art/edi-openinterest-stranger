function opBriefing_scalpMicroStats(data, symbol, tune) {
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
}

function opBriefing_scalpKeyLevelsFor(options, symKey) {
    if (!options || !options.items) return null;
    const it = options.items[symKey];
    const key = it && it.keyLevels ? it.keyLevels : null;
    if (!key) return null;
    const gf = typeof key.gammaFlip === 'number' && Number.isFinite(key.gammaFlip) ? key.gammaFlip : null;
    const rangeLow = typeof key.rangeLow === 'number' && Number.isFinite(key.rangeLow) ? key.rangeLow : null;
    const rangeHigh = typeof key.rangeHigh === 'number' && Number.isFinite(key.rangeHigh) ? key.rangeHigh : null;
    return { gf, rangeLow, rangeHigh };
}

function opBriefing_scalpWinStats(data, symbol, lookbackMs) {
    const s = String(symbol || '');
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
}

function opBriefing_scalpWindowStats(data, symbol, lookbackMs) {
    const s = String(symbol || '');
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
}
