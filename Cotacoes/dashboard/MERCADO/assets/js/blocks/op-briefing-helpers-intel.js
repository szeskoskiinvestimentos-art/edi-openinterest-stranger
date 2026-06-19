function opBriefing_computeConfidence({ regime, combined, newsTilt, agendaIntel, macroWdo, macroWin, priceLead, trendLead, localTapeLead, pulseLead, pulseNow }) {
    const base = regime && typeof regime.convictionScore === 'number' && Number.isFinite(regime.convictionScore)
        ? regime.convictionScore
        : 0.55;
    const conflicts = (combined.wdo.conflict ? 1 : 0) + (combined.win.conflict ? 1 : 0);
    const newsW = newsTilt.wdo.w || 0;
    const newsAdj = newsW >= 4 ? 0.06 : newsW >= 2 ? 0.03 : 0;
    const agendaAdj = (() => {
        const win = Array.isArray(agendaIntel.inWindow) ? agendaIntel.inWindow : [];
        const hasHigh = win.some(x => String(x.impact || '').toUpperCase() === 'ALTO');
        const hasMed = win.some(x => String(x.impact || '').toUpperCase() === 'MÉDIO' || String(x.impact || '').toUpperCase() === 'MEDIO');
        if (hasHigh) return -0.10;
        if (hasMed) return -0.06;
        if (String(agendaIntel.risk || '') === 'alto') return -0.06;
        if (String(agendaIntel.risk || '') === 'médio' || String(agendaIntel.risk || '') === 'medio') return -0.03;
        return 0;
    })();
    const macroAdj = (() => {
        let adj = 0;
        if (macroWdo.bias !== 'neutral' && macroWdo.bias === combined.wdo.bias) adj += 0.03;
        if (macroWin.bias !== 'neutral' && macroWin.bias === combined.win.bias) adj += 0.03;
        if (combined.wdo.conflict || combined.win.conflict) {
            if (macroWdo.bias === 'neutral' && macroWin.bias === 'neutral') adj -= 0.04;
            else adj += 0.00;
        }
        return adj;
    })();
    const priceAdj = priceLead.active ? 0.06 : 0;
    const trendAdj = (!priceLead.active && trendLead.active) ? 0.04 : 0;
    const localTapeAdj = (!priceLead.active && !trendLead.active && localTapeLead.active) ? 0.03 : 0;
    const pulseAdj = (!priceLead.active && !trendLead.active && pulseLead.active) ? 0.05 : 0;
    const alignAdj = (() => {
        if (!pulseNow || !pulseNow.align) return 0;
        let adj = 0;
        const wdo = pulseNow.align.wdo_usdbrl;
        if (wdo && wdo.ok === false) {
            const strong = typeof wdo.a === 'number' && Number.isFinite(wdo.a) && Math.abs(wdo.a) >= 0.12
                && typeof wdo.b === 'number' && Number.isFinite(wdo.b) && Math.abs(wdo.b) >= 0.12;
            if (strong) adj -= 0.06;
        }
        const winIbov = pulseNow.align.win_ibov;
        const winEwz = pulseNow.align.win_ewz;
        const misaligned =
            (winIbov && winIbov.ok === false && typeof winIbov.a === 'number' && typeof winIbov.b === 'number' && Math.abs(winIbov.a) >= 0.10 && Math.abs(winIbov.b) >= 0.10)
            || (winEwz && winEwz.ok === false && typeof winEwz.a === 'number' && typeof winEwz.b === 'number' && Math.abs(winEwz.a) >= 0.10 && Math.abs(winEwz.b) >= 0.10);
        if (misaligned) adj -= 0.05;
        return adj;
    })();
    const out = Math.max(0, Math.min(1, base + newsAdj + agendaAdj + macroAdj + priceAdj + trendAdj + localTapeAdj + pulseAdj + alignAdj - conflicts * 0.10));
    const label = out >= 0.72 ? 'ALTA' : out >= 0.56 ? 'MÉDIA' : 'BAIXA';
    return { score: out, label };
}

