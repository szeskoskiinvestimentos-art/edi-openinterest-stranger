function opBriefing_computeAuditLineHtml({
    data,
    regime,
    rawOptions,
    rawWeb,
    rawForeign,
    rawFocus,
    macro,
    badge,
}) {
    const now = Date.now();
    const staleMs = 15 * 60 * 1000;
    const ageText = (t) => {
        const ms = t ? Date.parse(String(t)) : NaN;
        if (!Number.isFinite(ms)) return '—';
        const age = now - ms;
        if (!Number.isFinite(age) || age < 0) return '—';
        const m = Math.round(age / 60000);
        if (m < 60) return `${m}m`;
        const h = Math.round(m / 60);
        return `${h}h`;
    };
    const toneFromAge = (t) => {
        const ms = t ? Date.parse(String(t)) : NaN;
        if (!Number.isFinite(ms)) return 'neutral';
        const age = now - ms;
        if (!Number.isFinite(age) || age < 0) return 'neutral';
        if (age <= staleMs) return 'positive';
        return 'neutral';
    };
    const pickTs = (x) => {
        if (!x) return null;
        if (x.generatedAt) return x.generatedAt;
        if (x.source && x.source.updatedAt) return x.source.updatedAt;
        if (x.source && x.source.publishedAt) return x.source.publishedAt;
        return null;
    };
    const quotesTs =
        data && data.meta && (data.meta.generatedAt || data.meta.portfolioUpdatedAt)
            ? String(data.meta.generatedAt || data.meta.portfolioUpdatedAt)
            : null;
    const optTs = pickTs(rawOptions);
    const webTs = pickTs(rawWeb);
    const flowTs = pickTs(rawForeign);
    const focusTs = pickTs(rawFocus);
    const zqTs = macro && macro.zq && macro.zq.generatedAt ? macro.zq.generatedAt : null;

    const bits = [
        badge(toneFromAge(quotesTs), `Quotes ${ageText(quotesTs)}`),
        badge(regime ? 'neutral' : 'negative', `Regime ${regime ? 'OK' : '—'}`),
        badge(rawOptions && rawOptions.ok === true ? toneFromAge(optTs) : 'neutral', `Opções ${rawOptions && rawOptions.ok === true ? ageText(optTs) : '—'}`),
        badge(rawWeb && rawWeb.ok === true ? toneFromAge(webTs) : 'neutral', `News ${rawWeb && rawWeb.ok === true ? ageText(webTs) : '—'}`),
        badge(rawForeign && rawForeign.ok === true ? toneFromAge(flowTs) : 'neutral', `Fluxo ${rawForeign && rawForeign.ok === true ? ageText(flowTs) : '—'}`),
        badge(rawFocus && rawFocus.ok === true ? toneFromAge(focusTs) : 'neutral', `Focus ${rawFocus && rawFocus.ok === true ? ageText(focusTs) : '—'}`),
        badge(zqTs ? toneFromAge(zqTs) : 'neutral', `ZQ ${zqTs ? ageText(zqTs) : '—'}`),
    ];
    return `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;opacity:.95;">${bits.join('')}</div>`;
}

function opBriefing_computeBrFlowModuleHtml({
    brFlowSignal,
    badge,
    formatNumber,
    escapeHtml,
}) {
    if (!brFlowSignal || typeof brFlowSignal.score !== 'number' || !Number.isFinite(brFlowSignal.score)) return '';
    const s = brFlowSignal.score;
    const c = (typeof brFlowSignal.confidence === 'number' && Number.isFinite(brFlowSignal.confidence)) ? brFlowSignal.confidence : null;
    const tone = (s >= 0.38 && (c === null || c >= 0.62)) ? 'positive' : (s <= -0.38 && (c === null || c >= 0.62)) ? 'negative' : 'neutral';
    const bias = s > 0.22 ? 'Entrada em BR/EM' : s < -0.22 ? 'Saída de BR/EM' : 'Misto';
    const confTxt = c === null ? '—' : `${formatNumber(c * 100, 0)}%`;
    const drivers = Array.isArray(brFlowSignal.drivers) ? brFlowSignal.drivers.slice(0, 6) : [];
    const driversTxt = drivers.length ? drivers.join(' • ') : '—';
    const guide = s > 0.22
        ? 'Tese: fluxo global favorecendo emergentes/Brasil → tende a WIN↑ e WDO↓ (buscar alvos curtos a favor, evitar vender WIN “no dedo”).'
        : s < -0.22
            ? 'Tese: fluxo global saindo de emergentes/Brasil → tende a WIN↓ e WDO↑ (buscar alvos curtos a favor, evitar comprar WIN “no dedo”).'
            : 'Tese: misto → priorize scalp por níveis (range) e confirme em 5m×15m.';

    return `
            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">📌 Fluxo Global → Brasil (sinal de alta prob.)</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `${bias}`)}
                        ${badge('neutral', `Score ${formatNumber(s, 2)}`)}
                        ${badge('neutral', `Conf ${confTxt}`)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">Drivers: ${escapeHtml(driversTxt)}${brFlowSignal.detail ? ` • ${escapeHtml(brFlowSignal.detail)}` : ''}</div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">${escapeHtml(guide)}</div>
            </div>
        `;
}

