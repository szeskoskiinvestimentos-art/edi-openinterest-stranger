function opBriefing_ymdToBr(ymd) {
    const s = String(ymd || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '—';
    return `${s.slice(8, 10)}/${s.slice(5, 7)}`;
}

function opBriefing_computeForeignFlowPart({
    foreignFlow,
    operationalTuning,
    data,
    rcKey,
    aliasSym,
    pickBestByMatchers,
    yieldBp10FromSymbol,
    findAliasSymbolBest,
    findAssetSymbol,
    getChangePct,
    formatBrlCompact,
    formatDateTime,
}) {
    if (!foreignFlow || !foreignFlow.derived || !foreignFlow.derived.foreigners) return 'Fluxo estrangeiro: —';
    const cum5 = foreignFlow.derived.foreigners.cum5;
    const last = foreignFlow.latest && typeof foreignFlow.latest.foreigners === 'number' ? foreignFlow.latest.foreigners : null;
    const lastDate = foreignFlow.latest && foreignFlow.latest.date ? opBriefing_ymdToBr(foreignFlow.latest.date) : '—';
    const t = operationalTuning && operationalTuning.threshold && typeof operationalTuning.threshold.foreignFlow === 'number' ? operationalTuning.threshold.foreignFlow : 0.25;
    const score = foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score) ? foreignFlow.signal.score : 0;
    const abs = Math.abs(score);
    const dir = score > t ? 'ENTRANDO' : score < -t ? 'SAINDO' : 'NEUTRO';
    const strength = abs >= Math.max(0.5, t * 2) ? 'FORTE' : abs >= t ? 'DIRECIONAL' : 'NEUTRO';
    const diverge =
        typeof last === 'number'
            ? Math.sign(last) !== 0 && Math.sign(cum5) !== 0 && Math.sign(last) !== Math.sign(cum5)
            : false;
    const alert = dir === 'NEUTRO'
        ? null
        : `${strength} ${dir}${diverge ? ' • divergência no último dia' : ''}`;

    const hypothesis = (() => {
        if (!data) return null;
        if (dir === 'NEUTRO') return null;
        if (typeof getChangePct !== 'function') return null;

        const symUsd = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'USD_BRL') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^USD\/BRL\b/i) : null);
        const symIbov = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'IBOV') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /(^\.BVSP$|\bIbovespa\b|\bIBOV\b)/i) : null);
        const symEwz = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'EWZ') : null) || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^EWZ$/i) : null);
        const symBr10y =
            (typeof rcKey === 'function' ? rcKey('BR_10Y', /^BR10YT=RR$/i) : null)
            || (typeof aliasSym === 'function' ? aliasSym('BR10Y') : null)
            || (typeof pickBestByMatchers === 'function' ? pickBestByMatchers([/^BR10YT=RR$/i]) : null);
        const usd = symUsd ? getChangePct(data, symUsd) : null;
        const ibov = symIbov ? getChangePct(data, symIbov) : null;
        const ewz = symEwz ? getChangePct(data, symEwz) : null;
        const br10y = (symBr10y && typeof yieldBp10FromSymbol === 'function') ? yieldBp10FromSymbol(symBr10y) : null;

        const hasUsd = typeof usd === 'number' && Number.isFinite(usd);
        const hasIbov = typeof ibov === 'number' && Number.isFinite(ibov);
        const hasEwz = typeof ewz === 'number' && Number.isFinite(ewz);
        const hasBr10y = typeof br10y === 'number' && Number.isFinite(br10y);
        const eq = (() => {
            const xs = [];
            if (hasIbov) xs.push(ibov);
            if (hasEwz) xs.push(ewz);
            return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
        })();
        const hasEq = typeof eq === 'number' && Number.isFinite(eq);

        const brlStronger = hasUsd && usd < -0.25;
        const brlWeaker = hasUsd && usd > 0.25;
        const eqUp = hasEq && eq > 0.25;
        const eqDown = hasEq && eq < -0.25;
        const yieldsDown = hasBr10y && br10y < -0.35;
        const yieldsUp = hasBr10y && br10y > 0.35;

        let label = null;
        if (dir === 'ENTRANDO') {
            if (brlStronger && yieldsDown && !eqUp) label = 'Hipótese: entrada via juros/títulos (carry)';
            else if (brlStronger && eqUp) label = 'Hipótese: entrada via ações/índice (risk-on local)';
            else if (brlWeaker) label = 'Hipótese: fluxo com hedge (derivativos) ou compra de USD';
            else label = 'Hipótese: entrada para caixa/espera (ainda sem confirmação em preço)';
        } else if (dir === 'SAINDO') {
            if (brlWeaker && eqDown) label = 'Hipótese: saída de risco (equities) + pressão em FX';
            else if (yieldsUp && brlWeaker) label = 'Hipótese: desmonte de carry/juros + FX';
            else label = 'Hipótese: saída parcial (sem confirmação clara em preço)';
        }

        const confirms = [brlStronger || brlWeaker, eqUp || eqDown, yieldsDown || yieldsUp].filter(Boolean).length;
        const available = [hasUsd, hasEq, hasBr10y].filter(Boolean).length;
        const conf = available >= 2 ? (confirms >= 2 ? 'alta' : confirms === 1 ? 'média' : 'baixa') : 'baixa';
        return label ? `${label} • confiança ${conf}` : null;
    })();

    const bits = [
        `Fluxo estrangeiro (5 dias úteis até ${lastDate}) ${typeof formatBrlCompact === 'function' ? formatBrlCompact(cum5, 2) : String(cum5)}`,
        `Último dia divulgado (${lastDate}) ${typeof formatBrlCompact === 'function' ? formatBrlCompact(last, 2) : String(last)}`,
        foreignFlow && foreignFlow.source && foreignFlow.source.updatedAtText ? `Fonte ${String(foreignFlow.source.updatedAtText)}` : null,
        foreignFlow.generatedAt && typeof formatDateTime === 'function' ? `Coletado ${formatDateTime(String(foreignFlow.generatedAt))}` : null,
        alert ? `ALERTA: ${alert}` : null,
        hypothesis,
    ].filter(Boolean);
    return bits.join(' • ');
}