function opBriefing_computeAgendaIntel({ dc }) {
    const cache = (typeof agendaAutoCache !== 'undefined' && Array.isArray(agendaAutoCache)) ? agendaAutoCache : null;
    const items = cache
        ? cache
        : (window.ECONOMIC_CALENDAR_DATA && Array.isArray(window.ECONOMIC_CALENDAR_DATA.items) ? window.ECONOMIC_CALENDAR_DATA.items : []);
    if (!dc || typeof dc.analyzeAgenda !== 'function') return { upcoming: [], next: { any: null, high: null, medium: null }, inWindow: [], risk: 'baixo' };
    return dc.analyzeAgenda(items, { now: new Date(), lookaheadMinutes: 240 });
}

function opBriefing_computeAgendaValidation({ dc, data, agendaNext, agendaIfThen, dcDeps, pickFreshestCandidate, rcKey, formatNumber }) {
    if (!dc || !data || !agendaNext) return { score: null, label: '—', detail: '', keys: [] };
    const cur = String(agendaNext.currency || '').toUpperCase();
    const pick = (candidates) => pickFreshestCandidate(candidates);

    const candFor = (k) => {
        const key = String(k || '').toUpperCase();
        if (key === 'DXY') return [{ aliasKey: 'DXY' }, { matcher: /(^\.DXY$|\bDXY\b)/i }];
        if (key === 'US10Y') {
            const sym = rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'US10Y' }, { matcher: /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b)/i }];
        }
        if (key === 'US2Y') {
            const sym = rcKey('US_2Y', /(^US2YT=RR$|\bUS\s*2Y\b)/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'US2Y' }, { matcher: /(^US2YT=RR$|\bUS\s*2Y\b)/i }];
        }
        if (key === 'VIX') return [{ aliasKey: 'VIX9D' }, { aliasKey: 'VIX30' }, { aliasKey: 'VIX' }, { matcher: /^\.?VIX(9D)?$/i }];
        if (key === 'SPX') return [{ aliasKey: 'SPX' }, { matcher: /(^\^GSPC$|\bS&P\s*500\b|^SPX$)/i }];
        if (key === 'HYG') {
            const sym = rcKey('ETF_HYG', /^HYG$/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'HYG' }, { matcher: /^HYG$/i }];
        }
        if (key === 'LQD') {
            const sym = rcKey('ETF_LQD', /^LQD$/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'LQD' }, { matcher: /^LQD$/i }];
        }

        if (key === 'USD_BRL') return [{ aliasKey: 'USD_BRL' }, { matcher: /^USD\/BRL\b/i }];
        if (key === 'BR10Y') {
            const sym = rcKey('BR_10Y', /^BR10YT=RR$/i);
            return sym ? [{ symbol: sym }] : [{ aliasKey: 'BR10Y' }, { matcher: /^BR10YT=RR$/i }];
        }
        if (key === 'IBOV') return [{ aliasKey: 'IBOV' }, { matcher: /(^\.BVSP$|\bIbovespa\b|\bIBOV\b)/i }];
        if (key === 'EWZ') return [{ aliasKey: 'EWZ' }, { matcher: /^EWZ$/i }];

        if (key === 'USD_CNH') return [{ aliasKey: 'USD_CNH' }, { aliasKey: 'USD_CNY' }, { matcher: /^USD\/CNH\b/i }, { matcher: /^USD\/CNY\b/i }];
        if (key === 'IRON') return [{ aliasKey: 'IRON' }, { matcher: /(^DCE_I0$|\bmin[eé]rio\b)/i }];
        if (key === 'COPPER') return [{ aliasKey: 'COPPER' }, { matcher: /(^HG$|HG=F|\bcobre\b)/i }];
        if (key === 'BRENT') return [{ aliasKey: 'BRENT' }, { aliasKey: 'WTI' }, { matcher: /\bBrent\b/i }, { matcher: /\bWTI\b/i }];
        if (key === 'FXI') return [{ aliasKey: 'FXI' }, { matcher: /^FXI$/i }];
        return [];
    };

    const defaultKeys = (() => {
        if (cur === 'USD') return ['DXY', 'US10Y', 'VIX', 'SPX'];
        if (cur === 'BRL') return ['USD_BRL', 'BR10Y', 'IBOV', 'EWZ'];
        if (cur === 'CNY' || cur === 'CNH' || cur === 'HKD') return ['USD_CNH', 'IRON', 'COPPER', 'BRENT', 'FXI'];
        return [];
    })();

    const keys = (agendaIfThen && Array.isArray(agendaIfThen.validators) && agendaIfThen.validators.length)
        ? agendaIfThen.validators.slice(0, 6).map(x => String(x || '').toUpperCase()).filter(Boolean)
        : defaultKeys;

    const syms = keys.map(k => pick(candFor(k))).filter(Boolean);
    if (!syms.length) return { score: null, label: '—', detail: '', keys };
    if (typeof dc.computeCoverage !== 'function') return { score: null, label: '—', detail: '', keys };
    const cov = dc.computeCoverage(dcDeps, data, syms, { staleMs: 6 * 60 * 60 * 1000 });
    if (!cov || !cov.ratios || !cov.counts) return { score: null, label: '—', detail: '', keys };
    const chg = (typeof cov.ratios.change === 'number' && Number.isFinite(cov.ratios.change)) ? cov.ratios.change : null;
    const fr = (typeof cov.ratios.freshness === 'number' && Number.isFinite(cov.ratios.freshness)) ? cov.ratios.freshness : null;
    const score = Math.max(0, Math.min(1, (0.55 * (chg !== null ? chg : 0)) + (0.45 * (fr !== null ? fr : 0))));
    const label = score >= 0.78 ? 'ALTA' : score >= 0.60 ? 'MÉDIA' : 'BAIXA';
    const freshPct = (typeof formatNumber === 'function' && fr !== null)
        ? formatNumber(fr * 100, 0)
        : (fr !== null ? String(Math.round(fr * 100)) : '—');
    const withChg = cov.counts && typeof cov.counts.withChange === 'number' && Number.isFinite(cov.counts.withChange) ? cov.counts.withChange : 0;
    const expected = cov.counts && typeof cov.counts.expected === 'number' && Number.isFinite(cov.counts.expected) ? cov.counts.expected : syms.length;
    const detail = `validadores ${withChg}/${expected} • fresh ${freshPct}%`;
    return { score, label, detail, keys };
}

