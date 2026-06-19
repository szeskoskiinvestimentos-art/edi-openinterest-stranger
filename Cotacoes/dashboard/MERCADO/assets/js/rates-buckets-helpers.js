(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

    const monthNum = (code) => {
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

    const collectDiSymbols = (d) => {
        const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;
        const seriesKeys = Object.keys((d && d.series) || {});
        const diSymbolsFromSeries = seriesKeys.filter(sym => diMatcher.test(sym));
        const diSymbolsFromAssets = (d && d.assets ? d.assets : []).map(a => String(a && a.symbol ? a.symbol : '')).filter(sym => diMatcher.test(sym));
        return Array.from(new Set([...diSymbolsFromSeries, ...diSymbolsFromAssets]));
    };

    const buildDiList = ({ d, deps, pointPct } = {}) => {
        const data = d;
        const diSymbolsAll = collectDiSymbols(data);
        const list = diSymbolsAll
            .map(symbol => {
                const last = deps.getMostRecentPointWithPrice(data, symbol);
                const rate = last && isNum(last.price) ? last.price : null;
                const chg = last && isNum(last.change) ? last.change : null;
                const chgBps = isNum(chg) ? chg * 100 : null;
                const chgPct = typeof pointPct === 'function' ? pointPct(last) : null;
                const cls = chgPct === null ? 'neutral' : chgPct > 0 ? 'positive' : chgPct < 0 ? 'negative' : 'neutral';
                const y = 2000 + Number(String(symbol).slice(-2));
                const m = monthNum(String(symbol)[3]);
                return { label: symbol, symbol, rate, chgPct, cls, kind: 'yield', year: Number.isFinite(y) ? y : null, month: m, chg, chgBps };
            })
            .filter(x => x.rate !== null && x.year !== null && x.month !== null)
            .sort((a, b) => (a.year - b.year) || (a.month - b.month));
        return { diSymbolsAll, diList: list };
    };

    const bucketAvgYield = (list) => {
        const vals = (Array.isArray(list) ? list : [])
            .filter(x => x && x.kind === 'yield')
            .map(x => x.rate)
            .filter(isNum);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };

    const bucketAvgMove = (list, key) => {
        const k = String(key || '');
        const vals = (Array.isArray(list) ? list : [])
            .map(x => x && typeof x === 'object' ? x[k] : null)
            .filter(isNum);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };

    const maturityYears = (y, m) => {
        if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
        const now = new Date();
        const t = new Date(y, m - 1, 1);
        const months = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
        if (!Number.isFinite(months)) return null;
        return months / 12;
    };

    const bucketOfYears = (yrs) => yrs < 2 ? 'Curto' : yrs <= 5 ? 'Médio' : 'Longo';

    w.RatesBucketsHelpers = {
        isNum,
        monthNum,
        collectDiSymbols,
        buildDiList,
        bucketAvgYield,
        bucketAvgMove,
        maturityYears,
        bucketOfYears,
    };
})();
