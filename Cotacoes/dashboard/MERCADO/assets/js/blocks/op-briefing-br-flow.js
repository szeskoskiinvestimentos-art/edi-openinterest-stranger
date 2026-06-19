function opBriefing_computeBrFlowSignal({ data, dc, dcDeps, nowMs, aliasSym, pickBestByMatchers, rcKey, yieldBp10FromSymbol, foreignFlow, macro, operationalTuning }) {
    if (!data) return { score: null, label: '—', confidence: null, detail: '', drivers: [] };

    const symUsdBrl = aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]);
    const symDxy = aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i]);
    const symVix = findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]);
    const symUs10 = rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i) || aliasSym('US10Y') || pickBestByMatchers([/(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i]);
    const symBr10 = rcKey('BR_10Y', /^BR10YT=RR$/i) || aliasSym('BR10Y') || pickBestByMatchers([/^BR10YT=RR$/i]);
    const symHyg = rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || aliasSym('HYG') || pickBestByMatchers([/^HYG(\.\w+)?$/i]);
    const symEem = aliasSym('EEM') || pickBestByMatchers([/^EEM(\.\w+)?$/i, /^VWO(\.\w+)?$/i]);
    const symCds = rcKey('CDS_BR_5Y', /^BRGV5YUSAC=R$/i) || aliasSym('CDS_BR5Y') || pickBestByMatchers([/^BRGV5YUSAC=R$/i, /^BRGV/i]);

    const pct = (s) => {
        const v = s ? getChangePct(data, s) : null;
        return typeof v === 'number' && Number.isFinite(v) ? v : null;
    };
    const usdPct = pct(symUsdBrl);
    const dxyPct = pct(symDxy);
    const vixPct = pct(symVix);
    const hygPct = pct(symHyg);
    const eemPct = pct(symEem);
    const cdsPct = pct(symCds);
    const us10Bp10 = yieldBp10FromSymbol(symUs10);
    const br10Bp10 = yieldBp10FromSymbol(symBr10);
    const emPct = (macro && macro.em && typeof macro.em.pct === 'number' && Number.isFinite(macro.em.pct)) ? macro.em.pct : eemPct;
    const exportScore = (macro && typeof macro.exportScore === 'number' && Number.isFinite(macro.exportScore)) ? macro.exportScore : null;
    const flowScore = (foreignFlow && foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score)) ? foreignFlow.signal.score : null;

    const toDir = (v, t) => {
        if (!(typeof v === 'number' && Number.isFinite(v))) return 0;
        if (v > t) return +1;
        if (v < -t) return -1;
        return 0;
    };
    const tFx = 0.12;
    const tVol = 0.25;
    const tCredit = 0.18;
    const tuning = operationalTuning && typeof operationalTuning === 'object' ? operationalTuning : {};
    const th = tuning.threshold && typeof tuning.threshold === 'object' ? tuning.threshold : {};
    const tRates = typeof th.yields === 'number' && Number.isFinite(th.yields) ? th.yields : 0.12;
    const tEm = typeof th.em === 'number' && Number.isFinite(th.em) ? th.em : 0.12;
    const tExport = typeof th.export === 'number' && Number.isFinite(th.export) ? th.export : 0.25;
    const tFlow = typeof th.foreignFlow === 'number' && Number.isFinite(th.foreignFlow) ? th.foreignFlow : 0.25;

    const parts = [];
    const push = (label, dir, w) => {
        if (!dir || !(w > 0)) return;
        parts.push({ label, dir, w });
    };
    push('DXY (↓)', toDir(dxyPct !== null ? -dxyPct : null, tFx), 0.18);
    push('VIX (↓)', toDir(vixPct !== null ? -vixPct : null, tVol), 0.12);
    push('US10Y (Δbp ↓)', toDir(us10Bp10 !== null ? -us10Bp10 : null, tRates), 0.12);
    push('BR10Y (Δbp ↓)', toDir(br10Bp10 !== null ? -br10Bp10 : null, tRates), 0.10);
    push('HYG (↑)', toDir(hygPct, tCredit), 0.10);
    push('EM (↑)', toDir(emPct, tEm), 0.12);
    push('Export Basket (↑)', toDir(exportScore, tExport), 0.10);
    push('USD/BRL (↓)', toDir(usdPct !== null ? -usdPct : null, tFx), 0.10);
    push('Fluxo estrangeiro (↑)', toDir(flowScore, tFlow), 0.06);
    push('CDS BR (↓)', toDir(cdsPct !== null ? -cdsPct : null, 0.12), 0.06);

    const wSum = parts.reduce((acc, p) => acc + p.w, 0);
    const score = wSum > 0 ? parts.reduce((acc, p) => acc + (p.dir * p.w), 0) / wSum : null;

    const cov = (dc && typeof dc.computeCoverage === 'function')
        ? dc.computeCoverage(dcDeps, data, [symUsdBrl, symDxy, symVix, symUs10, symBr10, symHyg, symEem].filter(Boolean), { nowMs, staleMs: 6 * 60 * 60 * 1000 })
        : null;
    const confidence = cov
        ? Math.max(0, Math.min(1, (0.55 * cov.ratios.change) + (0.45 * cov.ratios.freshness)))
        : null;

    const label = (() => {
        if (!(typeof score === 'number' && Number.isFinite(score))) return '—';
        const abs = Math.abs(score);
        const conf = typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : 0.5;
        if (abs >= 0.55 && conf >= 0.72) return score > 0 ? 'ENTRADA FORTE' : 'SAÍDA FORTE';
        if (abs >= 0.38 && conf >= 0.62) return score > 0 ? 'ENTRADA' : 'SAÍDA';
        return 'MISTO';
    })();

    const detail = cov
        ? `validadores ${cov.counts.withChange}/${cov.counts.expected} • fresh ${formatNumber(cov.ratios.freshness * 100, 0)}%`
        : '';

    const drivers = parts
        .slice()
        .sort((a, b) => (b.w - a.w))
        .slice(0, 6)
        .map(p => p.label);

    return { score: (typeof score === 'number' && Number.isFinite(score)) ? score : null, label, confidence, detail, drivers };
}