function opBriefing_computeFallbackRegime({ data, computeFlowScore }) {
    if (!data) return null;
    if (typeof computeFlowScore !== 'function') return null;
    const flow = computeFlowScore(data);
    const label = flow && typeof flow.label === 'string' ? flow.label : 'Neutro';
    const score = flow && typeof flow.score === 'number' && Number.isFinite(flow.score) ? flow.score : 0;
    const operational =
        label === 'Risk-On'
            ? { wdo: 'VENDA', win: 'COMPRA', hint: 'Risk-on tende a WDO↓ / WIN↑ (filtro, não gatilho).' }
            : label === 'Risk-Off'
                ? { wdo: 'COMPRA', win: 'VENDA', hint: 'Risk-off tende a WDO↑ / WIN↓ (filtro, não gatilho).' }
                : { wdo: '—', win: '—', hint: 'Regime indefinido (filtro, não gatilho).' };
    return { label, score, convictionLabel: '—', convictionScore: 0.55, operational, divergences: [], updatedAt: null };
}

function opBriefing_computeNewsTilt({ web }) {
    const items = web && Array.isArray(web.items) ? web.items.slice(0, 8) : [];
    const weight = conf => {
        const c = String(conf || '').toLowerCase();
        if (c.includes('alta')) return 2.0;
        if (c.includes('média') || c.includes('media')) return 1.0;
        if (c.includes('baixa')) return 0.5;
        return 0.75;
    };
    const aScore = a => (a === '↑' ? 1 : a === '↓' ? -1 : 0);
    const sum = { wdo: 0, win: 0, w: 0 };
    for (const it of items) {
        const w = weight(it && it.confidence);
        const impact = it && it.impact ? it.impact : null;
        sum.wdo += w * aScore(impact && impact.wdo ? String(impact.wdo) : '≈');
        sum.win += w * aScore(impact && impact.win ? String(impact.win) : '≈');
        sum.w += w;
    }
    const norm = k => (sum.w > 0 ? sum[k] / sum.w : 0);
    const toBias = v => (v > 0.22 ? 'buy' : v < -0.22 ? 'sell' : 'neutral');
    return {
        wdo: { bias: toBias(norm('wdo')), score: norm('wdo'), w: sum.w },
        win: { bias: toBias(norm('win')), score: norm('win'), w: sum.w },
    };
}