function opBriefing_computeMacroCorrPart({ macro, formatNumber }) {
    const c = macro && macro.em && macro.em.corrUsdBrlEmBasket ? macro.em.corrUsdBrlEmBasket : null;
    if (!c || typeof c.corr !== 'number' || !Number.isFinite(c.corr)) return null;
    const n = typeof c.n === 'number' && Number.isFinite(c.n) && c.n > 0 ? Math.floor(c.n) : 0;
    const fmt = typeof formatNumber === 'function' ? formatNumber(c.corr, 2) : String(c.corr);
    return `Corr BRL×EM ${fmt}${n ? ` (n=${String(n)})` : ''}`;
}

function opBriefing_computeMacroExtras({
    data,
    macro,
    rcKey,
    aliasSym,
    pickBestByMatchers,
    yieldBp10FromSymbol,
    findAliasSymbolBest,
    findAliasSymbol,
    findAssetSymbol,
    getChangePct,
    formatNumber,
    formatPercent,
}) {
    if (!data) return '';
    const parts = [];
    const fmtNum = (n, d) => (typeof formatNumber === 'function' ? formatNumber(n, d) : String(n));

    const symUs10 = (typeof rcKey === 'function' ? rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i) : null)
        || (typeof aliasSym === 'function' ? aliasSym('US10Y') : null)
        || (typeof pickBestByMatchers === 'function' ? pickBestByMatchers([/(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i]) : null);
    const us10 = typeof yieldBp10FromSymbol === 'function' ? yieldBp10FromSymbol(symUs10) : null;
    if (typeof us10 === 'number' && Number.isFinite(us10)) parts.push(`US10Y Δ ${(us10 * 10) > 0 ? '+' : ''}${fmtNum(us10 * 10, 1)}bp`);

    const symBr10 = (typeof rcKey === 'function' ? rcKey('BR_10Y', /^BR10YT=RR$/i) : null)
        || (typeof aliasSym === 'function' ? aliasSym('BR10Y') : null)
        || (typeof pickBestByMatchers === 'function' ? pickBestByMatchers([/^BR10YT=RR$/i]) : null);
    const br10 = typeof yieldBp10FromSymbol === 'function' ? yieldBp10FromSymbol(symBr10) : null;
    if (typeof br10 === 'number' && Number.isFinite(br10)) parts.push(`BR10Y Δ ${(br10 * 10) > 0 ? '+' : ''}${fmtNum(br10 * 10, 1)}bp`);

    const zq = macro && macro.zq ? macro.zq : null;
    if (zq && typeof zq.slopePct === 'number' && Number.isFinite(zq.slopePct)) {
        const rm = zq.riskMode ? String(zq.riskMode) : '';
        parts.push(`FedFunds ZQ ${rm ? `${rm} ` : ''}slope ${fmtNum(zq.slopePct, 2)}%`);
    }

    const fs = macro && macro.flowSentinel ? macro.flowSentinel : null;
    if (fs && typeof fs.composite === 'number' && Number.isFinite(fs.composite)) {
        const lab = fs.label ? String(fs.label) : '';
        const riskScore = fs.risk && typeof fs.risk.score === 'number' && Number.isFinite(fs.risk.score) ? fs.risk.score : null;
        const protScore = fs.protection && typeof fs.protection.score === 'number' && Number.isFinite(fs.protection.score) ? fs.protection.score : null;
        const bits = [
            `FlowSentinel ${lab ? `${lab} ` : ''}${fmtNum(fs.composite, 3)}`,
            (typeof fs.delta === 'number' && Number.isFinite(fs.delta)) ? `Δ ${fmtNum(fs.delta, 3)}` : null,
            riskScore !== null ? `Risco ${fmtNum(riskScore, 3)}` : null,
            protScore !== null ? `Prot ${fmtNum(protScore, 3)}` : null,
            fs.divergence ? 'DIVERGENTE' : null,
        ].filter(Boolean);
        parts.push(bits.join(' • '));
    }

    const mkPct = (label, symbol, futRe, suffix) => {
        if (!symbol || typeof getChangePct !== 'function' || typeof formatPercent !== 'function') return;
        const pct = getChangePct(data, symbol);
        if (typeof pct !== 'number' || !Number.isFinite(pct)) return;
        const isFut = futRe ? futRe.test(String(symbol || '')) : false;
        parts.push(`${label}${isFut ? suffix : ''} ${formatPercent(pct, 2)}`);
    };

    const symSpx = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'SPX') : null) || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'SPX') : null);
    mkPct('S&P500', symSpx, /^ES[HMUZ]\d{2}$/i, ' (fut)');

    const symNdx = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'NDX') : null) || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'NDX') : null);
    mkPct('Nasdaq100', symNdx, /^NQ[HMUZ]\d{2}$/i, ' (fut)');

    const symIbov =
        (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'WIN') : null)
        || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'IBOV') : null)
        || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'IBOV') : null);
    mkPct('Ibovespa', symIbov, /^WINc\d$/i, ' (fut)');

    const symBr20 = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'BR20') : null) || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'BR20') : null);
    mkPct('BR20', symBr20);

    const symUsdBrl =
        (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'WDO') : null)
        || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'USD_BRL') : null);
    mkPct('USD/BRL', symUsdBrl, /^WDOc\d$/i, ' (fut)');

    const symEwz =
        (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'EWZ') : null)
        || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'EWZ') : null)
        || (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^EWZS(\.\w+)?$/i) : null);
    if (symEwz && typeof getChangePct === 'function' && typeof formatPercent === 'function') {
        const ewzPct = getChangePct(data, symEwz);
        if (typeof ewzPct === 'number' && Number.isFinite(ewzPct)) {
            const isSmall = /^EWZS(\.\w+)?$/i.test(String(symEwz || ''));
            parts.push(`Brasil${isSmall ? ' (small caps)' : ''} ${formatPercent(ewzPct, 2)}`);
        }
    }

    const symVix =
        (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'VIX9D') : null) ||
        (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'VIX30') : null) ||
        (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'VIX') : null) ||
        (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, 'VIX') : null) ||
        (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^\.?VIX(9D)?$/i) : null);
    if (symVix && typeof getChangePct === 'function' && typeof formatPercent === 'function') {
        const vixPct = getChangePct(data, symVix);
        if (typeof vixPct === 'number' && Number.isFinite(vixPct)) {
            const label = String(symVix).toUpperCase().includes('VIX9D') ? 'VIX9D' : 'VIX';
            parts.push(`Vol ${label} ${formatPercent(vixPct, 2)}`);
        }
    }

    return parts.length ? ` • ${parts.join(' • ')}` : '';
}

