(() => {
    const w = (typeof window !== 'undefined') ? window : null;
    if (!w) return;

    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const pointPct = p => {
        if (!p) return null;
        const regular = isNum(p.changePct) ? p.changePct : null;
        if (regular !== null) {
            if (Math.abs(regular) > 50) return null;
            return regular;
        }
        const extended = isNum(p.extendedChangePct) ? p.extendedChangePct : null;
        if (extended === null) return null;
        if (Math.abs(extended) > 50) return null;
        return extended;
    };

    const current = (w.MercadoUtils && typeof w.MercadoUtils === 'object') ? w.MercadoUtils : {};
    w.MercadoUtils = { ...current, isNum, pointPct };
})();
