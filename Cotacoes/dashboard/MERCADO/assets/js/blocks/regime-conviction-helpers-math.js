(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

    const downgradeConvictionLabel = (label, steps) => {
        const s = Math.max(0, Math.floor(Number(steps) || 0));
        let out = String(label || '');
        for (let i = 0; i < s; i++) {
            if (out === 'ALTA') out = 'MÉDIA';
            else if (out === 'MÉDIA') out = 'BAIXA';
            else out = 'BAIXA';
        }
        return out;
    };

    const buildReturnSeries = (data, symbol, maxPoints) => {
        if (!data || !symbol) return [];
        const pts = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
        const priced = Array.isArray(pts)
            ? pts
                .map(p => {
                    const tMs = p && p.t ? Date.parse(p.t) : NaN;
                    const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                    return Number.isFinite(tMs) && typeof price === 'number' ? { tMs, price } : null;
                })
                .filter(Boolean)
            : [];
        if (priced.length < 3) return [];
        const n = Math.max(6, Math.floor(Number(maxPoints) || 72));
        const slice = priced.slice(Math.max(0, priced.length - n));
        const out = [];
        for (let i = 1; i < slice.length; i++) {
            const prev = slice[i - 1];
            const cur = slice[i];
            if (!prev || !cur) continue;
            if (!(prev.price > 0) || !(cur.price > 0)) continue;
            const r = Math.log(cur.price / prev.price);
            if (!Number.isFinite(r)) continue;
            out.push({ tMs: cur.tMs, r });
        }
        return out;
    };

    const correlationAligned = (a, b) => {
        const mapB = new Map((Array.isArray(b) ? b : []).map(x => [x.tMs, x.r]));
        const xs = [];
        const ys = [];
        for (const x of (Array.isArray(a) ? a : [])) {
            if (!x || !Number.isFinite(x.tMs) || !Number.isFinite(x.r)) continue;
            const y = mapB.get(x.tMs);
            if (typeof y !== 'number' || !Number.isFinite(y)) continue;
            xs.push(x.r);
            ys.push(y);
        }
        const n = xs.length;
        if (n < 12) return { corr: null, n };
        const mx = xs.reduce((s, v) => s + v, 0) / n;
        const my = ys.reduce((s, v) => s + v, 0) / n;
        let cov = 0;
        let vx = 0;
        let vy = 0;
        for (let i = 0; i < n; i++) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            cov += dx * dy;
            vx += dx * dx;
            vy += dy * dy;
        }
        const denom = Math.sqrt(vx * vy);
        if (!(denom > 0) || !Number.isFinite(denom)) return { corr: null, n };
        const c = cov / denom;
        return { corr: Number.isFinite(c) ? Math.max(-1, Math.min(1, c)) : null, n };
    };

    const weightedAvg = (items) => {
        const pairs = (items || [])
            .map(x => ({
                v: x && typeof x.val === 'number' && Number.isFinite(x.val) ? x.val : null,
                w: x && typeof x.weight === 'number' && Number.isFinite(x.weight) ? x.weight : 1,
            }))
            .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0);
        const wsum = pairs.reduce((a, b) => a + b.w, 0);
        if (!(wsum > 0)) return null;
        const s = pairs.reduce((a, b) => a + b.v * b.w, 0);
        const score = s / wsum;
        return isNum(score) ? score : null;
    };

    w.regimeConvictionMath = {
        downgradeConvictionLabel,
        buildReturnSeries,
        correlationAligned,
        weightedAvg,
    };
})();
