function opBriefing_computeBrBreadthSectorSignal({ data, aliasSym, pickFreshestCandidate, operationalTuning }) {
    if (!data) return { ok: false };

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const ok = v => typeof v === 'number' && Number.isFinite(v);
    const spot = (symbol) => {
        if (!symbol) return null;
        const pt = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
        const px = pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null;
        return px;
    };

    const vixSym =
        findAliasSymbolBest(data, 'VIX9D') ||
        findAliasSymbolBest(data, 'VIX30') ||
        aliasSym('VIX') ||
        findAssetSymbol(data, /^\.?VIX(9D)?$/i);
    const vxbrSym =
        findAliasSymbolBest(data, 'VXBR') ||
        findAssetSymbol(data, /(^\.VXBR$|\bVXBR\b)/i);

    const vix = spot(vixSym);
    const vxbr = spot(vxbrSym);
    const vixRel = ok(vix) ? clamp(vix / 20, 0.75, 1.4) : null;
    const vxbrRel = ok(vxbr) ? clamp(vxbr / 18, 0.75, 1.5) : null;
    const amp = (vixRel !== null && vxbrRel !== null)
        ? ((vixRel + vxbrRel) / 2)
        : (vixRel !== null ? vixRel : (vxbrRel !== null ? vxbrRel : 1));

    const pickEq = (matchers) => pickFreshestCandidate((matchers || []).map(m => ({ matcher: m })));

    const universe = [
        { key: 'PETR', label: 'Petrobras', weight: 0.14, matchers: [/^PETR4(\.\w+)?$/i, /^PETR3(\.\w+)?$/i, /^PBR(\.\w+)?$/i] },
        { key: 'VALE', label: 'Vale', weight: 0.14, matchers: [/^VALE3(\.\w+)?$/i, /^VALE(\.\w+)?$/i] },
        { key: 'BANKS', label: 'Bancos', weight: 0.20, matchers: [/^ITUB4(\.\w+)?$/i, /^ITUB(\.\w+)?$/i, /^BBDC4(\.\w+)?$/i, /^BBDC(\.\w+)?$/i, /^BBAS3(\.\w+)?$/i] },
        { key: 'B3', label: 'B3', weight: 0.07, matchers: [/^B3SA3(\.\w+)?$/i] },
        { key: 'UTIL', label: 'Eletrobras', weight: 0.07, matchers: [/^ELET3(\.\w+)?$/i, /^ELET6(\.\w+)?$/i] },
        { key: 'BEV', label: 'Ambev', weight: 0.06, matchers: [/^ABEV3(\.\w+)?$/i, /^ABEV(\.\w+)?$/i] },
        { key: 'IND', label: 'WEGE/Embraer', weight: 0.06, matchers: [/^WEGE3(\.\w+)?$/i, /^WEGE(\.\w+)?$/i, /^EMBR3(\.\w+)?$/i, /^ERJ(\.\w+)?$/i] },
        { key: 'STEEL', label: 'Siderurgia', weight: 0.05, matchers: [/^GGBR4(\.\w+)?$/i, /^CSNA3(\.\w+)?$/i, /^SID(\.\w+)?$/i] },
        { key: 'OIL2', label: 'PRIO', weight: 0.05, matchers: [/^PRIO3(\.\w+)?$/i] },
        { key: 'PULP', label: 'Papel & Celulose', weight: 0.05, matchers: [/^SUZB3(\.\w+)?$/i, /^KLBN11(\.\w+)?$/i] },
        { key: 'RETL', label: 'Varejo', weight: 0.05, matchers: [/^RENT3(\.\w+)?$/i, /^LREN3(\.\w+)?$/i] },
        { key: 'MIN', label: 'Mineração (extra)', weight: 0.05, matchers: [/^GOLD(\.\w+)?$/i, /^NEM(\.\w+)?$/i] },
        { key: 'ETF', label: 'EWZ/BOVA11', weight: 0.11, matchers: [/^EWZ(\.\w+)?$/i, /^BOVA11(\.\w+)?$/i, /^\.BVSP$/i] },
    ];

    const resolved = universe
        .map(u => {
            const symbol = pickEq(u.matchers);
            return symbol ? { ...u, symbol } : null;
        })
        .filter(Boolean);

    const th15 = 0.06 / (ok(amp) ? amp : 1);
    const th60 = 0.14 / (ok(amp) ? amp : 1);
    const toDir = (v, t) => (ok(v) ? (v > t ? +1 : v < -t ? -1 : 0) : 0);

    const items = resolved.map(u => {
        const p15 = opBriefing_pctAt(data, u.symbol, 15);
        const p60 = opBriefing_pctAt(data, u.symbol, 60);
        return { ...u, p15: ok(p15) ? p15 : null, p60: ok(p60) ? p60 : null };
    });

    const eff15 = items.filter(x => ok(x.p15));
    const eff60 = items.filter(x => ok(x.p60));
    const n15 = eff15.length;
    const n60 = eff60.length;
    if (!n15 && !n60) return { ok: false };

    const breadthScore = (() => {
        if (!n15) return null;
        const adv = eff15.filter(x => x.p15 > th15).length;
        const dec = eff15.filter(x => x.p15 < -th15).length;
        const score = n15 > 0 ? (adv - dec) / n15 : null;
        return { score: ok(score) ? score : null, adv, dec, n: n15 };
    })();

    const sectorsScore = (() => {
        const list = eff15.length ? eff15 : eff60;
        const n = list.length;
        if (!n) return null;
        const sumW = list.reduce((acc, x) => acc + (x.weight || 0), 0);
        if (!(sumW > 0)) return null;
        const score = list.reduce((acc, x) => {
            const dir = toDir(eff15.length ? x.p15 : x.p60, eff15.length ? th15 : th60);
            return acc + (x.weight * dir);
        }, 0) / sumW;
        return { score: ok(score) ? score : null, n };
    })();

    const rotation = (() => {
        const symLarge = [
            pickEq([/^EWZ(\.\w+)?$/i]),
            pickEq([/^BOVA11(\.\w+)?$/i]),
            pickEq([/^\.BVSP$/i]),
        ].filter(Boolean);
        const symSmall = [
            pickEq([/^EWZS(\.\w+)?$/i]),
            pickEq([/^SMAL11(\.\w+)?$/i]),
        ].filter(Boolean);

        if (!symLarge.length || !symSmall.length) return null;

        const avg = (vals) => {
            const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v));
            return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
        };

        const large15 = avg(symLarge.map(s => opBriefing_pctAt(data, s, 15)));
        const small15 = avg(symSmall.map(s => opBriefing_pctAt(data, s, 15)));
        const large60 = avg(symLarge.map(s => opBriefing_pctAt(data, s, 60)));
        const small60 = avg(symSmall.map(s => opBriefing_pctAt(data, s, 60)));

        const use15 = ok(large15) && ok(small15);
        const use60 = ok(large60) && ok(small60);
        if (!use15 && !use60) return null;

        const diff = use15 ? (small15 - large15) : (small60 - large60);
        const tuning = operationalTuning && typeof operationalTuning === 'object' ? operationalTuning : {};
        const thCfg = tuning.threshold && typeof tuning.threshold === 'object' ? tuning.threshold : {};
        const baseTh = typeof thCfg.brRotation === 'number' && Number.isFinite(thCfg.brRotation) ? thCfg.brRotation : 0.12;
        const th = baseTh / (ok(amp) ? amp : 1);
        const dir = diff > th ? +1 : diff < -th ? -1 : 0;
        const label = dir > 0 ? 'SMALL> LARGE' : dir < 0 ? 'LARGE> SMALL' : 'MISTO';
        const used = { large: symLarge.slice(0, 2), small: symSmall.slice(0, 2), window: use15 ? '15m' : '60m' };
        return { score: ok(diff) ? diff : null, dir, label, used };
    })();

    const labelFrom = (score) => {
        if (!ok(score)) return 'MISTO';
        const tuning = operationalTuning && typeof operationalTuning === 'object' ? operationalTuning : {};
        const thCfg = tuning.threshold && typeof tuning.threshold === 'object' ? tuning.threshold : {};
        const t = typeof thCfg.brBreadth === 'number' && Number.isFinite(thCfg.brBreadth) ? thCfg.brBreadth : 0.22;
        if (score >= t) return 'RISK-ON';
        if (score <= -t) return 'RISK-OFF';
        return 'MISTO';
    };

    const tuning = operationalTuning && typeof operationalTuning === 'object' ? operationalTuning : {};
    const thCfg = tuning.threshold && typeof tuning.threshold === 'object' ? tuning.threshold : {};
    const tBreadth = typeof thCfg.brBreadth === 'number' && Number.isFinite(thCfg.brBreadth) ? thCfg.brBreadth : 0.22;
    const tSectors = typeof thCfg.brSectors === 'number' && Number.isFinite(thCfg.brSectors) ? thCfg.brSectors : 0.18;
    const bScore = breadthScore && ok(breadthScore.score) ? breadthScore.score : null;
    const sScore = sectorsScore && ok(sectorsScore.score) ? sectorsScore.score : null;
    const tRot = typeof thCfg.brRotation === 'number' && Number.isFinite(thCfg.brRotation) ? thCfg.brRotation : 0.12;
    const rotScore = rotation && ok(rotation.score) ? rotation.score : null;
    const rotStrongOn = (ok(rotScore) && rotScore >= Math.max(0.18, (tRot * 1.4) / (ok(amp) ? amp : 1)));
    const rotStrongOff = (ok(rotScore) && rotScore <= -Math.max(0.18, (tRot * 1.4) / (ok(amp) ? amp : 1)));
    const strongRiskOff = rotStrongOff || (ok(bScore) && bScore <= -Math.max(0.35, tBreadth * 1.4)) || (ok(sScore) && sScore <= -Math.max(0.30, tSectors * 1.4));
    const strongRiskOn = rotStrongOn || (ok(bScore) && bScore >= Math.max(0.35, tBreadth * 1.4)) || (ok(sScore) && sScore >= Math.max(0.30, tSectors * 1.4));

    const detail = (() => {
        const bits = [];
        if (breadthScore && ok(breadthScore.score)) bits.push(`Breadth15m ${(breadthScore.score * 100) > 0 ? '+' : ''}${formatNumber(breadthScore.score * 100, 0)} (${breadthScore.adv}↑/${breadthScore.dec}↓ n=${breadthScore.n})`);
        if (sectorsScore && ok(sectorsScore.score)) bits.push(`Setores15m ${(sectorsScore.score * 100) > 0 ? '+' : ''}${formatNumber(sectorsScore.score * 100, 0)} (n=${sectorsScore.n})`);
        if (rotation && ok(rotation.score)) bits.push(`Rotação ${rotation.label} (${rotation.used.window}) ${(rotation.score) > 0 ? '+' : ''}${formatNumber(rotation.score, 2)}pp`);
        if (ok(amp) && (ok(vix) || ok(vxbr))) bits.push(`volAmp ${formatNumber(amp, 2)}`);
        return bits.join(' • ');
    })();

    return {
        ok: true,
        amp: ok(amp) ? amp : 1,
        breadth: breadthScore ? breadthScore : null,
        sectors: sectorsScore ? sectorsScore : null,
        rotation,
        breadthLabel: labelFrom(bScore),
        sectorsLabel: (() => {
            if (!ok(sScore)) return 'MISTO';
            if (sScore >= tSectors) return 'RISK-ON';
            if (sScore <= -tSectors) return 'RISK-OFF';
            return 'MISTO';
        })(),
        strongRiskOff,
        strongRiskOn,
        detail,
    };
}

