(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const d = deps || {};
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const pointPct = d.pointPct;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const escapeHtml = d.escapeHtml;
        const toneBadgeHtml = d.toneBadgeHtml;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;
        const setMetric = d.setMetric;
        const setHtml = d.setHtml;
        const renderAllAssetsTable = d.renderAllAssetsTable;
        const symbolKey = d.symbolKey;

        const dc = d.DecisionCore || (w.DecisionCore ? w.DecisionCore : null);
        const catalog = d.InstrumentsCatalog || (w.InstrumentsCatalog ? w.InstrumentsCatalog : null);
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
            eurusd: pickBestByMatchers([/^EUR\/USD\b/i]) || findAssetSymbol(data, /^EUR\/USD\b/i),
            gbpusd: pickBestByMatchers([/^GBP\/USD\b/i]) || findAssetSymbol(data, /^GBP\/USD\b/i),
            usdcad: pickBestByMatchers([/^USD\/CAD\b/i, /\bUSDCAD\b/i]) || findAssetSymbol(data, /^USD\/CAD\b/i),
            usdchf: pickBestByMatchers([/^USD\/CHF\b/i, /\bUSDCHF\b/i]) || findAssetSymbol(data, /^USD\/CHF\b/i),
            usdjpy: pickBestByMatchers([/^USD\/JPY\b/i]) || findAssetSymbol(data, /^USD\/JPY\b/i),
            usdbrl: aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]) || findAssetSymbol(data, /^USD\/BRL\b/i),
            usdcnh: aliasSym('USD_CNH') || pickBestByMatchers([/^USD\/CNH\b/i]) || findAssetSymbol(data, /^USD\/CNH\b/i),
            dxy: aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i]) || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i),
            vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
            hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || aliasSym('HYG') || pickBestByMatchers([/^HYG(\.\w+)?$/i]),
            br10y: rcKey('BR_10Y', /^BR10YT=RR$/i),
            us10y: rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i) || aliasSym('US10Y'),
            us10br10: rcKey('SPREAD_US10_BR10', /^US10BR10=RR$/i),
            us10jp10: pickBestByMatchers([/^US10JP10=RR$/i, /\bUS10\b.*\bJP10\b.*\bspread\b/i]) || findAssetSymbol(data, /^US10JP10=RR$/i),
            jp10y: resolveJapan10yYield(),
            jp1y: rcKey('JP_1Y', /^JP1YT=(RR|XX)$/i) || aliasSym('JP1Y') || findAssetSymbol(data, /^JP1YT=(RR|XX)$/i),
            jp5y: rcKey('JP_5Y', /^JP5YT=(RR|XX)$/i) || aliasSym('JP5Y') || findAssetSymbol(data, /^JP5YT=(RR|XX)$/i),
            hk10y: rcKey('HK_10Y', /^HK10YT=RR$/i) || aliasSym('HK10Y'),
            hsi: aliasSym('HSI') || pickBestByMatchers([/\bHang\s*Seng\b/i, /^HSI$/i]) || findAssetSymbol(data, /\bHang\s*Seng\b/i),
            hstech: aliasSym('HSTECH') || pickBestByMatchers([/^HSTECH$/i, /\bHang\s*Seng\b.*\bTech\b/i]) || findAssetSymbol(data, /^HSTECH$/i),
            ewh: aliasSym('EWH') || pickBestByMatchers([/^EWH(\.\w+)?$/i]) || findAssetSymbol(data, /^EWH(\.\w+)?$/i),
            audjpy: pickBestByMatchers([/^AUD\/JPY\b/i]) || findAssetSymbol(data, /^AUD\/JPY\b/i),
            nzdjpy: pickBestByMatchers([/^NZD\/JPY\b/i]) || findAssetSymbol(data, /^NZD\/JPY\b/i),
            mxnjpy: pickBestByMatchers([/^MXN\/JPY\b/i]) || findAssetSymbol(data, /^MXN\/JPY\b/i),
            zarjpy: pickBestByMatchers([/^ZAR\/JPY\b/i]) || findAssetSymbol(data, /^ZAR\/JPY\b/i),
            brljpy: pickBestByMatchers([/^BRL\/JPY\b/i]) || findAssetSymbol(data, /^BRL\/JPY\b/i),
            usdmxn: pickBestByMatchers([/^USD\/MXN\b/i]) || findAssetSymbol(data, /^USD\/MXN\b/i),
            usdzar: pickBestByMatchers([/^USD\/ZAR\b/i]) || findAssetSymbol(data, /^USD\/ZAR\b/i),
            usdtry: pickBestByMatchers([/^USD\/TRY\b/i]) || findAssetSymbol(data, /^USD\/TRY\b/i),
            usdclp: pickBestByMatchers([/^USD\/CLP\b/i]) || findAssetSymbol(data, /^USD\/CLP\b/i),
        };

        const lastOf = symbol => {
            if (!symbol) return null;
            const p = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
            if (!p) return null;
            const price = typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
            const change = typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null;
            const changePct = pointPct(p);
            const t = p.t ? String(p.t) : '';
            const tMs = t ? Date.parse(t) : NaN;
            return { price, change, changePct, t, tMs: Number.isFinite(tMs) ? tMs : null };
        };

        const audusd = lastOf(symbols.audusd);
        const nzdusd = lastOf(symbols.nzdusd);
        const eurusd = lastOf(symbols.eurusd);
        const gbpusd = lastOf(symbols.gbpusd);
        const usdcad = lastOf(symbols.usdcad);
        const usdchf = lastOf(symbols.usdchf);
        const usdjpy = lastOf(symbols.usdjpy);
        const usdbrl = lastOf(symbols.usdbrl);
        const usdcnh = lastOf(symbols.usdcnh);
        const dxy = lastOf(symbols.dxy);
        const vix = lastOf(symbols.vix);
        const hyg = lastOf(symbols.hyg);
        const br10y = lastOf(symbols.br10y);
        const us10y = lastOf(symbols.us10y);
        const us10br10 = lastOf(symbols.us10br10);
        const us10jp10 = lastOf(symbols.us10jp10);
        const jp10y = lastOf(symbols.jp10y);
        const jp1y = lastOf(symbols.jp1y);
        const jp5y = lastOf(symbols.jp5y);
        const audjpyDirect = lastOf(symbols.audjpy);
        const nzdjpyDirect = lastOf(symbols.nzdjpy);
        const mxnjpyDirect = lastOf(symbols.mxnjpy);
        const zarjpyDirect = lastOf(symbols.zarjpy);
        const brljpyDirect = lastOf(symbols.brljpy);
        const usdmxn = lastOf(symbols.usdmxn);
        const usdzar = lastOf(symbols.usdzar);
        const usdtry = lastOf(symbols.usdtry);
        const usdclp = lastOf(symbols.usdclp);
        const hk10y = lastOf(symbols.hk10y);
        const hsi = lastOf(symbols.hsi);
        const hstech = lastOf(symbols.hstech);
        const ewh = lastOf(symbols.ewh);

        const pctOf = x => pointPct(x);
        const priceOf = x => (x && typeof x.price === 'number' ? x.price : null);
        const changeOf = x => (x && typeof x.change === 'number' ? x.change : null);

        const audusdPct = pctOf(audusd);
        const nzdusdPct = pctOf(nzdusd);
        const eurusdPct = pctOf(eurusd);
        const gbpusdPct = pctOf(gbpusd);
        const usdcadPct = pctOf(usdcad);
        const usdchfPct = pctOf(usdchf);
        const usdjpyPct = pctOf(usdjpy);
        const usdbrlPct = pctOf(usdbrl);
        const usdcnhPct = pctOf(usdcnh);
        const dxyPct = pctOf(dxy);
        const vixPct = pctOf(vix);
        const hygPct = pctOf(hyg);
        const jp10yLevel = priceOf(jp10y);
        const jp10yDelta = changeOf(jp10y);
        const jp10yBps = typeof jp10yDelta === 'number' && Number.isFinite(jp10yDelta) ? jp10yDelta * 100 : null;
        const jp10yCarryV = typeof jp10yBps === 'number' && Number.isFinite(jp10yBps) ? -jp10yBps : null;
        const usjpBps = priceOf(us10jp10);
        const jp1yLevel = priceOf(jp1y);
        const jp5yLevel = priceOf(jp5y);
        const jp1yBps = (() => { const dd = changeOf(jp1y); return typeof dd === 'number' ? dd * 100 : null; })();
        const jp5yBps = (() => { const dd = changeOf(jp5y); return typeof dd === 'number' ? dd * 100 : null; })();
        const slope1_10_bps = typeof jp10yLevel === 'number' && typeof jp1yLevel === 'number' ? (jp10yLevel - jp1yLevel) * 100 : null;
        const slope5_10_bps = typeof jp10yLevel === 'number' && typeof jp5yLevel === 'number' ? (jp10yLevel - jp5yLevel) * 100 : null;
        const hk10yBps = (() => { const dd = changeOf(hk10y); return typeof dd === 'number' ? dd * 100 : null; })();
        const hsiPct = pctOf(hsi);
        const hstechPct = pctOf(hstech);
        const ewhPct = pctOf(ewh);
        const hkBaseScore = d.avg([typeof hsiPct === 'number' ? hsiPct : null, typeof hstechPct === 'number' ? hstechPct : null, typeof ewhPct === 'number' ? ewhPct : null]
            .map((v, i) => (i === 0 ? (typeof v === 'number' ? v * 0.5 : null) : i === 1 ? (typeof v === 'number' ? v * 0.3 : null) : (typeof v === 'number' ? v * 0.2 : null))));
        const hkAdj = typeof hk10yBps === 'number' ? Math.max(-1, Math.min(1, (-hk10yBps) / 8)) : 0;
        const hkScore = (typeof hkBaseScore === 'number' ? hkBaseScore : 0) + hkAdj * 0.2;
        const hkScore10 = (() => {
            const s = typeof hkScore === 'number' ? hkScore : 0;
            const n = Math.max(0, Math.min(10, Math.round((s / 2) * 5 + 5)));
            return n;
        })();

        const audjpyPct =
            pctOf(audjpyDirect) !== null
                ? pctOf(audjpyDirect)
                : audusdPct !== null && usdjpyPct !== null
                    ? (Math.max(-99, Math.min(99, ((1 + audusdPct / 100) * (1 + usdjpyPct / 100) - 1) * 100)))
                    : null;

        const audjpyLevel =
            priceOf(audjpyDirect) !== null
                ? priceOf(audjpyDirect)
                : priceOf(audusd) !== null && priceOf(usdjpy) !== null
                    ? priceOf(audusd) * priceOf(usdjpy)
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
        const synthCrossLevel = (quote, base) => {
            const q = priceOf(quote);
            const b = priceOf(base);
            if (q === null || b === null) return null;
            if (!(b > 0)) return null;
            const v = q / b;
            return Number.isFinite(v) ? v : null;
        };

        const mxnjpyPct = pctOf(mxnjpyDirect) !== null ? pctOf(mxnjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdmxn) : null);
        const zarjpyPct = pctOf(zarjpyDirect) !== null ? pctOf(zarjpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdzar) : null);
        const brljpyPct = pctOf(brljpyDirect) !== null ? pctOf(brljpyDirect) : (usdjpyPct !== null ? synthCross(usdjpy, usdbrl) : null);
        const usdcnhJpyPct = (usdjpyPct !== null && usdcnhPct !== null)
            ? (Math.max(-99, Math.min(99, ((1 + usdjpyPct / 100) / Math.max(1e-9, (1 + usdcnhPct / 100)) - 1) * 100)))
            : null;

        const mxnjpyLevel = priceOf(mxnjpyDirect) !== null ? priceOf(mxnjpyDirect) : (priceOf(usdjpy) !== null ? synthCrossLevel(usdjpy, usdmxn) : null);
        const zarjpyLevel = priceOf(zarjpyDirect) !== null ? priceOf(zarjpyDirect) : (priceOf(usdjpy) !== null ? synthCrossLevel(usdjpy, usdzar) : null);
        const brljpyLevel = priceOf(brljpyDirect) !== null ? priceOf(brljpyDirect) : (priceOf(usdjpy) !== null ? synthCrossLevel(usdjpy, usdbrl) : null);

        let premiumBps = null;
        let premiumPct = null;
        let premiumSource = '';
        if (us10br10 && typeof us10br10.price === 'number') {
            premiumBps = us10br10.price;
            premiumPct = pctOf(us10br10);
            premiumSource = 'US10BR10';
        } else if (br10y && us10y && typeof br10y.price === 'number' && typeof us10y.price === 'number') {
            premiumBps = (br10y.price - us10y.price) * 100;
            premiumPct = null;
            premiumSource = 'BR10Y-US10Y';
        } else if (br10y && typeof br10y.price === 'number') {
            premiumBps = br10y.price * 100;
            premiumPct = null;
            premiumSource = 'BR10Y';
        }

        const carryCrosses = [
            { label: 'AUD/JPY*', pct: audjpyPct, level: audjpyLevel, w: 0.36 },
            { label: 'NZD/JPY*', pct: nzdjpyPct, level: null, w: 0.22 },
            { label: 'MXN/JPY*', pct: mxnjpyPct, level: mxnjpyLevel, w: 0.18 },
            { label: 'ZAR/JPY*', pct: zarjpyPct, level: zarjpyLevel, w: 0.14 },
            { label: 'BRL/JPY*', pct: brljpyPct, level: brljpyLevel, w: 0.10 },
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
        const g10BetaPct = d.avg([audusdPct, nzdusdPct, eurusdPct, gbpusdPct]);
        const emUsdPct = d.avg([usdmxn ? pctOf(usdmxn) : null, usdzar ? pctOf(usdzar) : null, usdclp ? pctOf(usdclp) : null, usdtry ? pctOf(usdtry) : null, usdcnhPct]);

        const hasCore = (carryCrosses.filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct)).length >= 2)
            || ([audusdPct, usdjpyPct].filter(v => typeof v === 'number').length >= 2);
        const hasPremium = typeof premiumBps === 'number' && Number.isFinite(premiumBps);

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const norm = (v, unit) => {
            if (typeof v !== 'number' || !Number.isFinite(v) || typeof unit !== 'number' || !Number.isFinite(unit) || unit <= 0) return 0;
            return clamp(v / unit, -2, 2);
        };

        let carryStatus = 'Neutro';
        let carryStatusDetail = '—';
        if (!hasCore) {
            carryStatus = 'Dados insuficientes';
            carryStatusDetail = 'Crosses JPY (AUD/NZD/MXN/ZAR/BRL)';
        } else {
            const base = typeof carryBasketPct === 'number' ? carryBasketPct : audjpyPct;
            const riskOff = (typeof vixPct === 'number' && vixPct >= 1.0) || (typeof dxyPct === 'number' && dxyPct >= 0.35);
            const severeFx = (typeof usdjpyPct === 'number' && usdjpyPct <= -0.7) || (typeof audusdPct === 'number' && audusdPct <= -0.6);

            if (typeof base === 'number') {
                if (base <= -0.85 && (riskOff || severeFx)) carryStatus = 'Unwinding (severo)';
                else if (base <= -0.65) carryStatus = 'Unwinding';
                else if (base >= 0.65 && !riskOff) carryStatus = 'Building';
                else carryStatus = 'Neutro';
            }

            const parts = [];
            if (typeof carryBasketPct === 'number') parts.push(`Basket ${formatPercent(carryBasketPct, 2)}`);
            if (typeof audjpyPct === 'number') parts.push(`AUD/JPY ${formatPercent(audjpyPct, 2)}`);
            if (typeof usdjpyPct === 'number') parts.push(`USD/JPY ${formatPercent(usdjpyPct, 2)}`);
            if (typeof vixPct === 'number') parts.push(`VIX ${formatPercent(vixPct, 2)}`);
            carryStatusDetail = parts.join(' • ') || '—';
        }

        let flowLabel = 'Neutro';
        const corePct = typeof carryBasketPct === 'number' ? carryBasketPct : audjpyPct;
        if (typeof corePct === 'number' && typeof premiumPct === 'number') {
            const entering = premiumPct < -0.4 && corePct > 0.4 && (typeof dxyPct !== 'number' || dxyPct <= 0.1) && (typeof vixPct !== 'number' || vixPct <= 0.25);
            const leaving = premiumPct > 0.4 && corePct < -0.4 && (typeof dxyPct !== 'number' || dxyPct >= -0.1) && (typeof vixPct !== 'number' || vixPct >= -0.1);
            flowLabel = entering ? 'Entrando' : leaving ? 'Saindo' : 'Neutro';
        } else if (typeof corePct === 'number') {
            if (corePct > 0.6 && (typeof dxyPct !== 'number' || dxyPct < 0.1) && (typeof vixPct !== 'number' || vixPct <= 0.25) && (typeof usdbrlPct !== 'number' || usdbrlPct < 0.1)) flowLabel = 'Entrando';
            if (corePct < -0.6 && (typeof dxyPct !== 'number' || dxyPct > -0.1) && (typeof vixPct !== 'number' || vixPct >= -0.1) && (typeof usdbrlPct !== 'number' || usdbrlPct > -0.1)) flowLabel = 'Saindo';
        }

        let score = 5;
        score += 2.0 * norm(corePct || 0, 0.9);
        score += 1.2 * norm(-(premiumPct || 0), 0.8);
        score += 1.0 * norm(-(dxyPct || 0), 0.7);
        score += 0.9 * norm(-(vixPct || 0), 0.9);
        score += 1.2 * norm(-(usdbrlPct || 0), 0.7);
        score += 0.8 * norm(hygPct || 0, 0.8);
        if (typeof jp10yCarryV === 'number' && Number.isFinite(jp10yCarryV)) {
            score += 0.8 * norm(jp10yCarryV, 6);
        }

        if (typeof nzdusdPct === 'number' && typeof audusdPct === 'number' && Math.abs(nzdusdPct) > Math.abs(audusdPct) + 0.4) {
            score += nzdusdPct < 0 ? -0.6 : +0.2;
        }

        const staleMs = 4 * 60 * 60 * 1000;
        const ageOf = (sym) => {
            if (!sym) return null;
            if (dc && typeof dc.symbolAgeMs === 'function') {
                const age = dc.symbolAgeMs(dcDeps, data, sym);
                return typeof age === 'number' && Number.isFinite(age) ? age : null;
            }
            const p = lastOf(sym);
            if (!p || typeof p.tMs !== 'number') return null;
            const age = Date.now() - p.tMs;
            return Number.isFinite(age) ? age : null;
        };
        const coreAges = [
            ageOf(symbols.audjpy) ?? ageOf(symbols.audusd),
            ageOf(symbols.usdjpy),
            ageOf(symbols.usdmxn),
            ageOf(symbols.usdzar),
            ageOf(symbols.vix),
            ageOf(symbols.hyg),
        ].filter(x => typeof x === 'number' && Number.isFinite(x));
        const staleCore = coreAges.length ? (coreAges.some(ms => ms > staleMs)) : false;
        if (staleCore) score -= 0.9;

        const score10 = clamp(Math.round(score), 0, 10);
        const scoreTone = score10 >= 7 ? 'positive' : score10 <= 3 ? 'negative' : 'neutral';

        setMetric('carry-premium-level', hasPremium ? formatNumber(premiumBps, 1) : '—');
        setMetric('carry-premium-detail', hasPremium ? `${premiumSource}${typeof premiumPct === 'number' ? ` • ${formatPercent(premiumPct, 2)}` : ''}` : '—');

        setMetric('carry-audjpy-level', typeof audjpyLevel === 'number' ? formatNumber(audjpyLevel, 2) : '—');
        setMetric('carry-audjpy-detail', typeof audjpyPct === 'number' ? formatPercent(audjpyPct, 2) : '—');

        setMetric('carry-usdjpy-level', typeof priceOf(usdjpy) === 'number' ? formatNumber(priceOf(usdjpy), 2) : '—');
        setMetric('carry-usdjpy-detail', typeof usdjpyPct === 'number' ? formatPercent(usdjpyPct, 2) : '—');

        setMetric('carry-state', carryStatus);
        setMetric('carry-state-detail', carryStatusDetail);

        setMetric('carry-score', `${score10}/10`);
        setHtml('carry-score-detail', toneBadgeHtmlFromTone(scoreTone, score10 - 5, `${flowLabel}`, { maxAbs: 5 }));

        const fmtSignedBp = bps => {
            const v = typeof bps === 'number' && Number.isFinite(bps) ? bps : null;
            if (v === null) return '—';
            const sign = v > 0 ? '+' : v < 0 ? '−' : '';
            return `${sign}${formatNumber(Math.abs(v), 0)}bp`;
        };

        const rows = [
            { sep: true, label: 'Macro / Liquidez' },
            { label: 'Basket Carry (crosses JPY)', v: corePct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'Prêmio BR vs US (bps)', v: hasPremium ? premiumBps : null, fmt: x => formatNumber(x, 1), maxAbs: 1200 },
            { label: 'DXY', v: dxyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'VIX', v: vixPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'HYG', v: hygPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'JP10Y (Δ bp)', v: jp10yCarryV, fmt: () => fmtSignedBp(jp10yBps), maxAbs: 35 },
            { label: 'Spread US10–JP10 (bps)', v: usjpBps, fmt: x => formatNumber(x, 1), maxAbs: 800 },

            { sep: true, label: 'FX G10 (beta + funding)' },
            { label: 'G10 beta (AUD/NZD/EUR/GBP)', v: g10BetaPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'AUD/USD', v: audusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'NZD/USD', v: nzdusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'EUR/USD', v: eurusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'GBP/USD', v: gbpusdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/JPY', v: usdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/CAD', v: usdcadPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/CHF', v: usdchfPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'AUD/JPY*', v: audjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'NZD/JPY*', v: nzdjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },

            { sep: true, label: 'FX Emergentes (USD/EM)' },
            { label: 'USD/EM Basket', v: emUsdPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/CNH', v: usdcnhPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/BRL', v: usdbrlPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/MXN', v: pctOf(usdmxn), fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/ZAR', v: pctOf(usdzar), fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/CLP', v: pctOf(usdclp), fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'USD/TRY', v: pctOf(usdtry), fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'MXN/JPY*', v: mxnjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'ZAR/JPY*', v: zarjpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'BRL/JPY*', v: brljpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
            { label: 'CNH/JPY*', v: usdcnhJpyPct, fmt: x => formatPercent(x, 2), maxAbs: 5 },
        ];

        const listHtml = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Componentes</div>
            ${rows
                .filter(r => (r && r.sep) || (r && r.v !== null && r.v !== undefined))
                .map(r => {
                    if (r && r.sep) {
                        return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.8px;opacity:.9;">${escapeHtml(r.label || '')}</div>`;
                    }
                    const txt = r.v === null ? '—' : r.fmt(r.v);
                    const badge = r.v === null ? '—' : toneBadgeHtml(r.v, txt, { maxAbs: r.maxAbs });
                    const note = /\*$/.test(String(r.label)) ? `<span style="opacity:.7;font-size:12px;">(sintético)</span>` : '';
                    return `
                        <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                            <div style="opacity:.9;font-weight:800;">${escapeHtml(r.label)} ${note}</div>
                            <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;
        const mkBp = v => (typeof v === 'number' && Number.isFinite(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatNumber(Math.abs(v), 0)}bp` : '—');
        const japanCurveHtml = (jp1y || jp5y || jp10y) ? `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);margin-top:10px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Curva Japão</div>
                <button id="japanCurveMoreBtn" class="btn" style="padding:6px 10px;">Ver mais</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div style="display:flex;justify-content:space-between;"><div>Δ JP1Y</div><div>${mkBp(jp1yBps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Δ JP5Y</div><div>${mkBp(jp5yBps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Δ JP10Y</div><div>${mkBp(jp10yBps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Inclinação 1–10</div><div>${mkBp(slope1_10_bps)}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Inclinação 5–10</div><div>${mkBp(slope5_10_bps)}</div></div>
            </div>
        </div>
    ` : '';
        const hkThermoHtml = (hsi || hstech || ewh || hk10y) ? `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);margin-top:10px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Termômetro HK</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span>${hkScore10}/10</span>
                    <span>${typeof hkScore === 'number' && Number.isFinite(hkScore) ? toneBadgeHtml(hkScore, formatPercent(hkScore, 2), { maxAbs: 5 }) : '—'}</span>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">
                <div style="display:flex;justify-content:space-between;"><div>HSI</div><div>${typeof hsiPct === 'number' ? toneBadgeHtml(hsiPct, formatPercent(hsiPct, 2), { maxAbs: 5 }) : '—'}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>HSTECH</div><div>${typeof hstechPct === 'number' ? toneBadgeHtml(hstechPct, formatPercent(hstechPct, 2), { maxAbs: 5 }) : '—'}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>EWH</div><div>${typeof ewhPct === 'number' ? toneBadgeHtml(ewhPct, formatPercent(ewhPct, 2), { maxAbs: 5 }) : '—'}</div></div>
                <div style="display:flex;justify-content:space-between;"><div>Δ HK10Y</div><div>${mkBp(hk10yBps)}</div></div>
            </div>
        </div>
    ` : '';
        setHtml('carry-components', `${listHtml}${japanCurveHtml}${hkThermoHtml}`);
        const moreBtn = document.getElementById('japanCurveMoreBtn');
        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                try {
                    localStorage.setItem('mercado_table_q:all', 'rates');
                    localStorage.setItem('mercado_table_mode:all', 'all');
                } catch {
                }
                renderAllAssetsTable(data);
                location.hash = '#all-assets';
                const section = document.getElementById('all-assets');
                if (section && typeof section.scrollIntoView === 'function') {
                    try {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } catch {
                    }
                }
            });
        }

        const historyKey = 'mercado_carry_history_v1';
        const maxHistory = 24;
        const nowMs = Date.now();

        const readHistory = () => {
            try {
                const raw = localStorage.getItem(historyKey);
                const parsed = raw ? JSON.parse(raw) : null;
                if (!Array.isArray(parsed)) return [];
                return parsed
                    .filter(x => x && typeof x === 'object')
                    .map(x => {
                        const o = x;
                        const tMs = typeof o.tMs === 'number' && Number.isFinite(o.tMs) ? o.tMs : null;
                        const s10 = typeof o.s10 === 'number' && Number.isFinite(o.s10) ? o.s10 : null;
                        const label = typeof o.label === 'string' ? o.label : '';
                        const aj = typeof o.audjpyPct === 'number' && Number.isFinite(o.audjpyPct) ? o.audjpyPct : null;
                        const prem = typeof o.premiumPct === 'number' && Number.isFinite(o.premiumPct) ? o.premiumPct : null;
                        if (tMs === null || s10 === null) return null;
                        return { tMs, s10, label, audjpyPct: aj, premiumPct: prem };
                    })
                    .filter(Boolean);
            } catch {
                return [];
            }
        };

        const writeHistory = items => {
            try {
                localStorage.setItem(historyKey, JSON.stringify(items));
            } catch {
            }
        };

        const toTime = tMs => {
            try {
                return new Date(tMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } catch {
                return '';
            }
        };

        const toneColor = s10 => {
            const x = clamp(Math.round(s10), 0, 10);
            if (x <= 3) return 'rgba(255,60,80,.95)';
            if (x >= 7) return 'rgba(0,255,160,.95)';
            return 'rgba(255,210,74,.95)';
        };

        const history = readHistory();
        const nextItem = { tMs: nowMs, s10: score10, label: flowLabel, audjpyPct: audjpyPct, premiumPct: premiumPct };
        const last = history.length ? history[history.length - 1] : null;
        if (last && nowMs - last.tMs < 20000) {
            history[history.length - 1] = nextItem;
        } else {
            history.push(nextItem);
        }
        const trimmed = history.slice(-maxHistory);
        writeHistory(trimmed);

        const bars = trimmed
            .slice(-12)
            .map(h => {
                const height = 8 + clamp(h.s10, 0, 10) * 2.3;
                const parts = [`${toTime(h.tMs)} • ${clamp(h.s10, 0, 10)}/10 • ${h.label}`];
                if (typeof h.audjpyPct === 'number') parts.push(`AUD/JPY ${formatPercent(h.audjpyPct, 2)}`);
                if (typeof h.premiumPct === 'number') parts.push(`Prêmio ${formatPercent(h.premiumPct, 2)}`);
                const title = parts.join(' • ');
                return `<div title="${escapeHtml(title)}" style="width:10px;height:${height}px;background:${toneColor(h.s10)};border-radius:4px;opacity:.92;"></div>`;
            })
            .join('');

        setHtml('carry-history', `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Histórico (últimas janelas)</div>
                <div style="opacity:.80;font-size:12px;">${escapeHtml(trimmed.length ? `${toTime(trimmed[trimmed.length - 1].tMs)}` : '')}</div>
            </div>
            <div style="display:flex;align-items:flex-end;gap:6px;margin-top:10px;min-height:38px;">
                ${bars || '<div style="opacity:.85;">—</div>'}
            </div>
        </div>
    `);

        const alerts = [];
        if (typeof corePct === 'number' && Math.abs(corePct) >= 0.9) alerts.push(`Basket Carry ${formatPercent(corePct, 2)}: movimento significativo nos crosses JPY.`);
        if (typeof audjpyPct === 'number' && Math.abs(audjpyPct) >= 1.0) alerts.push(`AUD/JPY (sintético) ${formatPercent(audjpyPct, 2)}: movimento significativo.`);
        if (typeof usdjpyPct === 'number' && Math.abs(usdjpyPct) >= 0.8) alerts.push(`USD/JPY ${formatPercent(usdjpyPct, 2)}: funding mexendo forte.`);
        if (typeof nzdjpyPct === 'number' && Math.abs(nzdjpyPct) >= 1.0) alerts.push(`NZD/JPY (sintético) ${formatPercent(nzdjpyPct, 2)}: early warning possível.`);
        if (typeof mxnjpyPct === 'number' && Math.abs(mxnjpyPct) >= 1.0) alerts.push(`MXN/JPY (sintético) ${formatPercent(mxnjpyPct, 2)}: stress EM/JPY (carry sensível).`);
        if (typeof zarjpyPct === 'number' && Math.abs(zarjpyPct) >= 1.0) alerts.push(`ZAR/JPY (sintético) ${formatPercent(zarjpyPct, 2)}: stress EM/JPY (carry sensível).`);
        if (typeof premiumPct === 'number' && Math.abs(premiumPct) >= 0.6) alerts.push(`Prêmio BR vs US ${formatPercent(premiumPct, 2)}: compressão/abertura relevante.`);
        if (typeof vixPct === 'number' && Math.abs(vixPct) >= 2.0) alerts.push(`VIX ${formatPercent(vixPct, 2)}: risco/volatilidade mexendo forte (confirma/nega carry).`);
        if (typeof hygPct === 'number' && Math.abs(hygPct) >= 1.2) alerts.push(`HYG ${formatPercent(hygPct, 2)}: crédito HY mexendo forte (confirmador de risk-on/off).`);
        if (typeof jp10yLevel === 'number' && Number.isFinite(jp10yLevel) && jp10yLevel > 0 && typeof jp10yBps === 'number' && Number.isFinite(jp10yBps) && jp10yBps >= 4) {
            alerts.push(`JP10Y ${formatNumber(jp10yLevel, 2)}% com alta de ~${formatNumber(jp10yBps, 0)}bp: juros do Japão abrindo → risco de carry voltar para JPY (pressão em FX beta).`);
        }
        if (carryStatus === 'Unwinding (severo)') alerts.push('Duplo unwinding: USD/JPY e AUD/USD caindo com força.');
        if (!hasPremium) alerts.push('Prêmio BR vs US não disponível (US10BR10 ou US10Y/BR10Y ausentes).');
        if (staleCore) alerts.push('Parte do core está “stale” (idade > 4h) → score penalizado para evitar falso sinal.');

        setHtml('carry-alerts', alerts.length
            ? `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Alertas</div>
                ${alerts.map(t => `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;line-height:1.35;">${escapeHtml(t)}</div>`).join('')}
            </div>
          `
            : '');
    }

    root.fxCarry = { render };
    w.MercadoBlocks = root;
})();
