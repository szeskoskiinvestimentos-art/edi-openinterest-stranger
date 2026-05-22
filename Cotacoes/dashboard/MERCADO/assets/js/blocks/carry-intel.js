(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const pointPct = d.pointPct;
        const formatNumber = d.formatNumber;
        const escapeHtml = d.escapeHtml;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;

        const dc = d.DecisionCore || (typeof window !== 'undefined' && window.DecisionCore ? window.DecisionCore : null);
        const catalog = d.InstrumentsCatalog || (typeof window !== 'undefined' && window.InstrumentsCatalog ? window.InstrumentsCatalog : null);
        const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
        const catDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };
        const rcKey = (key, fallbackMatcher) => {
            const sym = catalog && typeof catalog.resolveRatesCreditByKey === 'function'
                ? catalog.resolveRatesCreditByKey(catDeps, data, key)
                : null;
            if (sym) return sym;
            if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
            return null;
        };

        const aliasSym = (k) => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);

        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const mostRecentMs = (symbol) => {
            if (!symbol) return -Infinity;
            const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
            const t = last && last.t ? Date.parse(String(last.t)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
        const pickBestByMatchers = (matchers, { limit = 14 } = {}) => {
            const out = [];
            const seen = new Set();
            for (const re of (matchers || [])) {
                if (!(re instanceof RegExp)) continue;
                for (const a of assets) {
                    const sym = a && a.symbol ? String(a.symbol) : '';
                    const name = a && a.name ? String(a.name) : '';
                    if (!sym || seen.has(sym)) continue;
                    if (re.test(sym) || re.test(name)) {
                        out.push(sym);
                        seen.add(sym);
                        if (out.length >= limit) break;
                    }
                }
            }
            out.sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
            return out.length ? out[0] : null;
        };

        const resolveJapan10yYield = () => {
            return rcKey('JP_10Y', /^JP10YT=RR$/i)
                || aliasSym('JP10Y')
                || pickBestByMatchers([/^JP10YT=RR$/i, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b.*?\bYield\b/i, /\bJapan\b(?!.*\b(CDS|Future|Futures)\b).*?\b10\b.*?\bYear\b/i])
                || null;
        };

        const symbols = {
            audusd: pickBestByMatchers([/^AUD\/USD\b/i]) || findAssetSymbol(data, /^AUD\/USD\b/i),
            nzdusd: pickBestByMatchers([/^NZD\/USD\b/i]) || findAssetSymbol(data, /^NZD\/USD\b/i),
            usdjpy: pickBestByMatchers([/^USD\/JPY\b/i]) || findAssetSymbol(data, /^USD\/JPY\b/i),
            usdbrl: aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]) || findAssetSymbol(data, /^USD\/BRL\b/i),
            dxy: aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i]) || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i),
            vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
            hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || aliasSym('HYG') || pickBestByMatchers([/^HYG(\.\w+)?$/i]),
            br10y: rcKey('BR_10Y', /^BR10YT=RR$/i),
            us10y: rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || aliasSym('US10Y'),
            us10br10: rcKey('SPREAD_US10_BR10', /^US10BR10=RR$/i),
            jp10y: rcKey('JP_10Y', /^JP10YT=RR$/i) || resolveJapan10yYield(),
            audjpy: pickBestByMatchers([/^AUD\/JPY\b/i]) || findAssetSymbol(data, /^AUD\/JPY\b/i),
            nzdjpy: pickBestByMatchers([/^NZD\/JPY\b/i]) || findAssetSymbol(data, /^NZD\/JPY\b/i),
            mxnjpy: pickBestByMatchers([/^MXN\/JPY\b/i]) || findAssetSymbol(data, /^MXN\/JPY\b/i),
            zarjpy: pickBestByMatchers([/^ZAR\/JPY\b/i]) || findAssetSymbol(data, /^ZAR\/JPY\b/i),
            brljpy: pickBestByMatchers([/^BRL\/JPY\b/i]) || findAssetSymbol(data, /^BRL\/JPY\b/i),
            usdmxn: pickBestByMatchers([/^USD\/MXN\b/i]) || findAssetSymbol(data, /^USD\/MXN\b/i),
            usdzar: pickBestByMatchers([/^USD\/ZAR\b/i]) || findAssetSymbol(data, /^USD\/ZAR\b/i),
        };

        const lastOf = symbol => {
            if (!symbol) return null;
            const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
            if (!p) return null;
            const price = typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            const change = typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null;
            const changePct = pointPct(p);
            return { price, change, changePct };
        };

        const audusd = lastOf(symbols.audusd);
        const nzdusd = lastOf(symbols.nzdusd);
        const usdjpy = lastOf(symbols.usdjpy);
        const usdbrl = lastOf(symbols.usdbrl);
        const dxy = lastOf(symbols.dxy);
        const vix = lastOf(symbols.vix);
        const hyg = lastOf(symbols.hyg);
        const br10y = lastOf(symbols.br10y);
        const us10y = lastOf(symbols.us10y);
        const us10br10 = lastOf(symbols.us10br10);
        const jp10y = lastOf(symbols.jp10y);
        const audjpyDirect = lastOf(symbols.audjpy);
        const nzdjpyDirect = lastOf(symbols.nzdjpy);
        const mxnjpyDirect = lastOf(symbols.mxnjpy);
        const zarjpyDirect = lastOf(symbols.zarjpy);
        const brljpyDirect = lastOf(symbols.brljpy);
        const usdmxn = lastOf(symbols.usdmxn);
        const usdzar = lastOf(symbols.usdzar);

        const pctOf = x => pointPct(x);

        const audusdPct = pctOf(audusd);
        const nzdusdPct = pctOf(nzdusd);
        const usdjpyPct = pctOf(usdjpy);
        const usdbrlPct = pctOf(usdbrl);
        const dxyPct = pctOf(dxy);
        const vixPct = pctOf(vix);
        const hygPct = pctOf(hyg);
        const jp10yPct = pctOf(jp10y);
        const jp10yBps = jp10y && typeof jp10y.change === 'number' && Number.isFinite(jp10y.change) ? jp10y.change * 100 : null;

        const audjpyPct =
            pctOf(audjpyDirect) !== null
                ? pctOf(audjpyDirect)
                : audusdPct !== null && usdjpyPct !== null
                    ? (Math.max(-99, Math.min(99, ((1 + audusdPct / 100) * (1 + usdjpyPct / 100) - 1) * 100)))
                    : null;

        const nzdjpyPct =
            pctOf(nzdjpyDirect) !== null
                ? pctOf(nzdjpyDirect)
                : nzdusdPct !== null && usdjpyPct !== null
                    ? (Math.max(-99, Math.min(99, ((1 + nzdusdPct / 100) * (1 + usdjpyPct / 100) - 1) * 100)))
                    : null;

        const synthCross = (quote, base) => {
            const qPct = pctOf(quote);
            const bPct = pctOf(base);
            if (qPct === null || bPct === null) return null;
            const v = ((1 + qPct / 100) / Math.max(1e-9, (1 + bPct / 100)) - 1) * 100;
            return Math.max(-99, Math.min(99, v));
        };
        const mxnjpyPct = pctOf(mxnjpyDirect) !== null ? pctOf(mxnjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdmxn) : null);
        const zarjpyPct = pctOf(zarjpyDirect) !== null ? pctOf(zarjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdzar) : null);
        const brljpyPct = pctOf(brljpyDirect) !== null ? pctOf(brljpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdbrl) : null);

        const carryCrosses = [
            { label: 'AUD/JPY', pct: audjpyPct, w: 0.36 },
            { label: 'NZD/JPY', pct: nzdjpyPct, w: 0.22 },
            { label: 'MXN/JPY', pct: mxnjpyPct, w: 0.18 },
            { label: 'ZAR/JPY', pct: zarjpyPct, w: 0.14 },
            { label: 'BRL/JPY', pct: brljpyPct, w: 0.10 },
        ];
        const weightedAvg = (items) => {
            const pairs = (items || [])
                .map(x => ({ v: typeof x.pct === 'number' && Number.isFinite(x.pct) ? x.pct : null, w: typeof x.w === 'number' && Number.isFinite(x.w) ? x.w : 0 }))
                .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0);
            const wSum = pairs.reduce((s, x) => s + x.w, 0);
            if (!(wSum > 0)) return null;
            const s = pairs.reduce((acc, x) => acc + x.v * x.w, 0) / wSum;
            return Number.isFinite(s) ? s : null;
        };
        const carryBasketPct = weightedAvg(carryCrosses);

        const premiumPct = pctOf(us10br10) !== null ? pctOf(us10br10) : null;
        const hasPremium = premiumPct !== null || pctOf(br10y) !== null || pctOf(us10y) !== null;

        const moveLabel = (pct, { strong = 0.8, medium = 0.3 } = {}) => {
            if (pct === null) return { txt: 'Sem dado', tone: 'neutral' };
            if (pct >= strong) return { txt: 'Alta forte', tone: 'positive' };
            if (pct >= medium) return { txt: 'Alta', tone: 'positive' };
            if (pct <= -strong) return { txt: 'Queda forte', tone: 'negative' };
            if (pct <= -medium) return { txt: 'Queda', tone: 'negative' };
            return { txt: 'Estável', tone: 'neutral' };
        };

        const moveLabelInverted = (pct, cfg) => {
            const r = moveLabel(pct, cfg);
            if (r.tone === 'positive') return { txt: r.txt, tone: 'negative' };
            if (r.tone === 'negative') return { txt: r.txt, tone: 'positive' };
            return r;
        };

        const mk = (tone, txt) => toneBadgeHtmlFromTone(tone, 0, txt, { maxAbs: 1 });

        const coreOk = (carryCrosses.filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct)).length >= 2)
            || ([audusdPct, usdjpyPct].filter(v => typeof v === 'number').length >= 2);
        let carryState = 'Inconclusivo';
        const corePct = typeof carryBasketPct === 'number' ? carryBasketPct : audjpyPct;
        if (coreOk && typeof corePct === 'number') {
            const riskOff = (typeof vixPct === 'number' && vixPct >= 1.0) || (typeof dxyPct === 'number' && dxyPct >= 0.35);
            const severeFx = (typeof usdjpyPct === 'number' && usdjpyPct <= -0.7) || (typeof audusdPct === 'number' && audusdPct <= -0.6);
            if (corePct <= -0.85 && (riskOff || severeFx)) carryState = 'Unwinding (severo)';
            else if (corePct <= -0.65) carryState = 'Unwinding';
            else if (corePct >= 0.65 && !riskOff) carryState = 'Building';
            else carryState = 'Neutro';
        } else if (!coreOk) {
            carryState = 'Dados insuficientes';
        }

        let carryFlow = 'Neutro';
        if (typeof corePct === 'number' && typeof premiumPct === 'number') {
            const entering = premiumPct < -0.4 && corePct > 0.4 && (typeof dxyPct !== 'number' || dxyPct <= 0.1) && (typeof vixPct !== 'number' || vixPct <= 0.25);
            const leaving = premiumPct > 0.4 && corePct < -0.4 && (typeof dxyPct !== 'number' || dxyPct >= -0.1) && (typeof vixPct !== 'number' || vixPct >= -0.1);
            carryFlow = entering ? 'Entrando' : leaving ? 'Saindo' : 'Neutro';
        } else if (typeof corePct === 'number') {
            if (corePct > 0.6 && (typeof dxyPct !== 'number' || dxyPct < 0.1) && (typeof vixPct !== 'number' || vixPct <= 0.25) && (typeof usdbrlPct !== 'number' || usdbrlPct < 0.1)) carryFlow = 'Entrando';
            if (corePct < -0.6 && (typeof dxyPct !== 'number' || dxyPct > -0.1) && (typeof vixPct !== 'number' || vixPct >= -0.1) && (typeof usdbrlPct !== 'number' || usdbrlPct > -0.1)) carryFlow = 'Saindo';
        }

        const cov = [corePct, usdjpyPct, audusdPct, dxyPct, vixPct, hygPct, usdbrlPct, premiumPct].filter(v => typeof v === 'number').length;
        const confidence = cov >= 5 ? 'Alta' : cov >= 3 ? 'Média' : 'Baixa';

        const rows = [
            { label: 'Estado do carry', badge: mk(carryState.includes('Unwinding') ? 'negative' : carryState === 'Building' ? 'positive' : 'neutral', carryState) },
            { label: 'Carrego entrando/saindo', badge: mk(carryFlow === 'Saindo' ? 'negative' : carryFlow === 'Entrando' ? 'positive' : 'neutral', carryFlow) },
            { label: 'Confiança', badge: mk(confidence === 'Alta' ? 'positive' : confidence === 'Baixa' ? 'negative' : 'neutral', confidence) },
        ];

        const evidence = [
            { label: 'Basket Carry (crosses JPY)', ...moveLabel(corePct, { strong: 0.9, medium: 0.35 }), note: typeof carryBasketPct === 'number' ? 'Ponderado' : '' },
            { label: 'AUD/JPY (proxy carry)', ...moveLabel(audjpyPct, { strong: 1.0, medium: 0.4 }), note: pctOf(audjpyDirect) === null ? 'Sintético' : '' },
            { label: 'USD/JPY (funding)', ...moveLabel(usdjpyPct, { strong: 0.8, medium: 0.3 }) },
            { label: 'AUD/USD (beta)', ...moveLabel(audusdPct, { strong: 0.8, medium: 0.3 }) },
            { label: 'VIX (stress)', ...moveLabelInverted(vixPct, { strong: 1.2, medium: 0.45 }) },
            { label: 'HYG (crédito)', ...moveLabel(hygPct, { strong: 1.0, medium: 0.35 }) },
            { label: 'DXY (USD global)', ...moveLabelInverted(dxyPct, { strong: 0.7, medium: 0.25 }) },
            { label: 'USD/BRL (risco BR)', ...moveLabelInverted(usdbrlPct, { strong: 0.7, medium: 0.25 }) },
            {
                label: 'JP10Y (juros Japão)',
                ...(jp10yBps === null
                    ? (jp10yPct === null ? { txt: 'Sem dado', tone: 'neutral' } : moveLabelInverted(jp10yPct, { strong: 1.0, medium: 0.35 }))
                    : (() => {
                        const bps = jp10yBps;
                        if (bps >= 4) return { txt: 'Alta forte', tone: 'negative' };
                        if (bps >= 1.5) return { txt: 'Alta', tone: 'negative' };
                        if (bps <= -4) return { txt: 'Queda forte', tone: 'positive' };
                        if (bps <= -1.5) return { txt: 'Queda', tone: 'positive' };
                        return { txt: 'Estável', tone: 'neutral' };
                    })()),
            },
            { label: 'Prêmio BR vs US (proxy)', ...(premiumPct === null ? { txt: hasPremium ? 'Disponível (sem var%)' : 'Indisponível', tone: hasPremium ? 'neutral' : 'negative' } : moveLabelInverted(premiumPct, { strong: 0.6, medium: 0.25 })) },
            { label: 'NZD/JPY (early warning)', ...moveLabel(nzdjpyPct, { strong: 1.0, medium: 0.4 }), note: pctOf(nzdjpyDirect) === null ? 'Sintético' : '' },
            { label: 'MXN/JPY (EM/JPY)', ...moveLabel(mxnjpyPct, { strong: 1.0, medium: 0.4 }), note: pctOf(mxnjpyDirect) === null ? 'Sintético' : '' },
            { label: 'ZAR/JPY (EM/JPY)', ...moveLabel(zarjpyPct, { strong: 1.0, medium: 0.4 }), note: pctOf(zarjpyDirect) === null ? 'Sintético' : '' },
            { label: 'BRL/JPY (BR/JPY)', ...moveLabel(brljpyPct, { strong: 1.0, medium: 0.4 }), note: pctOf(brljpyDirect) === null ? 'Sintético' : '' },
        ];

        const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:grid;grid-template-columns:1fr;gap:10px;">
                ${rows
                .map(r => `
                        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${escapeHtml(r.label)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${r.badge}</div>
                        </div>
                    `)
                .join('')}
            </div>
        </div>
        <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Evidências (qualitativas)</div>
            ${evidence
                .map(e => {
                    const badge = mk(e.tone, e.txt);
                    const note = e.note ? `<span style="opacity:.7;font-size:12px;margin-left:8px;">${escapeHtml(e.note)}</span>` : '';
                    return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);align-items:center;">
                            <div style="opacity:.92;font-weight:800;">${escapeHtml(e.label)}${note}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${badge}</div>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;

        el.innerHTML = html;
    }

    root.carryIntel = { render };
    w.MercadoBlocks = root;
})();
