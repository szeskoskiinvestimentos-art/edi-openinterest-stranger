(() => {
    const w = (typeof window !== 'undefined') ? window : null;
    if (!w) return;

    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const pointPct = p => (p && isNum(p.extendedChangePct)) ? p.extendedChangePct : (p && isNum(p.changePct)) ? p.changePct : null;

    const current = (w.MercadoUtils && typeof w.MercadoUtils === 'object') ? w.MercadoUtils : {};
    w.MercadoUtils = { ...current, isNum, pointPct };
})();
