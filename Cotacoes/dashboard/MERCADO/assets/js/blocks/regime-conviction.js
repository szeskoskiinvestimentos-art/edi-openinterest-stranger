(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};

        const escapeHtml = d.escapeHtml;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;

        const buildDcDeps = d.buildDcDeps;
        const buildCatDeps = d.buildCatDeps;
        const DecisionCore = d.DecisionCore;
        const InstrumentsCatalog = d.InstrumentsCatalog;

        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getLastPoint = d.getLastPoint;
        const getChangePct = d.getChangePct;
        const computeFlowScore = d.computeFlowScore;
        const operationalInputs = d.operationalInputs;

        const renderOperationalBriefing = d.renderOperationalBriefing;
        const renderBtcOperationalBriefing = d.renderBtcOperationalBriefing;
        const renderHk50OperationalBriefing = d.renderHk50OperationalBriefing;
        const renderUsEquitiesOperationalBriefing = d.renderUsEquitiesOperationalBriefing;
        const renderCommoditiesOperationalBriefing = d.renderCommoditiesOperationalBriefing;

        const dc = DecisionCore || null;
        const dcDeps = typeof buildDcDeps === 'function' ? buildDcDeps() : null;
        const catalog = InstrumentsCatalog || null;
        const catDeps = (typeof buildCatDeps === 'function' && dcDeps) ? buildCatDeps(dcDeps) : null;
        const rcKey = (key, fallbackMatcher) => {
            const sym = (catalog && typeof catalog.resolveRatesCreditByKey === 'function' && catDeps)
                ? catalog.resolveRatesCreditByKey(catDeps, data, key)
                : null;
            if (sym) return sym;
            if (fallbackMatcher instanceof RegExp) return findAssetSymbol(data, fallbackMatcher);
            return null;
        };

        const aliasSym = k => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);
        const symOf = (aliasKey, matcher) => aliasSym(aliasKey) || (matcher ? findAssetSymbol(data, matcher) : null);

        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const mostRecentMs = (symbol) => {
            if (!symbol) return -Infinity;
            const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
            const t = last && last.t ? Date.parse(String(last.t)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
        const pickBestByMatchers = (matchers, { limit = 12 } = {}) => {
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
        const symBest = (aliasKey, matchers) => aliasSym(aliasKey) || pickBestByMatchers(matchers);

        const downgradeConvictionLabel = (label, steps) => {
            const s = Math.max(0, Math.floor(Number(steps) || 0));
            let out = String(label || '');
            for (let i = 0; i < s; i++) {
                if (out === 'ALTA') out = 'MÉDIA';
                else if (out === 'MÉDIA') out = 'BAIXA';
                else out = 'BAIXA';
            }
            return out;
        };

        const buildReturnSeries = (symbol, maxPoints) => {
            if (!symbol) return [];
            const pts = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
            const priced = Array.isArray(pts)
                ? pts
                    .map(p => {
                        const tMs = p && p.t ? Date.parse(p.t) : NaN;
                        const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null;
                        return Number.isFinite(tMs) && typeof price === 'number' ? { tMs, price } : null;
                    })
                    .filter(Boolean)
                : [];
            if (priced.length < 3) return [];
            const n = Math.max(6, Math.floor(Number(maxPoints) || 72));
            const slice = priced.slice(Math.max(0, priced.length - n));
            const out = [];
            for (let i = 1; i < slice.length; i++) {
                const prev = slice[i - 1];
                const cur = slice[i];
                if (!prev || !cur) continue;
                if (!(prev.price > 0) || !(cur.price > 0)) continue;
                const r = Math.log(cur.price / prev.price);
                if (!Number.isFinite(r)) continue;
                out.push({ tMs: cur.tMs, r });
            }
            return out;
        };

        const correlationAligned = (a, b) => {
            const mapB = new Map(b.map(x => [x.tMs, x.r]));
            const xs = [];
            const ys = [];
            for (const x of a) {
                if (!x || !Number.isFinite(x.tMs) || !Number.isFinite(x.r)) continue;
                const y = mapB.get(x.tMs);
                if (typeof y !== 'number' || !Number.isFinite(y)) continue;
                xs.push(x.r);
                ys.push(y);
            }
            const n = xs.length;
            if (n < 12) return { corr: null, n };
            const mx = xs.reduce((s, v) => s + v, 0) / n;
            const my = ys.reduce((s, v) => s + v, 0) / n;
            let cov = 0;
            let vx = 0;
            let vy = 0;
            for (let i = 0; i < n; i++) {
                const dx = xs[i] - mx;
                const dy = ys[i] - my;
                cov += dx * dy;
                vx += dx * dx;
                vy += dy * dy;
            }
            const denom = Math.sqrt(vx * vy);
            if (!(denom > 0) || !Number.isFinite(denom)) return { corr: null, n };
            const c = cov / denom;
            return { corr: Number.isFinite(c) ? Math.max(-1, Math.min(1, c)) : null, n };
        };

        const sentinelSymbols = {
            audusd: pickBestByMatchers([/^AUD\/USD\b/i]) || findAssetSymbol(data, /^AUD\/USD\b/i),
            nzdusd: pickBestByMatchers([/^NZD\/USD\b/i]) || findAssetSymbol(data, /^NZD\/USD\b/i),
            usdcad: pickBestByMatchers([/^USD\/CAD\b/i]) || findAssetSymbol(data, /^USD\/CAD\b/i),
            usdrub: pickBestByMatchers([/^USD\/RUB\b/i]) || findAssetSymbol(data, /^USD\/RUB\b/i),
            usdjpy: pickBestByMatchers([/^USD\/JPY\b/i]) || findAssetSymbol(data, /^USD\/JPY\b/i),
            usdchf: pickBestByMatchers([/^USD\/CHF\b/i]) || findAssetSymbol(data, /^USD\/CHF\b/i),
            usdsek: pickBestByMatchers([/^USD\/SEK\b/i]) || findAssetSymbol(data, /^USD\/SEK\b/i),
            dxy: aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i]) || findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index)/i),
            vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || findAssetSymbol(data, /^\.?VIX(9D)?$/i),
            vhsi: aliasSym('VHSI') || pickBestByMatchers([/^\.?VHSI/i, /\bHang\s*Seng\b.*Vol/i]) || findAssetSymbol(data, /^\.?VHSI/i),
            brent: aliasSym('BRENT') || pickBestByMatchers([/\bBrent\b/i, /^(LCO|BRN)c\d/i, /^BZ=F$/i]) || findAssetSymbol(data, /\bBrent\b/i),
            wti: aliasSym('WTI') || pickBestByMatchers([/\bWTI\b/i, /^CL=F$/i, /^CLc\d/i]) || findAssetSymbol(data, /\bWTI\b/i),
            usdbbrl: symOf('USD_BRL', /^USD\/BRL\b/i),
            usdcnh: pickBestByMatchers([/^USD\/CNH\b/i, /^USD\/CNY\b/i]) || findAssetSymbol(data, /^USD\/CNH\b/i) || findAssetSymbol(data, /^USD\/CNY\b/i),
            usdmxn: pickBestByMatchers([/^USD\/MXN\b/i]) || findAssetSymbol(data, /^USD\/MXN\b/i),
            usdzar: pickBestByMatchers([/^USD\/ZAR\b/i]) || findAssetSymbol(data, /^USD\/ZAR\b/i),
            usdclp: pickBestByMatchers([/^USD\/CLP\b/i]) || findAssetSymbol(data, /^USD\/CLP\b/i),
            usdtry: pickBestByMatchers([/^USD\/TRY\b/i]) || findAssetSymbol(data, /^USD\/TRY\b/i),
            spx: symBest('SPX', [/(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i]),
            ndx: symBest('NDX', [/(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i]),
            hyg: rcKey('ETF_HYG', /^HYG(\.\w+)?$/i) || symBest('HYG', [/^HYG(\.\w+)?$/i]),
            eem: symBest('EEM', [/^EEM(\.\w+)?$/i]) || symBest('VWO', [/^VWO(\.\w+)?$/i]),
            btc: symBest('BTC', [/^BTC\/USD$/i, /\bbitcoin\b/i]),
        };

        const weightedAvg = (items) => {
            const pairs = (items || [])
                .map(x => ({ v: x && typeof x.val === 'number' && Number.isFinite(x.val) ? x.val : null, w: x && typeof x.weight === 'number' && Number.isFinite(x.weight) ? x.weight : 1 }))
                .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0);
            const wsum = pairs.reduce((a, b) => a + b.w, 0);
            if (!(wsum > 0)) return null;
            const s = pairs.reduce((a, b) => a + b.v * b.w, 0);
            const score = s / wsum;
            return Number.isFinite(score) ? score : null;
        };

        const betaPosItems = [
            { label: 'AUD/USD', symbol: sentinelSymbols.audusd, sign: +1, weight: 1.0 },
            { label: 'NZD/USD', symbol: sentinelSymbols.nzdusd, sign: +1, weight: 1.0 },
            { label: 'USD/CAD', symbol: sentinelSymbols.usdcad, sign: -1, weight: 1.0 },
            { label: 'USD/RUB', symbol: sentinelSymbols.usdrub, sign: -1, weight: 1.0 },
            { label: 'SPX', symbol: sentinelSymbols.spx, sign: +1, weight: 0.55 },
            { label: 'NDX', symbol: sentinelSymbols.ndx, sign: +1, weight: 0.55 },
            { label: 'HYG', symbol: sentinelSymbols.hyg, sign: +1, weight: 0.45 },
            { label: 'EEM/VWO', symbol: sentinelSymbols.eem, sign: +1, weight: 0.35 },
            { label: 'Cobre', symbol: symOf('COPPER', /(^HG=F$|^HGc\d(=\$)?$|^HG$|Copper|\bCobre\b|^CPER(\b|$))/i), sign: +1, weight: 0.25 },
            { label: 'BTC', symbol: sentinelSymbols.btc, sign: +1, weight: 0.20 },
        ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
            .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

        const betaNegItems = [
            { label: 'USD/JPY', symbol: sentinelSymbols.usdjpy, sign: -1, weight: 0.90 },
            { label: 'USD/CHF', symbol: sentinelSymbols.usdchf, sign: -1, weight: 0.90 },
            { label: 'USD/SEK', symbol: sentinelSymbols.usdsek, sign: -1, weight: 0.90 },
            { label: 'USD/CNH', symbol: sentinelSymbols.usdcnh, sign: +1, weight: 0.50 },
            { label: 'USD/MXN', symbol: sentinelSymbols.usdmxn, sign: +1, weight: 0.35 },
            { label: 'USD/ZAR', symbol: sentinelSymbols.usdzar, sign: +1, weight: 0.35 },
            { label: 'USD/CLP', symbol: sentinelSymbols.usdclp, sign: +1, weight: 0.25 },
            { label: 'USD/TRY', symbol: sentinelSymbols.usdtry, sign: +1, weight: 0.25 },
            { label: 'DXY', symbol: sentinelSymbols.dxy, sign: +1, weight: 1.0 },
            { label: 'VIX', symbol: sentinelSymbols.vix, sign: +1, weight: 1.0 },
            { label: 'VHSI', symbol: sentinelSymbols.vhsi, sign: +1, weight: 0.80 },
        ].map(x => ({ ...x, raw: getChangePct(data, x.symbol) }))
            .map(x => ({ ...x, val: x.raw === null ? null : x.sign * x.raw }));

        const betaPosScore = weightedAvg(betaPosItems);
        const betaNegScore = (() => {
            const scoreBase = weightedAvg(betaNegItems);
            if (!(typeof scoreBase === 'number' && Number.isFinite(scoreBase))) return null;
            let score = scoreBase;
            const vixItem = betaNegItems.find(x => x.label === 'VIX');
            const vhsiItem = betaNegItems.find(x => x.label === 'VHSI');
            const vixUp = vixItem && typeof vixItem.raw === 'number' && vixItem.raw >= 1.5;
            const vhsiUp = vhsiItem && typeof vhsiItem.raw === 'number' && vhsiItem.raw >= 1.5;
            if (vixUp && vhsiUp) score += 0.2;
            return score;
        })();
        const betaDelta = (typeof betaPosScore === 'number' ? betaPosScore : 0) - (typeof betaNegScore === 'number' ? betaNegScore : 0);

        const wti = getChangePct(data, sentinelSymbols.wti);
        const brent = getChangePct(data, sentinelSymbols.brent);
        const oilVals = [wti, brent].filter(v => typeof v === 'number' && Number.isFinite(v));
        const oilScore = oilVals.length ? Math.max(...oilVals) : null;

        const neutralThreshold = 0.12;
        const usdmxnPct = getChangePct(data, sentinelSymbols.usdmxn);
        const usdzarPct = getChangePct(data, sentinelSymbols.usdzar);
        const emCoreState =
            typeof usdmxnPct === 'number' && typeof usdzarPct === 'number'
                ? usdmxnPct > neutralThreshold && usdzarPct > neutralThreshold
                    ? 'Stress EM (USD/EM ↑)'
                    : usdmxnPct < -neutralThreshold && usdzarPct < -neutralThreshold
                        ? 'Bid EM (USD/EM ↓)'
                        : 'EM misto'
                : 'EM N/A';

        const usdclpPct = getChangePct(data, sentinelSymbols.usdclp);
        const usdtryPct = getChangePct(data, sentinelSymbols.usdtry);

        const emBasketComponents = [
            { label: 'USD/MXN', v: usdmxnPct, w: 0.35 },
            { label: 'USD/ZAR', v: usdzarPct, w: 0.35 },
            { label: 'USD/CLP', v: usdclpPct, w: 0.15 },
            { label: 'USD/TRY', v: usdtryPct, w: 0.15 },
        ].filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && x.w > 0);

        const emBasketPct = emBasketComponents.length >= 2
            ? (() => {
                const wSum = emBasketComponents.reduce((s, x) => s + x.w, 0);
                if (!(wSum > 0)) return null;
                const v = emBasketComponents.reduce((s, x) => s + (x.v * x.w), 0) / wSum;
                return Number.isFinite(v) ? v : null;
            })()
            : null;

        const emBasketState =
            typeof emBasketPct === 'number'
                ? emBasketPct > neutralThreshold
                    ? 'Stress EM (Basket USD/EM ↑)'
                    : emBasketPct < -neutralThreshold
                        ? 'Bid EM (Basket USD/EM ↓)'
                        : 'EM misto'
                : 'EM N/A';

        const emGateState = emBasketState !== 'EM N/A' ? emBasketState : emCoreState;
        const emGateLabel = emBasketState !== 'EM N/A' ? 'Basket' : 'MXN+ZAR';

        const flow = computeFlowScore(data);
        const regimeScore = Number(flow.score.toFixed(3));
        const regimeLabel = flow.label;
        const regimeOperational =
            regimeLabel === 'Risk-On'
                ? { wdo: 'VENDA', win: 'COMPRA', hint: 'Risk-on tende a WDO↓ / WIN↑ (filtro, não gatilho).' }
                : regimeLabel === 'Risk-Off'
                    ? { wdo: 'COMPRA', win: 'VENDA', hint: 'Risk-off tende a WDO↑ / WIN↓ (filtro, não gatilho).' }
                    : { wdo: '—', win: '—', hint: 'Regime indefinido (filtro, não gatilho).' };

        const nowMs = Date.now();
        const rows = assets.map(a => ({ a, last: getLastPoint(data, a.symbol) }));
        const withPrice = rows.filter(x => x.last && typeof x.last.price === 'number');
        const withTime = withPrice
            .map(x => {
                const t = x.last && x.last.t ? Date.parse(x.last.t) : NaN;
                return { ...x, tMs: Number.isFinite(t) ? t : null };
            })
            .filter(x => x.tMs !== null);

        const staleMs = 6 * 60 * 60 * 1000;
        const fresh = withTime.filter(x => nowMs - x.tMs <= staleMs);
        const coverageRatio = assets.length ? withPrice.length / assets.length : 0;
        const freshnessRatio = withTime.length ? fresh.length / withTime.length : 0;

        const criticalMatchers = [
            { k: 'USD/BRL', a: 'USD_BRL' },
            { k: 'WDO', r: /^WDO/i },
            { k: 'WIN', r: /^WIN/i },
            { k: 'IBOV', r: /(^\.BVSP$|\bIbovespa\b)/i },
            { k: 'EWZ', r: /^EWZ$/i },
            { k: 'BOVA11', r: /^BOVA11\.SA$/i },
            { k: 'DXY', a: 'DXY' },
            { k: 'VIX', a: 'VIX', r: /(^\.(VIX|VIX9D)$|\bVIX\b|CBOE Volatility Index)/i },
            { k: 'Brent/WTI', a: 'OIL' },
            { k: 'FXI', a: 'FXI' },
            { k: 'CSI300', a: 'CSI300' },
            { k: 'Minério', a: 'IRON' },
            { k: 'Soja', a: 'SOY' },
            { k: 'Cobre', a: 'COPPER' },
            { k: 'BR10Y', rc: 'BR_10Y', r: /^BR10YT=RR$/i },
        ];
        const suggestionMatchers = [
            { k: 'SPX', a: 'SPX', r: /(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i },
            { k: 'NDX', a: 'NDX', r: /(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i },
            { k: 'HYG', rc: 'ETF_HYG', r: /^HYG(\.\w+)?$/i },
            { k: 'TLT', rc: 'ETF_TLT', r: /^TLT(\.\w+)?$/i },
            { k: 'EEM/VWO', a: 'EEM', r: /^EEM(\.\w+)?$/i },
            { k: 'BTC', a: 'BTC', r: /^BTC\/USD$/i },
            { k: 'US2Y', rc: 'US_2Y', r: /^US2YT=RR$/i },
            { k: 'US10Y', rc: 'US_10Y', r: /^US10YT=RR$/i },
        ];

        const criticalHits = criticalMatchers.map(m => {
            const sym = m.rc
                ? rcKey(m.rc, m.r)
                : m.a
                    ? (findAliasSymbolBest(data, m.a) || findAliasSymbol(data, m.a) || (m.r ? findAssetSymbol(data, m.r) : null))
                    : findAssetSymbol(data, m.r);
            if (!sym) return { ok: false, hasChg: false };
            const hasChg = dc ? dc.symbolHasChangePct(dcDeps, data, sym) : (getChangePct(data, sym) !== null);
            return { ok: true, hasChg };
        });
        const suggestionHits = suggestionMatchers.map(m => {
            const sym = m.rc
                ? rcKey(m.rc, m.r)
                : m.a
                    ? (findAliasSymbolBest(data, m.a) || findAliasSymbol(data, m.a) || (m.r ? findAssetSymbol(data, m.r) : null))
                    : findAssetSymbol(data, m.r);
            if (!sym) return { ok: false, hasChg: false };
            const hasChg = dc ? dc.symbolHasChangePct(dcDeps, data, sym) : (getChangePct(data, sym) !== null);
            return { ok: true, hasChg };
        });
        const criticalUsable = criticalHits.filter(x => x.ok && x.hasChg).length;
        const criticalRatio = criticalMatchers.length ? criticalUsable / criticalMatchers.length : 0;
        const criticalMissing = criticalMatchers
            .map((m, i) => ({ k: m.k, ok: !!(criticalHits[i] && criticalHits[i].ok && criticalHits[i].hasChg) }))
            .filter(x => !x.ok)
            .map(x => x.k);
        const suggestionMissing = suggestionMatchers
            .map((m, i) => ({ k: m.k, ok: !!(suggestionHits[i] && suggestionHits[i].ok && suggestionHits[i].hasChg) }))
            .filter(x => !x.ok)
            .map(x => x.k);

        let convictionScore = 0.5 * coverageRatio + 0.3 * freshnessRatio + 0.2 * criticalRatio;
        const divergences = [];
        if (withTime.length >= 10 && freshnessRatio < 0.65) {
            convictionScore *= 0.9;
            divergences.push('Muitos ativos com atualização antiga (>6h) → convicção reduzida');
        }
        if (regimeLabel === 'Risk-On' && betaDelta < -0.15) divergences.push('Fluxo (risk-on) diverge do bloco de proteção (beta)');
        if (regimeLabel === 'Risk-Off' && betaDelta > 0.15) divergences.push('Fluxo (risk-off) diverge do bloco de apetite (beta)');
        if (typeof oilScore === 'number' && oilScore > 1.2) {
            const rub = betaPosItems.find(x => x.label === 'USD/RUB');
            if (rub && typeof rub.val === 'number' && rub.val < 0) divergences.push('Petróleo forte sem confirmação em RUB');
        }
        if (divergences.length) convictionScore *= 0.92;

        if ((emGateState === 'Stress EM (Basket USD/EM ↑)' || emGateState === 'Stress EM (USD/EM ↑)') && regimeLabel === 'Risk-On') {
            convictionScore *= 0.94;
            divergences.push(`Emergentes (${emGateLabel}) sugerem stress enquanto o regime aponta risk-on`);
        }
        if ((emGateState === 'Bid EM (Basket USD/EM ↓)' || emGateState === 'Bid EM (USD/EM ↓)') && regimeLabel === 'Risk-Off') {
            convictionScore *= 0.94;
            divergences.push(`Emergentes (${emGateLabel}) sugerem bid enquanto o regime aponta risk-off`);
        }

        const usdcnhPct = getChangePct(data, sentinelSymbols.usdcnh);
        if (typeof usdcnhPct === 'number' && Number.isFinite(usdcnhPct) && usdcnhPct > 0.12 && regimeLabel === 'Risk-On') {
            convictionScore *= 0.94;
            divergences.push('USD/CNH sugere stress de China/EM enquanto o regime aponta risk-on');
        }

        const fxiSym = symOf('FXI', /^FXI$/i);
        const csiSym = symOf('CSI300', /^CSI300$/i);
        const ironSym = symOf('IRON', /^DCE_I0$/i);
        const soySym = symOf('SOY', /^ZS$/i);
        const copperSym = symOf('COPPER', /^HG$/i);

        const hasFxi = !!(fxiSym && (dc ? dc.symbolHasChangePct(dcDeps, data, fxiSym) : (getChangePct(data, fxiSym) !== null)));
        const hasCsi = !!(csiSym && (dc ? dc.symbolHasChangePct(dcDeps, data, csiSym) : (getChangePct(data, csiSym) !== null)));
        const hasChinaCore = hasFxi || hasCsi;
        const hasIron = !!(ironSym && (dc ? dc.symbolHasChangePct(dcDeps, data, ironSym) : (getChangePct(data, ironSym) !== null)));
        const hasSoy = !!(soySym && (dc ? dc.symbolHasChangePct(dcDeps, data, soySym) : (getChangePct(data, soySym) !== null)));
        const hasCopper = !!(copperSym && (dc ? dc.symbolHasChangePct(dcDeps, data, copperSym) : (getChangePct(data, copperSym) !== null)));

        let downgrade = 0;
        if (!hasChinaCore) {
            convictionScore *= 0.85;
            downgrade += 1;
            divergences.push('China proxies críticos ausentes (FXI/CSI300) → convicção reduzida');
        } else if (!(hasFxi && hasCsi)) {
            convictionScore *= 0.94;
            divergences.push('China proxies parciais (FXI/CSI300) → leitura menos confiável');
        }
        if (!hasIron) {
            convictionScore *= 0.92;
            divergences.push('Commodities BR incompletas: Minério ausente → convicção reduzida');
            downgrade += 1;
        } else if (!hasSoy) {
            convictionScore *= 0.96;
            divergences.push('Commodities BR parciais: Soja ausente');
        }
        if (!hasCopper) {
            convictionScore *= 0.985;
            divergences.push('Commodities BR parciais: Cobre ausente');
        }

        convictionScore = Math.max(0, Math.min(1, convictionScore));
        const baseLabel = convictionScore >= 0.75 ? 'ALTA' : convictionScore >= 0.55 ? 'MÉDIA' : 'BAIXA';
        const convictionLabel = downgrade ? downgradeConvictionLabel(baseLabel, downgrade) : baseLabel;
        const convictionTone = convictionLabel === 'ALTA' ? 'positive' : convictionLabel === 'MÉDIA' ? 'neutral' : 'negative';

        const convictionAssets = {
            wdo: findAssetSymbol(data, /^WDO/i),
            win: findAssetSymbol(data, /^WIN/i),
            usdbrl: findAliasSymbol(data, 'USD_BRL') || findAssetSymbol(data, /^USD\/BRL\b/i),
            dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY') || findAssetSymbol(data, /(^USDX$|^\.DXY$|\bDXY\b|US Dollar Index|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i),
            vix: sentinelSymbols.vix,
            oil: findAliasSymbolBest(data, 'OIL') || findAliasSymbol(data, 'OIL') || findAliasSymbolBest(data, 'BRENT') || findAliasSymbolBest(data, 'WTI') || findAssetSymbol(data, /\bBrent\b|\bWTI\b/i),
            us10y: rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i),
            spx: sentinelSymbols.spx,
            ndx: sentinelSymbols.ndx,
            hyg: sentinelSymbols.hyg,
            gold: findAliasSymbolBest(data, 'GOLD') || findAliasSymbol(data, 'GOLD') || findAssetSymbol(data, /(^XAU\/USD\b|GC=F|\bouro\b)/i),
            usdcnh: sentinelSymbols.usdcnh,
            eem: sentinelSymbols.eem,
            btc: sentinelSymbols.btc,
            iron: ironSym || findAliasSymbol(data, 'IRON'),
            copper: copperSym || findAliasSymbol(data, 'COPPER'),
        };

        const drivers = [];
        drivers.push({ k: 'Risco (tags)', v: regimeScore, fmt: x => formatNumber(x, 2), tone: regimeScore > 0.35 ? 'positive' : regimeScore < -0.35 ? 'negative' : 'neutral' });
        drivers.push({ k: 'Beta Δ', v: betaDelta, fmt: x => formatNumber(x, 3), tone: betaDelta > 0.25 ? 'positive' : betaDelta < -0.25 ? 'negative' : 'neutral' });
        drivers.push({ k: 'Apetite (beta)', v: betaPosScore, fmt: x => formatNumber(x, 3), tone: betaPosScore === null ? 'neutral' : betaPosScore > 0.15 ? 'positive' : betaPosScore < -0.15 ? 'negative' : 'neutral' });
        drivers.push({ k: 'Proteção (beta)', v: betaNegScore, fmt: x => formatNumber(x, 3), tone: betaNegScore === null ? 'neutral' : betaNegScore > 0.15 ? 'negative' : betaNegScore < -0.15 ? 'positive' : 'neutral' });
        if (sentinelSymbols.dxy) {
            const dxy = getChangePct(data, sentinelSymbols.dxy);
            drivers.push({ k: 'DXY', v: dxy, fmt: x => formatPercent(x, 2), tone: dxy === null ? 'neutral' : dxy > 0 ? 'positive' : dxy < 0 ? 'negative' : 'neutral' });
        }
        if (sentinelSymbols.vix) {
            const vix = getChangePct(data, sentinelSymbols.vix);
            drivers.push({ k: 'VIX', v: vix, fmt: x => formatPercent(x, 2), tone: vix === null ? 'neutral' : vix > 0 ? 'negative' : vix < 0 ? 'positive' : 'neutral' });
        }
        if (typeof oilScore === 'number') drivers.push({ k: 'Petróleo', v: oilScore, fmt: x => formatPercent(x, 2), tone: oilScore > 0 ? 'positive' : oilScore < 0 ? 'negative' : 'neutral' });
        if (sentinelSymbols.usdbbrl) {
            const brl = getChangePct(data, sentinelSymbols.usdbbrl);
            drivers.push({ k: 'USD/BRL', v: brl, fmt: x => formatPercent(x, 2), tone: brl === null ? 'neutral' : brl > 0 ? 'positive' : brl < 0 ? 'negative' : 'neutral' });
        }
        if (sentinelSymbols.usdcnh) {
            const cnh = getChangePct(data, sentinelSymbols.usdcnh);
            drivers.push({ k: 'USD/CNH', v: cnh, fmt: x => formatPercent(x, 2), tone: cnh === null ? 'neutral' : cnh > 0 ? 'positive' : cnh < 0 ? 'negative' : 'neutral' });
        }
        if (typeof emBasketPct === 'number') {
            drivers.push({ k: 'EM Basket (USD/EM)', v: emBasketPct, fmt: x => formatPercent(x, 2), tone: emBasketPct > 0 ? 'positive' : emBasketPct < 0 ? 'negative' : 'neutral' });
        }
        if (sentinelSymbols.usdmxn) {
            drivers.push({ k: 'USD/MXN', v: usdmxnPct, fmt: x => formatPercent(x, 2), tone: usdmxnPct === null ? 'neutral' : usdmxnPct > 0 ? 'positive' : usdmxnPct < 0 ? 'negative' : 'neutral' });
        }
        if (sentinelSymbols.usdzar) {
            drivers.push({ k: 'USD/ZAR', v: usdzarPct, fmt: x => formatPercent(x, 2), tone: usdzarPct === null ? 'neutral' : usdzarPct > 0 ? 'positive' : usdzarPct < 0 ? 'negative' : 'neutral' });
        }
        if (sentinelSymbols.usdclp) {
            drivers.push({ k: 'USD/CLP', v: usdclpPct, fmt: x => formatPercent(x, 2), tone: usdclpPct === null ? 'neutral' : usdclpPct > 0 ? 'positive' : usdclpPct < 0 ? 'negative' : 'neutral' });
        }
        if (sentinelSymbols.usdtry) {
            drivers.push({ k: 'USD/TRY', v: usdtryPct, fmt: x => formatPercent(x, 2), tone: usdtryPct === null ? 'neutral' : usdtryPct > 0 ? 'positive' : usdtryPct < 0 ? 'negative' : 'neutral' });
        }

        const corrBrlMxn = sentinelSymbols.usdbbrl && sentinelSymbols.usdmxn
            ? correlationAligned(buildReturnSeries(sentinelSymbols.usdbbrl, 96), buildReturnSeries(sentinelSymbols.usdmxn, 96))
            : { corr: null, n: 0 };
        const corrBrlZar = sentinelSymbols.usdbbrl && sentinelSymbols.usdzar
            ? correlationAligned(buildReturnSeries(sentinelSymbols.usdbbrl, 96), buildReturnSeries(sentinelSymbols.usdzar, 96))
            : { corr: null, n: 0 };
        const corrBrlEmBasket = (() => {
            if (!sentinelSymbols.usdbbrl) return { corr: null, n: 0 };
            const basketSymbols = [
                { symbol: sentinelSymbols.usdmxn, w: 0.35 },
                { symbol: sentinelSymbols.usdzar, w: 0.35 },
                { symbol: sentinelSymbols.usdclp, w: 0.15 },
                { symbol: sentinelSymbols.usdtry, w: 0.15 },
            ].filter(x => !!x.symbol && typeof x.w === 'number' && x.w > 0);
            if (basketSymbols.length < 2) return { corr: null, n: 0 };

            const seriesByT = basketSymbols.map(x => ({
                w: x.w,
                map: new Map(buildReturnSeries(x.symbol, 96).map(p => [p.tMs, p.r])),
            }));
            const wSum = seriesByT.reduce((s, x) => s + x.w, 0);
            if (!(wSum > 0)) return { corr: null, n: 0 };

            const ref = buildReturnSeries(sentinelSymbols.usdbbrl, 96);
            const basket = [];
            for (const p of ref) {
                if (!p || !Number.isFinite(p.tMs)) continue;
                let sum = 0;
                let wAcc = 0;
                let n = 0;
                for (const s of seriesByT) {
                    const r = s.map.get(p.tMs);
                    if (typeof r !== 'number' || !Number.isFinite(r)) continue;
                    sum += r * s.w;
                    wAcc += s.w;
                    n += 1;
                }
                if (n < 2 || !(wAcc > 0)) continue;
                const v = sum / wAcc;
                if (!Number.isFinite(v)) continue;
                basket.push({ tMs: p.tMs, r: v });
            }
            return correlationAligned(ref, basket);
        })();
        const corrTone = c => (typeof c === 'number' && Number.isFinite(c) ? (c > 0.4 ? 'positive' : c < -0.4 ? 'negative' : 'neutral') : 'neutral');
        const corrBadge = (c, n) => (typeof c === 'number' && Number.isFinite(c))
            ? toneBadgeHtmlFromTone(corrTone(c), c, `${formatNumber(c, 2)} (n=${n})`, { maxAbs: 1 })
            : toneBadgeHtmlFromTone('neutral', 0, '—', { maxAbs: 1 });

        const listHtml = `
        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Por quê</div>
            ${drivers
                .filter(d0 => d0.v !== null && d0.v !== undefined)
                .map(d0 => {
                    const txt = d0.v === null ? '—' : d0.fmt(d0.v);
                    const maxAbs = String(txt).includes('%') ? 5 : 1;
                    const badge = toneBadgeHtmlFromTone(d0.tone, d0.v, txt, { maxAbs });
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:800;">${escapeHtml(d0.k)}</div>
                        <div style="font-family:'Share Tech Mono',monospace;">${badge}</div>
                    </div>`;
                })
                .join('')}
            ${divergences.length
                ? `<div style="margin-top:10px;opacity:.92;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
                    <div style="font-weight:900;letter-spacing:1px;margin-bottom:6px;">Divergências</div>
                    ${divergences.map(t => `<div style="opacity:.9;line-height:1.35;">• ${escapeHtml(t)}</div>`).join('')}
                </div>`
                : ''}
        </div>
        <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Emergentes (Fluxo)</div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(emGateState)}</div>
            </div>
            <div style="margin-top:6px;opacity:.80;font-size:12px;line-height:1.35;">Core: ${escapeHtml(emCoreState)} • Basket: ${escapeHtml(emBasketState)}${typeof emBasketPct === 'number' ? ` (${escapeHtml(formatPercent(emBasketPct, 2))})` : ''}</div>
            <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="opacity:.9;font-weight:800;">Corr USD/BRL × EM Basket</div>
                    <div style="font-family:'Share Tech Mono',monospace;">${corrBadge(corrBrlEmBasket.corr, corrBrlEmBasket.n)}</div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="opacity:.9;font-weight:800;">Corr USD/BRL × USD/MXN</div>
                    <div style="font-family:'Share Tech Mono',monospace;">${corrBadge(corrBrlMxn.corr, corrBrlMxn.n)}</div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <div style="opacity:.9;font-weight:800;">Corr USD/BRL × USD/ZAR</div>
                    <div style="font-family:'Share Tech Mono',monospace;">${corrBadge(corrBrlZar.corr, corrBrlZar.n)}</div>
                </div>
            </div>
            <div style="margin-top:10px;opacity:.82;font-size:12px;">Correlação calculada em retornos log (últimos pontos com timestamp coincidente). Basket pondera MXN/ZAR (núcleo) + CLP/TRY (redução de ruído).</div>
        </div>
    `;

        const html = `
        <div class="metrics-grid" style="margin:0;">
            <div class="metric-card">
                <div class="metric-icon">🧭</div>
                <div class="metric-value">${escapeHtml(regimeLabel)}</div>
                <div class="metric-label">Regime</div>
                <div class="metric-change">${toneBadgeHtmlFromTone(regimeScore > 0.35 ? 'positive' : regimeScore < -0.35 ? 'negative' : 'neutral', regimeScore, formatNumber(regimeScore, 2), { maxAbs: 1 })}</div>
                <div style="margin-top:8px;opacity:.88;font-size:12px;line-height:1.25;">
                    <span style="font-weight:900;letter-spacing:.8px;">WDO ${escapeHtml(regimeOperational.wdo)}</span>
                    <span style="opacity:.75;"> • </span>
                    <span style="font-weight:900;letter-spacing:.8px;">WIN ${escapeHtml(regimeOperational.win)}</span>
                    <div style="margin-top:6px;opacity:.8;">${escapeHtml(regimeOperational.hint)}</div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">🧱</div>
                <div class="metric-value">${escapeHtml(convictionLabel)}</div>
                <div class="metric-label">Convicção</div>
                <div class="metric-change">${toneBadgeHtmlFromTone(convictionTone, convictionScore * 100, `${formatNumber(convictionScore * 100, 0)}%`, { maxAbs: 100 })}</div>
                <div style="margin-top:8px;opacity:.88;font-size:12px;line-height:1.25;">
                    <div style="opacity:.85;">Base: ${escapeHtml(convictionAssets.wdo || 'WDO N/A')} • ${escapeHtml(convictionAssets.win || 'WIN N/A')}</div>
                    <div style="opacity:.80;">Chaves: ${escapeHtml([convictionAssets.usdbrl, convictionAssets.dxy, convictionAssets.vix, convictionAssets.us10y, convictionAssets.spx, convictionAssets.ndx, convictionAssets.hyg, convictionAssets.eem, convictionAssets.usdcnh, convictionAssets.btc, convictionAssets.gold, convictionAssets.iron, convictionAssets.copper, convictionAssets.oil].filter(Boolean).join(' • ') || '—')}</div>
                    ${criticalMissing.length ? `<div style="margin-top:6px;opacity:.78;">Faltando (core): ${escapeHtml(criticalMissing.slice(0, 10).join(' • '))}${criticalMissing.length > 10 ? `… +${escapeHtml(String(criticalMissing.length - 10))}` : ''}</div>` : ''}
                    ${suggestionMissing.length ? `<div style="margin-top:4px;opacity:.72;">Sugestões p/ carteira: ${escapeHtml(suggestionMissing.slice(0, 10).join(' • '))}${suggestionMissing.length > 10 ? `… +${escapeHtml(String(suggestionMissing.length - 10))}` : ''}</div>` : ''}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">🧾</div>
                <div class="metric-value">${escapeHtml(formatNumber(coverageRatio * 100, 0))}%</div>
                <div class="metric-label">Cobertura (preço)</div>
                <div class="metric-change neutral">${escapeHtml(`${withPrice.length}/${assets.length}`)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">⏱️</div>
                <div class="metric-value">${escapeHtml(formatNumber(freshnessRatio * 100, 0))}%</div>
                <div class="metric-label">Atualização (&lt;6h)</div>
                <div class="metric-change neutral">${escapeHtml(`${fresh.length}/${withTime.length || 0}`)}</div>
            </div>
        </div>
        ${listHtml}
    `;

        if (operationalInputs && typeof operationalInputs === 'object') {
            operationalInputs.regime = {
                label: regimeLabel,
                score: regimeScore,
                convictionLabel,
                convictionScore,
                operational: regimeOperational,
                divergences,
                updatedAt: (data && data.meta && data.meta.generatedAt) ? String(data.meta.generatedAt) : null,
            };
        }
        try {
            if (operationalInputs && typeof operationalInputs === 'object') {
                const aliasSymLocal = k => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);
                const pctOfAlias = k => {
                    const s = aliasSymLocal(k);
                    return s ? getChangePct(data, s) : null;
                };
                const pctOfSym = s => (s ? getChangePct(data, s) : null);
                const dxyPct = pctOfAlias('DXY');
                const oilPct = pctOfAlias('OIL');
                const ironPct = pctOfAlias('IRON');
                const soyPct = pctOfAlias('SOY');
                const copperPct = pctOfAlias('COPPER');
                const us10yPct = pctOfSym(rcKey('US_10Y', /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i));
                const br10yPct = pctOfSym(rcKey('BR_10Y', /^BR10YT=RR$/i));
                const weights = { iron: 0.28, soy: 0.20, oil: 0.18, copper: 0.12 };
                const basketParts = [
                    { v: ironPct, w: weights.iron },
                    { v: soyPct, w: weights.soy },
                    { v: oilPct, w: weights.oil },
                    { v: copperPct, w: weights.copper },
                ].filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && x.w > 0);
                const wSum = basketParts.reduce((s, x) => s + x.w, 0);
                const exportScore = wSum > 0 ? basketParts.reduce((s, x) => s + (x.v * x.w), 0) / wSum : null;
                const tipsEtfPct = pctOfSym(rcKey('ETF_TIP', /^TIP$/i));
                const zqCurve = (() => {
                    try {
                        return w.ZQ_CURVE_DATA || null;
                    } catch {
                        return null;
                    }
                })();
                const zqSlope = zqCurve && typeof zqCurve.slopePct === 'number' && Number.isFinite(zqCurve.slopePct) ? zqCurve.slopePct : null;
                const zqRisk = zqCurve && zqCurve.riskMode ? String(zqCurve.riskMode) : null;
                const zqCount = zqCurve && typeof zqCurve.contractCount === 'number' && Number.isFinite(zqCurve.contractCount) ? zqCurve.contractCount : null;
                const flowSentinel = data && data.meta && data.meta.flowSentinel ? data.meta.flowSentinel : null;
                const fsComposite = flowSentinel && typeof flowSentinel.composite === 'number' && Number.isFinite(flowSentinel.composite) ? flowSentinel.composite : null;
                const fsDelta = flowSentinel && typeof flowSentinel.delta === 'number' && Number.isFinite(flowSentinel.delta) ? flowSentinel.delta : null;
                const fsMode = flowSentinel && typeof flowSentinel.regime === 'object' && flowSentinel.regime && typeof flowSentinel.regime.mode === 'string'
                    ? String(flowSentinel.regime.mode)
                    : null;
                const fsLabel = flowSentinel && typeof flowSentinel.regime === 'object' && flowSentinel.regime && typeof flowSentinel.regime.label === 'string'
                    ? String(flowSentinel.regime.label)
                    : null;
                const fsNeutralThreshold = flowSentinel && typeof flowSentinel.neutralThreshold === 'number' && Number.isFinite(flowSentinel.neutralThreshold)
                    ? flowSentinel.neutralThreshold
                    : 0.12;
                const fsRiskScore = flowSentinel && flowSentinel.riskBlock && typeof flowSentinel.riskBlock.score === 'number' && Number.isFinite(flowSentinel.riskBlock.score)
                    ? flowSentinel.riskBlock.score
                    : null;
                const fsProtectionScore = flowSentinel && flowSentinel.protectionBlock && typeof flowSentinel.protectionBlock.score === 'number' && Number.isFinite(flowSentinel.protectionBlock.score)
                    ? flowSentinel.protectionBlock.score
                    : null;
                const fsRiskObserved = flowSentinel && flowSentinel.riskBlock && typeof flowSentinel.riskBlock.observed === 'number' && Number.isFinite(flowSentinel.riskBlock.observed)
                    ? flowSentinel.riskBlock.observed
                    : null;
                const fsProtectionObserved = flowSentinel && flowSentinel.protectionBlock && typeof flowSentinel.protectionBlock.observed === 'number' && Number.isFinite(flowSentinel.protectionBlock.observed)
                    ? flowSentinel.protectionBlock.observed
                    : null;
                const fsRiskState = flowSentinel && flowSentinel.riskBlock && flowSentinel.riskBlock.action && typeof flowSentinel.riskBlock.action.state === 'string'
                    ? String(flowSentinel.riskBlock.action.state)
                    : null;
                const fsProtectionState = flowSentinel && flowSentinel.protectionBlock && flowSentinel.protectionBlock.action && typeof flowSentinel.protectionBlock.action.state === 'string'
                    ? String(flowSentinel.protectionBlock.action.state)
                    : null;
                const fsDivergence = flowSentinel && flowSentinel.divergence && typeof flowSentinel.divergence.active === 'boolean'
                    ? flowSentinel.divergence.active
                    : false;
                operationalInputs.macro = {
                    flow: { label: regimeLabel, score: regimeScore },
                    betaDelta,
                    dxyPct,
                    oilPct: typeof oilScore === 'number' ? oilScore : null,
                    em: {
                        state: emGateState,
                        pct: typeof emBasketPct === 'number' ? emBasketPct : null,
                        corrUsdBrlEmBasket: { corr: corrBrlEmBasket.corr, n: corrBrlEmBasket.n },
                    },
                    exportScore,
                    yields: { us10yPct, br10yPct, tipsEtfPct },
                    zq: zqCurve ? { riskMode: zqRisk, slopePct: zqSlope, contractCount: zqCount, generatedAt: zqCurve.generatedAt || null } : null,
                    flowSentinel: flowSentinel
                        ? {
                            mode: fsMode,
                            label: fsLabel,
                            composite: fsComposite,
                            delta: fsDelta,
                            neutralThreshold: fsNeutralThreshold,
                            risk: { score: fsRiskScore, observed: fsRiskObserved, state: fsRiskState },
                            protection: { score: fsProtectionScore, observed: fsProtectionObserved, state: fsProtectionState },
                            divergence: fsDivergence,
                            generatedAt: flowSentinel.generatedAt || null,
                        }
                        : null,
                };
                operationalInputs.zqCurve = zqCurve;
            }
        } catch {
        }

        try { if (typeof renderOperationalBriefing === 'function') renderOperationalBriefing(); } catch { }
        try { if (typeof renderBtcOperationalBriefing === 'function') renderBtcOperationalBriefing(); } catch { }
        try { if (typeof renderHk50OperationalBriefing === 'function') renderHk50OperationalBriefing(); } catch { }
        try { if (typeof renderUsEquitiesOperationalBriefing === 'function') renderUsEquitiesOperationalBriefing(); } catch { }
        try { if (typeof renderCommoditiesOperationalBriefing === 'function') renderCommoditiesOperationalBriefing(); } catch { }

        el.innerHTML = html;
    }

    root.regimeConviction = { render };
    w.MercadoBlocks = root;
})();