function opBriefing_computeMacroLine({
    foreignFlow,
    operationalTuning,
    data,
    rcKey,
    aliasSym,
    pickBestByMatchers,
    yieldBp10FromSymbol,
    findAliasSymbolBest,
    findAliasSymbol,
    findAssetSymbol,
    getChangePct,
    formatBrlCompact,
    formatDateTime,
    macro,
    formatNumber,
    formatPercent,
    brFlowSignal,
    cdsSignal,
}) {
    const foreignPart = opBriefing_computeForeignFlowPart({
        foreignFlow,
        operationalTuning,
        data,
        rcKey,
        aliasSym,
        pickBestByMatchers,
        yieldBp10FromSymbol,
        findAliasSymbolBest,
        findAssetSymbol,
        getChangePct,
        formatBrlCompact,
        formatDateTime,
    });

    if (!macro) return foreignPart;
    const corrPart = opBriefing_computeMacroCorrPart({ macro, formatNumber });
    const extras = opBriefing_computeMacroExtras({
        data,
        macro,
        rcKey,
        aliasSym,
        pickBestByMatchers,
        yieldBp10FromSymbol,
        findAliasSymbolBest,
        findAliasSymbol,
        findAssetSymbol,
        getChangePct,
        formatNumber,
        formatPercent,
    });
    const brFlowPart = (brFlowSignal && typeof brFlowSignal.score === 'number' && Number.isFinite(brFlowSignal.score))
        ? `Fluxo→BR ${brFlowSignal.label} (${formatNumber(brFlowSignal.score, 2)}${brFlowSignal.detail ? ` • ${brFlowSignal.detail}` : ''})`
        : 'Fluxo→BR: —';
    const cdsPart = cdsSignal
        ? (() => {
            const drv = cdsSignal && cdsSignal.drivers && typeof cdsSignal.drivers === 'object' ? cdsSignal.drivers : null;
            const cdsPct = drv && typeof drv.cds === 'number' && Number.isFinite(drv.cds) ? drv.cds : null;
            const mode = cdsSignal && cdsSignal.mode ? String(cdsSignal.mode) : 'neutral';
            const modeLabel = mode === 'hedge_on_risk_on' ? 'Hedge-on' : mode === 'risk_off_classic' ? 'Risk-off' : mode === 'relief_risk_on' ? 'Alívio' : 'Leitura';
            return ` • CDS ${cdsPct !== null ? formatPercent(cdsPct, 2) : '—'} (${modeLabel})`;
        })()
        : '';

    return `Flow ${String(macro.flow ? macro.flow.label : '—')} • ${foreignPart} • ${brFlowPart} • DXY ${typeof macro.dxyPct === 'number' ? formatPercent(macro.dxyPct, 2) : '—'} • Export ${typeof macro.exportScore === 'number' ? formatPercent(macro.exportScore, 2) : '—'} • EM ${typeof (macro.em && macro.em.pct) === 'number' ? formatPercent(macro.em.pct, 2) : '—'}${corrPart ? ` • ${corrPart}` : ''}${extras}${cdsPart}`;
}