function opBriefing_biasFromLabel(raw) {
    const s = String(raw || '').toUpperCase();
    if (s.includes('COMPRA')) return 'buy';
    if (s.includes('VENDA')) return 'sell';
    return 'neutral';
}

function opBriefing_combineBias(a, b) {
    if (a === 'neutral') return { bias: b, conflict: false };
    if (b === 'neutral') return { bias: a, conflict: false };
    if (a === b) return { bias: a, conflict: false };
    return { bias: 'neutral', conflict: true };
}

function opBriefing_computeMacroBias({ symbol, data, macro, foreignFlow, brFlowSignal, brBreadthSectorSignal, operationalTuning, rcKey, aliasSym, pickBestByMatchers, yieldBp10FromSymbol }) {
    if (!macro) return { bias: 'neutral', score: 0, parts: [] };
    const tuning = operationalTuning || {};
    const neutral = t => String(t || '').toLowerCase().includes('neutro');
    let s = 0;
    let w = 0;
    const parts = [];
    const push = (label, val, wVal) => {
        if (!(typeof val === 'number' && Number.isFinite(val))) return;
        if (!(typeof wVal === 'number' && Number.isFinite(wVal) && wVal > 0)) return;
        s += val * wVal;
        w += wVal;
        if (val !== 0) parts.push({ label: String(label || '—'), val: Number(val) * Number(wVal) });
    };

    if (macro.flow && !neutral(macro.flow.label)) {
        const b = macro.flow.label === 'Risk-On' ? (symbol === 'WDO' ? -1 : +1) : (symbol === 'WDO' ? +1 : -1);
        push(`Flow (${macro.flow.label})`, b, tuning.weight && typeof tuning.weight.flow === 'number' ? tuning.weight.flow : 0);
    }
    if (foreignFlow && foreignFlow.signal && typeof foreignFlow.signal.score === 'number' && Number.isFinite(foreignFlow.signal.score)) {
        const t = tuning.threshold && typeof tuning.threshold.foreignFlow === 'number' ? tuning.threshold.foreignFlow : 0.25;
        const dir = foreignFlow.signal.score > t ? +1 : foreignFlow.signal.score < -t ? -1 : 0;
        const b = symbol === 'WDO' ? -dir : +dir;
        const wFlow = tuning.weight && typeof tuning.weight.foreignFlow === 'number' ? tuning.weight.foreignFlow : 0.22;
        push('Fluxo estrangeiro', b, wFlow);
    }
    if (typeof macro.dxyPct === 'number' && Number.isFinite(macro.dxyPct)) {
        const t = tuning.threshold && typeof tuning.threshold.dxy === 'number' ? tuning.threshold.dxy : 0.12;
        const wDxy = tuning.weight && typeof tuning.weight.dxy === 'number' ? tuning.weight.dxy : 0.18;
        const dir = macro.dxyPct > t ? +1 : macro.dxyPct < -t ? -1 : 0;
        const b = symbol === 'WDO' ? dir : -dir;
        push('DXY', b, wDxy);
    }
    if (typeof macro.exportScore === 'number' && Number.isFinite(macro.exportScore)) {
        const t = tuning.threshold && typeof tuning.threshold.export === 'number' ? tuning.threshold.export : 0.25;
        const wExport = tuning.weight && typeof tuning.weight.export === 'number' ? tuning.weight.export : 0.10;
        const dir = macro.exportScore > t ? +1 : macro.exportScore < -t ? -1 : 0;
        const b = symbol === 'WDO' ? -dir : +dir;
        push('Exportadoras/Commodities', b, wExport);
    }
    if (macro.em && typeof macro.em.pct === 'number' && Number.isFinite(macro.em.pct)) {
        const t = tuning.threshold && typeof tuning.threshold.em === 'number' ? tuning.threshold.em : 0.12;
        const wEm = tuning.weight && typeof tuning.weight.em === 'number' ? tuning.weight.em : 0.12;
        const dir = macro.em.pct > t ? +1 : macro.em.pct < -t ? -1 : 0;
        const b = symbol === 'WDO' ? dir : -dir;
        push('Emergentes (EM)', b, wEm);
    }
    if (brFlowSignal && typeof brFlowSignal.score === 'number' && Number.isFinite(brFlowSignal.score)) {
        const t = tuning.threshold && typeof tuning.threshold.brFlow === 'number' && Number.isFinite(tuning.threshold.brFlow) ? tuning.threshold.brFlow : 0.22;
        const dir = brFlowSignal.score > t ? +1 : brFlowSignal.score < -t ? -1 : 0;
        const b = symbol === 'WDO' ? -dir : +dir;
        const wBr = tuning.weight && typeof tuning.weight.brFlow === 'number' && Number.isFinite(tuning.weight.brFlow) ? tuning.weight.brFlow : 0.28;
        push(`Fluxo global→BR (${brFlowSignal.label})`, b, wBr);
    }
    if (brBreadthSectorSignal && brBreadthSectorSignal.ok) {
        const bScore = brBreadthSectorSignal.breadth && typeof brBreadthSectorSignal.breadth.score === 'number' && Number.isFinite(brBreadthSectorSignal.breadth.score) ? brBreadthSectorSignal.breadth.score : null;
        const sScore = brBreadthSectorSignal.sectors && typeof brBreadthSectorSignal.sectors.score === 'number' && Number.isFinite(brBreadthSectorSignal.sectors.score) ? brBreadthSectorSignal.sectors.score : null;
        const rScore = brBreadthSectorSignal.rotation && typeof brBreadthSectorSignal.rotation.score === 'number' && Number.isFinite(brBreadthSectorSignal.rotation.score) ? brBreadthSectorSignal.rotation.score : null;
        const tBreadth = tuning.threshold && typeof tuning.threshold.brBreadth === 'number' && Number.isFinite(tuning.threshold.brBreadth) ? tuning.threshold.brBreadth : 0.22;
        const tSectors = tuning.threshold && typeof tuning.threshold.brSectors === 'number' && Number.isFinite(tuning.threshold.brSectors) ? tuning.threshold.brSectors : 0.18;
        const wBreadth = tuning.weight && typeof tuning.weight.brBreadth === 'number' && Number.isFinite(tuning.weight.brBreadth) ? tuning.weight.brBreadth : 0.30;
        const wSectors = tuning.weight && typeof tuning.weight.brSectors === 'number' && Number.isFinite(tuning.weight.brSectors) ? tuning.weight.brSectors : 0.32;
        const tRot = tuning.threshold && typeof tuning.threshold.brRotation === 'number' && Number.isFinite(tuning.threshold.brRotation) ? tuning.threshold.brRotation : 0.12;
        const wRot = tuning.weight && typeof tuning.weight.brRotation === 'number' && Number.isFinite(tuning.weight.brRotation) ? tuning.weight.brRotation : 0.22;
        const dirB = (typeof bScore === 'number' && Number.isFinite(bScore)) ? (bScore > tBreadth ? +1 : bScore < -tBreadth ? -1 : 0) : 0;
        const dirS = (typeof sScore === 'number' && Number.isFinite(sScore)) ? (sScore > tSectors ? +1 : sScore < -tSectors ? -1 : 0) : 0;
        const dirR = (typeof rScore === 'number' && Number.isFinite(rScore)) ? (rScore > tRot ? +1 : rScore < -tRot ? -1 : 0) : 0;
        if (dirB) push('Breadth BR (15m)', symbol === 'WDO' ? -dirB : +dirB, wBreadth);
        if (dirS) push('Setores-peso WIN (15m)', symbol === 'WDO' ? -dirS : +dirS, wSectors);
        if (dirR) {
            const b = symbol === 'WDO' ? -dirR : +dirR;
            const label = dirR > 0 ? 'Rotação BR (small>large)' : 'Rotação BR (large>small)';
            push(label, b, wRot);
        }
    }
    if (data) {
        const t = tuning.threshold && typeof tuning.threshold.yields === 'number' && Number.isFinite(tuning.threshold.yields)
            ? tuning.threshold.yields
            : 0.12;
        const wY = tuning.weight && typeof tuning.weight.yields === 'number' ? tuning.weight.yields : 0.12;
        const symUs10 = (typeof rcKey === 'function' ? rcKey('US_10Y', /(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i) : null)
            || (typeof aliasSym === 'function' ? aliasSym('US10Y') : null)
            || (typeof pickBestByMatchers === 'function' ? pickBestByMatchers([/(^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i]) : null);
        const us10 = typeof yieldBp10FromSymbol === 'function' ? yieldBp10FromSymbol(symUs10) : null;
        if (typeof us10 === 'number' && Number.isFinite(us10)) {
            const dir = us10 > t ? +1 : us10 < -t ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push('US10Y (Δbp)', b, wY);
        }

        const symBr10 = (typeof rcKey === 'function' ? rcKey('BR_10Y', /^BR10YT=RR$/i) : null)
            || (typeof aliasSym === 'function' ? aliasSym('BR10Y') : null)
            || (typeof pickBestByMatchers === 'function' ? pickBestByMatchers([/^BR10YT=RR$/i]) : null);
        const br10 = typeof yieldBp10FromSymbol === 'function' ? yieldBp10FromSymbol(symBr10) : null;
        if (typeof br10 === 'number' && Number.isFinite(br10)) {
            const dir = br10 > t ? +1 : br10 < -t ? -1 : 0;
            const b = symbol === 'WDO' ? dir : -dir;
            push('BR10Y (Δbp)', b, wY * 0.8);
        }
    }
    if (macro.zq && typeof macro.zq.slopePct === 'number' && Number.isFinite(macro.zq.slopePct)) {
        const t = tuning.threshold && typeof tuning.threshold.zqSlope === 'number' && Number.isFinite(tuning.threshold.zqSlope)
            ? tuning.threshold.zqSlope
            : 0.08;
        const dir = macro.zq.slopePct > t ? +1 : macro.zq.slopePct < -t ? -1 : 0;
        const b = symbol === 'WDO' ? dir : -dir;
        const wZq = tuning.weight && typeof tuning.weight.zq === 'number' && Number.isFinite(tuning.weight.zq) ? tuning.weight.zq : 0.22;
        push('Curva ZQ (Fed Funds)', b, wZq);
    }
    if (macro.flowSentinel && typeof macro.flowSentinel.composite === 'number' && Number.isFinite(macro.flowSentinel.composite)) {
        const fs = macro.flowSentinel;
        if (!fs.divergence) {
            const t = tuning.threshold && typeof tuning.threshold.flowSentinel === 'number' && Number.isFinite(tuning.threshold.flowSentinel)
                ? tuning.threshold.flowSentinel
                : 0.25;
            const dirUsd = fs.composite < -t ? +1 : fs.composite > t ? -1 : 0;
            const b = symbol === 'WDO' ? dirUsd : -dirUsd;
            const wFs = tuning.weight && typeof tuning.weight.flowSentinel === 'number' && Number.isFinite(tuning.weight.flowSentinel) ? tuning.weight.flowSentinel : 0.18;
            push('Flow Sentinel', b, wFs);
        }
    }
    const score = w > 0 ? s / w : 0;
    const bias = score > 0.22 ? 'buy' : score < -0.22 ? 'sell' : 'neutral';
    return { bias, score, parts };
}

function opBriefing_computeFinalScore({ symbol, newsTilt, macroWdo, macroWin, finalBias, regimeBias }) {
    const nb = symbol === 'WDO' ? newsTilt.wdo.score : newsTilt.win.score;
    const mb = symbol === 'WDO' ? macroWdo.score : macroWin.score;
    const fb = symbol === 'WDO' ? finalBias.WDO : finalBias.WIN;
    const bDir = fb && fb.bias === 'buy' ? 1 : fb && fb.bias === 'sell' ? -1 : 0;
    const src = fb && fb.source ? String(fb.source) : '';
    const clamp = (x) => Math.max(-1, Math.min(1, x));
    if (bDir !== 0 && (src === 'PREÇO' || src === 'TENDÊNCIA' || src === 'FITA_LOCAL' || src === 'PULSO')) {
        const w = src === 'PREÇO' ? 0.9 : src === 'TENDÊNCIA' ? 0.8 : src === 'FITA_LOCAL' ? 0.82 : 0.75;
        return clamp((w * bDir) + (0.15 * nb) + (0.10 * mb));
    }
    const rb = symbol === 'WDO' ? regimeBias.wdo : regimeBias.win;
    const dir = rb === 'buy' ? 1 : rb === 'sell' ? -1 : 0;
    return clamp((0.5 * dir) + (0.4 * nb) + (0.3 * mb));
}

