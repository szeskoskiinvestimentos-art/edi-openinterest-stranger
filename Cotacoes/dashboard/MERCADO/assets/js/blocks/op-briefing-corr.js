function opBriefing_computeCorrLine({ data, findAliasSymbolBest, findAssetSymbol, findAliasSymbol, formatNumber }) {
    if (!data) return null;

    const fmtNum = (n, d) => (typeof formatNumber === 'function' ? formatNumber(n, d) : String(n));

    const buildReturnSeries = (symbol, maxPoints = 96) => {
        const points = data.series && data.series[symbol] ? data.series[symbol] : [];
        if (!Array.isArray(points) || points.length < 6) return [];
        const start = Math.max(0, points.length - maxPoints);
        const out = [];
        for (let i = start + 1; i < points.length; i += 1) {
            const a = points[i - 1];
            const b = points[i];
            const pa = a && typeof a.price === 'number' && Number.isFinite(a.price) ? a.price : null;
            const pb = b && typeof b.price === 'number' && Number.isFinite(b.price) ? b.price : null;
            const tbRaw = b && b.t ? Date.parse(b.t) : NaN;
            const tMs = Number.isFinite(tbRaw) ? tbRaw : null;
            if (pa === null || pb === null || tMs === null) continue;
            if (pa <= 0 || pb <= 0) continue;
            const r = Math.log(pb / pa);
            if (!Number.isFinite(r)) continue;
            out.push({ tMs: tMs, r });
        }
        return out;
    };

    const correlationAligned = (seriesA, seriesB, minPoints = 20) => {
        if (!Array.isArray(seriesA) || !Array.isArray(seriesB)) return null;
        const mapB = new Map();
        for (const p of seriesB) mapB.set(p.tMs, p.r);
        const xs = [];
        const ys = [];
        for (const p of seriesA) {
            const y = mapB.get(p.tMs);
            if (typeof y !== 'number' || !Number.isFinite(y)) continue;
            if (typeof p.r !== 'number' || !Number.isFinite(p.r)) continue;
            xs.push(p.r);
            ys.push(y);
        }
        const n = xs.length;
        if (n < minPoints) return null;
        const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
        const mx = mean(xs);
        const my = mean(ys);
        let cov = 0;
        let vx = 0;
        let vy = 0;
        for (let i = 0; i < n; i += 1) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            cov += dx * dy;
            vx += dx * dx;
            vy += dy * dy;
        }
        if (vx <= 1e-18 || vy <= 1e-18) return null;
        return { corr: cov / Math.sqrt(vx * vy), n };
    };

    const corrPair = (aSym, bSym) => {
        if (!aSym || !bSym) return null;
        const a = buildReturnSeries(aSym, 96);
        const b = buildReturnSeries(bSym, 96);
        const c = correlationAligned(a, b, 20);
        if (!c || typeof c.corr !== 'number' || !Number.isFinite(c.corr)) return null;
        return c;
    };

    const symWin = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'WIN') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^WINc\d$/i) : null) || null;
    const symWdo = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'WDO') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^WDOc\d$/i) : null) || null;
    const symEwz = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'EWZ') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^EWZ(\.\w+)?$/i) : null) || null;
    const symSpx = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'SPX') : null) || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'SPX') : null) || null;
    const symUsd = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'USD_BRL') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^USD\/BRL\b/i) : null) || null;
    const symVxbr = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'VXBR') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /(^\.VXBR$|\bVXBR\b)/i) : null) || null;

    const winEwz = corrPair(symWin, symEwz);
    const winSpx = corrPair(symWin, symSpx);
    const wdoUsd = corrPair(symWdo, symUsd);
    const vxbrWin = corrPair(symVxbr, symWin);

    const usdEmfx = (() => {
        if (!symUsd || typeof findAssetSymbol !== 'function') return null;
        const usd = buildReturnSeries(symUsd, 96);
        const symCnh = findAssetSymbol(data, /^USD\/CNH\b/i);
        const symMxn = findAssetSymbol(data, /^USD\/MXN\b/i);
        const symZar = findAssetSymbol(data, /^USD\/ZAR\b/i);
        const comps = [
            symCnh ? { sym: symCnh, w: 1 } : null,
            symMxn ? { sym: symMxn, w: 1 } : null,
            symZar ? { sym: symZar, w: 1 } : null,
        ].filter(Boolean);
        if (!comps.length) return null;

        const compSeries = comps.map(c => ({ w: c.w, map: new Map(buildReturnSeries(c.sym, 96).map(p => [p.tMs, p.r])) }));
        const basket = [];
        for (const p of usd) {
            let sumW = 0;
            let sumR = 0;
            let have = 0;
            for (const cs of compSeries) {
                const r = cs.map.get(p.tMs);
                if (typeof r !== 'number' || !Number.isFinite(r)) continue;
                sumW += cs.w;
                sumR += cs.w * r;
                have += 1;
            }
            if (have < 2 || sumW <= 0) continue;
            basket.push({ tMs: p.tMs, r: sumR / sumW });
        }
        const c = correlationAligned(usd, basket, 20);
        return c && typeof c.corr === 'number' && Number.isFinite(c.corr) ? c : null;
    })();

    const fmt = c => `${fmtNum(c.corr, 2)}${c.n ? ` (n=${String(c.n)})` : ''}`;
    const parts = [];
    if (winEwz) parts.push(`WIN×EWZ ${fmt(winEwz)}`);
    if (winSpx) parts.push(`WIN×SPX ${fmt(winSpx)}`);
    if (wdoUsd) parts.push(`WDO×USD/BRL ${fmt(wdoUsd)}`);
    if (usdEmfx) parts.push(`USD/BRL×EMFX ${fmt(usdEmfx)}`);
    if (vxbrWin) parts.push(`VXBR×WIN ${fmt(vxbrWin)}`);
    if (!parts.length) return null;
    return `Correlações (janela curta): ${parts.join(' • ')}`;
}
