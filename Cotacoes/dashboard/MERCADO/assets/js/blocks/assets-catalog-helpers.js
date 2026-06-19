(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

    const buildCategories = (assets) => {
        const list = Array.isArray(assets) ? assets : [];
        return Array.from(new Set(list.map(a => String(a && a.category ? a.category : '')).filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    };

    const calcPct = (best, pointPct) => {
        if (typeof pointPct === 'function') return pointPct(best);
        if (!best) return null;
        if (isNum(best.changePct)) return best.changePct;
        if (isNum(best.extendedChangePct) && Math.abs(best.extendedChangePct) <= 50) return best.extendedChangePct;
        return null;
    };

    const buildRowsAll = ({ data, assets, series, getBestPoint, getAnyPoint, pointPct } = {}) => {
        const list = Array.isArray(assets) ? assets : [];
        const s = series && typeof series === 'object' ? series : {};
        const bestOf = typeof getBestPoint === 'function' ? getBestPoint : (() => null);
        const anyOf = typeof getAnyPoint === 'function' ? getAnyPoint : ((sym) => {
            const xs = Array.isArray(s[sym]) ? s[sym] : [];
            return xs.length ? xs[xs.length - 1] : null;
        });
        return list
            .map(a => {
                const symbol = String(a && a.symbol ? a.symbol : '');
                const name = String(a && a.name ? a.name : '');
                const category = String(a && a.category ? a.category : '');
                const exchange = a && a.exchange ? String(a.exchange) : '';
                const tags = Array.isArray(a && a.tags) ? a.tags.map(x => String(x)) : [];
                const xs = Array.isArray(s[symbol]) ? s[symbol] : [];
                const best = bestOf(symbol, data);
                const any = anyOf(symbol, data);
                const lastT = best && best.t ? best.t : any && any.t ? any.t : null;
                const lastPrice = best && isNum(best.price) ? best.price : null;
                const lastChangePct = calcPct(best, pointPct);
                const lastExtChangePct = best && isNum(best.extendedChangePct) ? best.extendedChangePct : null;
                return {
                    symbol,
                    name,
                    category,
                    exchange,
                    tags,
                    points: xs.length,
                    lastT,
                    lastPrice,
                    lastChangePct,
                    lastExtChangePct,
                    hasSeries: xs.length > 0,
                    hasPrice: lastPrice !== null,
                };
            })
            .sort((a, b) => a.symbol.localeCompare(b.symbol, 'en'));
    };

    const buildCounts = (rowsAll) => {
        const rows = Array.isArray(rowsAll) ? rowsAll : [];
        return {
            assets: rows.length,
            withSeries: rows.filter(r => r && r.hasSeries).length,
            withPrice: rows.filter(r => r && r.hasPrice).length,
            noSeries: rows.filter(r => r && !r.hasSeries).length,
            noPrice: rows.filter(r => r && r.hasSeries && !r.hasPrice).length,
        };
    };

    const readSymbolsSnapshot = (storageKey) => {
        try {
            const raw = localStorage.getItem(String(storageKey || ''));
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || typeof obj !== 'object') return null;
            const syms = Array.isArray(obj.symbols) ? obj.symbols.map(x => String(x)) : [];
            return { symbols: new Set(syms), at: obj.at ? String(obj.at) : '' };
        } catch {
            return null;
        }
    };

    const computeDelta = (prev, curSymbols) => {
        const cur = curSymbols instanceof Set ? curSymbols : new Set(Array.isArray(curSymbols) ? curSymbols : []);
        if (!prev || !(prev.symbols instanceof Set)) return { added: [], removed: [], at: '' };
        const added = [];
        const removed = [];
        for (const s of cur) if (!prev.symbols.has(s)) added.push(s);
        for (const s of prev.symbols) if (!cur.has(s)) removed.push(s);
        return { added: added.sort(), removed: removed.sort(), at: prev.at || '' };
    };

    const writeSymbolsSnapshot = (storageKey, at, curSymbols) => {
        try {
            const cur = curSymbols instanceof Set ? curSymbols : new Set(Array.isArray(curSymbols) ? curSymbols : []);
            localStorage.setItem(String(storageKey || ''), JSON.stringify({ at: at || new Date().toISOString(), symbols: Array.from(cur).sort() }));
        } catch {
        }
    };

    const buildRatesCreditSummary = ({ catalog, catDeps, data } = {}) => {
        if (!catalog) return { baseResolved: [], extras: [], extrasSymbols: [] };
        const defs = typeof catalog.listRatesCredit === 'function' ? catalog.listRatesCredit() : [];
        const baseResolved = typeof catalog.buildResolved === 'function'
            ? defs.map(def => catalog.buildResolved(catDeps, data, def)).filter(Boolean)
            : [];
        const baseSymbols = new Set(baseResolved.map(x => String(x && x.symbol ? x.symbol : '')).filter(Boolean));
        const discovered = typeof catalog.discoverRatesCredit === 'function'
            ? catalog.discoverRatesCredit(data, { max: 80 })
            : [];
        const extras = (discovered || []).filter(x => x && x.symbol && !baseSymbols.has(String(x.symbol)));
        const extrasSymbols = extras.map(x => String(x.symbol));
        return { baseResolved, extras, extrasSymbols };
    };

    w.AssetsCatalogHelpers = {
        isNum,
        buildCategories,
        buildRowsAll,
        buildCounts,
        readSymbolsSnapshot,
        computeDelta,
        writeSymbolsSnapshot,
        buildRatesCreditSummary,
    };
})();
