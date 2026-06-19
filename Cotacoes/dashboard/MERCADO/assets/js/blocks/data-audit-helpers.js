(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

    const fmtAge = (ms) => {
        const msAge = typeof ms === 'number' && Number.isFinite(ms) ? ms : null;
        if (msAge === null || msAge < 0) return '—';
        const m = Math.floor(msAge / 60000);
        const h = Math.floor(m / 60);
        const mm = m - h * 60;
        return h > 0 ? `${h}h${String(mm).padStart(2, '0')}` : `${m}m`;
    };

    const defaultCritical = () => ([
        { label: 'USD/BRL', r: /^USD\/BRL\b/i },
        { label: 'WDO', r: /^WDO/i },
        { label: 'WIN', r: /^WIN/i },
        { label: 'IBOV', r: /(^\.BVSP$|\bIbovespa\b)/i },
        { label: 'EWZ', r: /^EWZ$/i },
        { label: 'BOVA11', r: /^BOVA11\.SA$/i },
        { label: 'DXY', r: /(^\.DXY$|\bDXY\b|^USDX$|DX-Y\.NYB)/i },
        { label: 'Brent', r: /\bBrent\b/i },
        { label: 'WTI', r: /\bWTI\b/i },
        { label: 'FXI', r: /^FXI$/i },
        { label: 'CSI300', r: /^\.(CSI300)\b/i },
        { label: 'Minério', r: /^TIOc1$|^SM58Fc1$/i },
        { label: 'Soja', r: /^ZS$/i },
        { label: 'BR10Y', r: /^BR10YT=RR$/i },
    ]);

    const computeAudit = ({ data, getLastPoint, findAssetSymbol, staleMs, operationalInputs } = {}) => {
        const d = data || null;
        const assets = (d && Array.isArray(d.assets)) ? d.assets : [];
        const nowMs = Date.now();
        const staleWindow = isNum(staleMs) ? staleMs : 6 * 60 * 60 * 1000;
        const lastOf = typeof getLastPoint === 'function' ? getLastPoint : (() => null);

        const rows = assets.map(a => {
            const symbol = a && a.symbol ? String(a.symbol) : '';
            return { a, symbol, last: lastOf(d, symbol) };
        });
        const withPrice = rows.filter(x => x.last && typeof x.last.price === 'number');
        const missing = rows.filter(x => !(x.last && typeof x.last.price === 'number'));
        const withTime = withPrice
            .map(x => {
                const t = x.last && x.last.t ? Date.parse(String(x.last.t)) : NaN;
                return { ...x, tMs: Number.isFinite(t) ? t : null };
            })
            .filter(x => x.tMs !== null);
        const fresh = withTime.filter(x => nowMs - x.tMs <= staleWindow);
        const stale = withTime
            .filter(x => nowMs - x.tMs > staleWindow)
            .map(x => ({ ...x, ageMs: nowMs - x.tMs }))
            .sort((a, b) => b.ageMs - a.ageMs)
            .slice(0, 12);

        const crit = defaultCritical().map(x => {
            const found = !!(typeof findAssetSymbol === 'function' ? findAssetSymbol(d, x.r) : null);
            return { ...x, found };
        });

        const inputs = operationalInputs && typeof operationalInputs === 'object' ? operationalInputs : {};
        const modules = [
            { key: 'macro', label: 'Macro', value: inputs.macro || null, ts: inputs.macro && (inputs.macro.updatedAt || inputs.macro.generatedAt) ? String(inputs.macro.updatedAt || inputs.macro.generatedAt) : null },
            { key: 'optionsGamma', label: 'Opções/Gamma', value: inputs.optionsGamma || null, ts: inputs.optionsGamma && inputs.optionsGamma.generatedAt ? String(inputs.optionsGamma.generatedAt) : null },
            { key: 'webNews', label: 'Web News', value: inputs.webNews || null, ts: inputs.webNews && inputs.webNews.generatedAt ? String(inputs.webNews.generatedAt) : null },
            { key: 'foreignFlow', label: 'Foreign Flow', value: inputs.foreignFlow || null, ts: inputs.foreignFlow && inputs.foreignFlow.generatedAt ? String(inputs.foreignFlow.generatedAt) : null },
            { key: 'focusSummary', label: 'Focus', value: inputs.focusSummary || null, ts: inputs.focusSummary && inputs.focusSummary.generatedAt ? String(inputs.focusSummary.generatedAt) : null },
        ];
        const moduleAudit = modules.map(m => {
            const ms = m.ts ? Date.parse(m.ts) : NaN;
            const ageMs = Number.isFinite(ms) ? Math.max(0, nowMs - ms) : null;
            const present = !!m.value;
            const stale = present && ageMs !== null ? ageMs > staleWindow : present ? false : true;
            return { ...m, present, stale, ageMs };
        });

        return {
            assets,
            rows,
            withPrice,
            missing,
            withTime,
            fresh,
            stale,
            critical: crit,
            modules: moduleAudit,
            staleMs: staleWindow,
            nowMs,
        };
    };

    w.DataAuditHelpers = { computeAudit, fmtAge, defaultCritical };
})();