function opBriefing_computeDiSignal({ data }) {
    if (!data) return { ok: false };
    const seriesKeys = Object.keys((data && data.series) || {});
    const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;

    const monthNum = code => {
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

    const symbolsFromSeries = seriesKeys.filter(sym => diMatcher.test(sym));
    const symbolsFromAssets = (data.assets || [])
        .map(a => String(a && a.symbol ? a.symbol : ''))
        .filter(sym => diMatcher.test(sym));
    const symbolsAll = Array.from(new Set([...symbolsFromSeries, ...symbolsFromAssets]));
    if (!symbolsAll.length) return { ok: false };

    const maturityYears = (y, m) => {
        if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
        const now = new Date();
        const t = new Date(y, m - 1, 1);
        const months = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
        if (!Number.isFinite(months)) return null;
        return months / 12;
    };

    const list = symbolsAll
        .map(symbol => {
            const last = getMostRecentPointWithPrice(data, symbol);
            const rate = last && typeof last.price === 'number' && Number.isFinite(last.price) ? last.price : null;
            const chg = last && typeof last.change === 'number' && Number.isFinite(last.change) ? last.change : null;
            const chgBp10 = typeof chg === 'number' && Number.isFinite(chg) ? (chg * 100) / 10 : null;
            const chgPct = pointPct(last);
            const y = 2000 + Number(String(symbol).slice(-2));
            const m = monthNum(String(symbol)[3]);
            return { symbol, rate, chgBp10, chgPct, year: Number.isFinite(y) ? y : null, month: m };
        })
        .filter(x => x.rate !== null && x.year !== null && x.month !== null)
        .map(x => ({ ...x, yrs: maturityYears(x.year, x.month) }))
        .filter(x => typeof x.yrs === 'number' && Number.isFinite(x.yrs) && x.yrs > 0);

    if (!list.length) return { ok: false };

    const median = vals => {
        const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v)).slice().sort((a, b) => a - b);
        if (!xs.length) return null;
        const mid = Math.floor(xs.length / 2);
        return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
    };
    const bucketOfYears = yrs => yrs < 2 ? 'short' : yrs <= 5 ? 'mid' : 'long';
    const avg = vals => {
        const xs = (vals || []).filter(v => typeof v === 'number' && Number.isFinite(v));
        return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
    };
    const pickAnchor = (bucketItems, targetYrs) => {
        const xs = (bucketItems || []).slice().filter(x => x && typeof x.yrs === 'number' && Number.isFinite(x.yrs));
        if (!xs.length) return null;
        const isJan = x => String(x && x.symbol ? x.symbol : '')[3]?.toUpperCase?.() === 'F';
        const jan = xs.filter(isJan);
        const pool = jan.length ? jan : xs;
        const tgt = typeof targetYrs === 'number' && Number.isFinite(targetYrs) ? targetYrs : null;
        const score = x => {
            if (tgt === null) return x.yrs;
            return Math.abs(x.yrs - tgt);
        };
        return pool.reduce((best, cur) => (best === null || score(cur) < score(best) ? cur : best), null);
    };
    const pick = k => list.filter(x => bucketOfYears(x.yrs) === k);

    const short = pick('short');
    const mid = pick('mid');
    const long = pick('long');

    const shortRate = avg(short.map(x => x.rate));
    const midRate = avg(mid.map(x => x.rate));
    const longRate = avg(long.map(x => x.rate));

    const shortChg = avg(short.map(x => x.chgBp10));
    const midChg = avg(mid.map(x => x.chgBp10));
    const longChg = avg(long.map(x => x.chgBp10));

    const avgChg = avg(list.map(x => x.chgBp10));
    const medChg = median(list.map(x => x.chgBp10));
    const slope = typeof longRate === 'number' && typeof shortRate === 'number' ? (longRate - shortRate) : null;
    const shape = slope === null ? 'N/A' : slope > 0.15 ? 'STEEPEN' : slope < -0.15 ? 'FLATTEN' : '≈';

    const th = 0.35;
    const dirUsd = typeof medChg === 'number' && Number.isFinite(medChg) ? (medChg > th ? 1 : medChg < -th ? -1 : 0) : 0;
    const wdoBias = dirUsd > 0 ? 'buy' : dirUsd < 0 ? 'sell' : 'neutral';
    const winBias = dirUsd > 0 ? 'sell' : dirUsd < 0 ? 'buy' : 'neutral';

    return {
        ok: true,
        shape,
        slope,
        buckets: {
            short: { rate: shortRate, chgPct: shortChg, n: short.length },
            mid: { rate: midRate, chgPct: midChg, n: mid.length },
            long: { rate: longRate, chgPct: longChg, n: long.length },
        },
        anchors: {
            short: pickAnchor(short, 1.0),
            mid: pickAnchor(mid, 3.5),
            long: pickAnchor(long, 8.0),
        },
        avgChg,
        medChg,
        dirUsd,
        wdoBias,
        winBias,
    };
}
