(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    const statusUi = () => (w.MercadoBlocks && w.MercadoBlocks.statusUi) ? w.MercadoBlocks.statusUi : null;

    const escapeHtml = (value) => {
        const ui = statusUi();
        if (ui && typeof ui.escapeHtml === 'function') return ui.escapeHtml(value);
        return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    };

    const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const clamp01 = (n) => clamp(n, 0, 1);
    const avg = (arr) => {
        const xs = Array.isArray(arr) ? arr.filter(isNum) : [];
        if (!xs.length) return null;
        return xs.reduce((s, x) => s + x, 0) / xs.length;
    };

    const formatNumber = (value, decimals = 2) => {
        const v = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(v)) return '—';
        const d = typeof decimals === 'number' && Number.isFinite(decimals) ? Math.max(0, Math.min(8, Math.round(decimals))) : 2;
        try {
            return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d }).format(v);
        } catch {
            return String(v.toFixed(d));
        }
    };

    const formatPercent = (value, decimals = 2) => {
        const v = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(v)) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${formatNumber(v, decimals)}%`;
    };

    const formatDateTime = (iso) => {
        const raw = iso ? String(iso) : '';
        if (!raw) return '—';
        const ms = Date.parse(raw);
        if (!Number.isFinite(ms)) return raw;
        try {
            return new Date(ms).toLocaleString('pt-BR', { hour12: false });
        } catch {
            return raw;
        }
    };

    const formatDateTimeLoose = (iso) => {
        const raw = iso ? String(iso) : '';
        if (!raw) return '—';
        const ms = Date.parse(raw);
        if (!Number.isFinite(ms)) return raw;
        try {
            return new Date(ms).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false });
        } catch {
            return raw;
        }
    };

    const formatBrlCompact = (value) => {
        const v = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(v)) return '—';
        const abs = Math.abs(v);
        const sign = v < 0 ? '-' : '';
        if (abs >= 1_000_000_000) return `${sign}R$${formatNumber(abs / 1_000_000_000, 2)}B`;
        if (abs >= 1_000_000) return `${sign}R$${formatNumber(abs / 1_000_000, 2)}M`;
        if (abs >= 1_000) return `${sign}R$${formatNumber(abs / 1_000, 2)}k`;
        return `${sign}R$${formatNumber(abs, 0)}`;
    };

    const pointPct = (p) => {
        if (w.MercadoUtils && typeof w.MercadoUtils.pointPct === 'function') return w.MercadoUtils.pointPct(p);
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

    const getLastPoint = (data, symbol) => {
        const s = String(symbol || '');
        const xs = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : null;
        if (!xs || !xs.length) return null;
        const asset = (data && Array.isArray(data.assets)) ? data.assets.find(a => String(a && a.symbol ? a.symbol : '') === s) : null;
        const name = asset && asset.name ? String(asset.name) : '';
        const isArrozRR = s === 'RR' && /\barroz\b|\brice\b/i.test(name);
        const isPlausible = (price) => {
            if (!isNum(price)) return false;
            if (isArrozRR && price < 5) return false;
            if (/(=RR|=R)\b/i.test(s)) return price > -100 && price < 100;
            if (s.includes('/')) return price > 0;
            return price > 0;
        };
        for (let i = xs.length - 1; i >= 0; i -= 1) {
            const p = xs[i];
            if (p && isPlausible(p.price)) return p;
        }
        return null;
    };

    const getMostRecentPointWithPrice = (data, symbol) => {
        const s = String(symbol || '');
        const xs = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : null;
        if (!xs || !xs.length) return null;
        const asset = (data && Array.isArray(data.assets)) ? data.assets.find(a => String(a && a.symbol ? a.symbol : '') === s) : null;
        const name = asset && asset.name ? String(asset.name) : '';
        const isArrozRR = s === 'RR' && /\barroz\b|\brice\b/i.test(name);
        const isPlausible = (price) => {
            if (!isNum(price)) return false;
            if (isArrozRR && price < 5) return false;
            if (/(=RR|=R)\b/i.test(s)) return price > -100 && price < 100;
            if (s.includes('/')) return price > 0;
            return price > 0;
        };
        const msOf = (iso) => {
            const t = iso ? Date.parse(String(iso)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
        let best = null;
        let bestAsOf = -Infinity;
        let bestT = -Infinity;
        let bestHasPct = 0;
        for (let i = 0; i < xs.length; i += 1) {
            const p = xs[i];
            if (!p || !isPlausible(p.price)) continue;
            const asOfMs = msOf(p.asOf);
            const tMs = msOf(p.t);
            const pct = pointPct(p);
            const hasPct = typeof pct === 'number' && Number.isFinite(pct) ? 1 : 0;
            if (asOfMs > bestAsOf
                || (asOfMs === bestAsOf && tMs > bestT)
                || (asOfMs === bestAsOf && tMs === bestT && hasPct > bestHasPct)
            ) {
                best = p;
                bestAsOf = asOfMs;
                bestT = tMs;
                bestHasPct = hasPct;
            }
        }
        return best;
    };

    const getChangePct = (data, symbol) => {
        const pt = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        return pointPct(pt);
    };

    const getMomentumPct = (data, symbol, lookbackMin) => {
        const s = String(symbol || '');
        const xs = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : null;
        if (!xs || !xs.length) return null;
        const lb = typeof lookbackMin === 'number' && Number.isFinite(lookbackMin) && lookbackMin > 0 ? lookbackMin : 30;
        let last = null;
        for (let i = xs.length - 1; i >= 0; i -= 1) {
            const p = xs[i];
            if (p && isNum(p.price)) { last = p; break; }
        }
        if (!last || !last.t) return null;
        const nowMs = Date.parse(String(last.t));
        if (!Number.isFinite(nowMs)) return null;
        const targetMs = nowMs - lb * 60000;
        let base = null;
        for (let i = xs.length - 1; i >= 0; i -= 1) {
            const p = xs[i];
            if (!p || !isNum(p.price) || !p.t) continue;
            const ms = Date.parse(String(p.t));
            if (!Number.isFinite(ms)) continue;
            if (ms <= targetMs) { base = p; break; }
        }
        if (!base) return null;
        if (!isNum(base.price) || base.price === 0) return null;
        return ((last.price - base.price) / base.price) * 100;
    };

    const symbolKey = (symbol) => String(symbol || '').trim().toUpperCase().replace(/\s+/g, ' ');

    const assetAliasMatchers = (key) => {
        const k = String(key || '').trim().toUpperCase();
        const map = {
            DXY: [/^USDX$/i, /^DX-Y\.NYB$/i, /^\.(DXY)\b/i, /\bUS Dollar Index\b/i, /\bDollar Index\b/i, /\bÍndice\s*Dólar\b/i, /\bIndice\s*Dolar\b/i],
            VIX: [/^\.(VIX|VIX9D)\b/i, /^VIX\b/i, /\bVolatility Index\b/i],
            VIX9D: [/^\.(VIX9D)\b/i, /\bVIX9D\b/i],
            VIX30: [/^\.(VIX)\b/i, /\bVIX\b/i],
            VVIX: [/^\.(VVIX)\b/i, /^VVIX\b/i],
            VXN: [/^\.(VXN)\b/i, /^VXN\b/i],
            VXEEM: [/^\.(VXEEM)\b/i, /^VXEEM\b/i],
            VXEWZ: [/^\.(VXEWZ)\b/i, /^VXEWZ\b/i],
            VXBR: [/^\.(VXBR)\b/i, /^VXBR\b/i],
            SPX: [/^ES=F$/i, /^MES=F$/i, /^ESc\d+$/i, /^MESc\d+$/i, /^\.(SPX)\b/i, /^SPY\b/i, /\bS&P 500\b/i, /\bS&P\s*500\s*Futures\b/i],
            NDX: [/^NQ=F$/i, /^MNQ=F$/i, /^NQc\d+$/i, /^MNQc\d+$/i, /^\.(NDX|IXIC)\b/i, /^QQQ\b/i, /\bNasdaq\b/i, /\bNasdaq\s*100\s*Futures\b/i],
            US10Y: [/^TNc1=$/i, /^\.(TNX)\b/i, /^US10YT=RR\b/i, /\bUnited States 10-Year\b/i, /\bEUA\b.*\b10\b/i],
            US2Y: [/^US2YT=RR\b/i, /\bUnited States 2-Year\b/i],
            US30Y: [/^US30YT=RR\b/i, /\bUnited States 30-Year\b/i],
            BR10Y: [/^DAPc1$/i, /^BR10YT=RR$/i, /\bBrazil\b.*\b10-Year\b/i, /\bBrasil\b.*\b10\b/i],
            CDS_BR5Y: [/^BRGV5YUSAC=R$/i, /\bCDS\b.*\bBrazil\b.*\b5Y\b/i, /\bCDS\b.*\bBrasil\b.*\b5Y\b/i, /\bCDS\b.*\bBR\b.*\b5Y\b/i, /^CDS.*BR.*5Y/i],
            USD_BRL: [/^USD\/BRL\b/i],
            USD_CNH: [/^USD\/CNH\b/i],
            USD_CNY: [/^USD\/CNY\b/i],
            USD_HKD: [/^USD\/HKD\b/i],
            BRENT: [/\bBrent\b/i, /\bBrent Oil\b/i],
            WTI: [/\bWTI\b/i, /\bCrude Oil WTI\b/i],
            GOLD: [/\bXAU\/USD\b/i, /\bGold\b/i],
            BTC: [/^BTC\/USD\b/i, /\bBitcoin\b/i],
            ETH: [/^ETH\/USD\b/i, /\bEthereum\b/i],
            IBOV: [/^\.(BVSP)\b/i, /\bIbovespa\b/i, /^BOVA11(\.SA)?$/i],
            HK50: [/\bHang Seng\b/i, /^HK50\b/i, /^HSI\b/i],
            HSTECH: [/^HSTECH\b/i, /\bHang Seng TECH\b/i],
            EWH: [/^EWH(\.\w+)?$/i, /\biShares MSCI Hong Kong\b/i],
            EWZ: [/^EWZ(\.\w+)?$/i],
            HYG: [/^HYG(\.\w+)?$/i],
            TLT: [/^TLT(\.\w+)?$/i],
            FXI: [/^FXI(\.\w+)?$/i, /\biShares\b.*\bChina\b/i],
            CSI300: [/^\.(CSI300)\b/i, /^CSI300\b/i, /^000300(\.SS)?$/i, /\bCSI\s*300\b/i, /^ASHR(\.\w+)?$/i],
            CHINA: [/^CHINA50\b/i, /^MCHI(\.\w+)?$/i, /^ASHR(\.\w+)?$/i, /^KWEB(\.\w+)?$/i, /\bMSCI\s*China\b/i],
            IRON: [/^DCE_I0$/i, /^TIO(=F)?$/i, /^TIOc1$/i, /^SM58F(c1)?$/i, /\bIron\s*Ore\b/i, /\bMin[ée]rio\b/i],
            SOY: [/^ZS(=F)?$/i, /^ZS$/i, /\bSoybeans?\b/i, /\bSoja\b/i],
            COPPER: [/^HG(=F)?$/i, /^HG$/i, /\bCopper\b/i, /\bCobre\b/i],
            BCI: [/^BCI(\.\w+)?$/i, /\bBCI\b/i],
            AUD_USD: [/^AUD\/USD\b/i],
            USD_CAD: [/^USD\/CAD\b/i],
            USD_ZAR: [/^USD\/ZAR\b/i],
            MINERS: [/^GDX(\.\w+)?$/i, /^NEM(\.\w+)?$/i, /^AU(\.\w+)?$/i, /^FNV(\.\w+)?$/i],
            HK10Y: [/^HK10YT=RR$/i, /\bHong\s*Kong\b.*\b10\b/i],
            HK1M: [/^HK1MT=RR$/i, /\bHong\s*Kong\b.*\b1\b.*\bm[eê]s\b/i, /\bHong\s*Kong\b.*\b1\b.*\bMonth\b/i],
            HK3M: [/^HK3MT=RR$/i, /\bHong\s*Kong\b.*\b3\b.*\bm[eê]s\b/i, /\bHong\s*Kong\b.*\b3\b.*\bMonth\b/i],
            CN10Y: [/^CN10YT=RR$/i, /\bChina\b.*\b10\b/i],
            CDS_CN5Y: [/^CNGV5YUSAC=R$/i, /\bChina\b.*\bCDS\b.*\b5\b/i, /^CDS.*CN.*5Y/i],
        };
        return map[k] ? map[k].slice() : [];
    };

    const mostRecentMs = (data, symbol) => {
        const pt = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
        const t = pt && pt.t ? Date.parse(String(pt.t)) : NaN;
        return Number.isFinite(t) ? t : -Infinity;
    };

    const findAssetSymbol = (data, matcher) => {
        if (!data || !Array.isArray(data.assets) || !(matcher instanceof RegExp)) return null;
        let best = null;
        let bestMs = -Infinity;
        for (const a of data.assets) {
            const sym = a && a.symbol ? String(a.symbol) : '';
            const name = a && a.name ? String(a.name) : '';
            if (!sym) continue;
            if (!matcher.test(sym) && !matcher.test(name)) continue;
            const ms = mostRecentMs(data, sym);
            if (ms > bestMs) { best = sym; bestMs = ms; }
        }
        return best;
    };

    const findAliasSymbol = (data, aliasKey) => {
        const matchers = assetAliasMatchers(aliasKey);
        for (const re of matchers) {
            const s = findAssetSymbol(data, re);
            if (s) return s;
        }
        return null;
    };

    const findAliasSymbolBest = (data, aliasKey) => {
        const matchers = assetAliasMatchers(aliasKey);
        let best = null;
        let bestMs = -Infinity;
        for (const re of matchers) {
            const s = findAssetSymbol(data, re);
            if (!s) continue;
            const ms = mostRecentMs(data, s);
            if (ms > bestMs) { best = s; bestMs = ms; }
        }
        return best;
    };

    const fallbackCard = (title, message) => {
        const t = escapeHtml(title || 'Indisponível');
        const m = escapeHtml(message || 'Falha ao renderizar.');
        return `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${t}</div>
            <div style="margin-top:8px;opacity:.88;line-height:1.35;">${m}</div>
        </div>`;
    };

    const safeRender = ({ id, label, fn }) => {
        try {
            fn();
        } catch {
            const el = id ? document.getElementById(id) : null;
            if (el) el.innerHTML = fallbackCard(label || 'Bloco', 'Falha ao renderizar o módulo.');
        }
    };

    w.MercadoUtils = { ...(w.MercadoUtils && typeof w.MercadoUtils === 'object' ? w.MercadoUtils : {}), safeRender };

    const toneFromValue = (v, { neutralAbs = 0.05 } = {}) => {
        if (!isNum(v)) return 'neutral';
        if (Math.abs(v) <= neutralAbs) return 'neutral';
        return v > 0 ? 'positive' : 'negative';
    };

    const toneBadgeHtmlFromTone = (tone, strength, text, { maxAbs = 5 } = {}) => {
        const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
        const w0 = isNum(strength) ? clamp(Math.abs(strength) / (isNum(maxAbs) && maxAbs > 0 ? maxAbs : 5), 0.2, 1) : 0.55;
        return `<span class="${cls}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:${String(0.75 + 0.25 * w0)};">${escapeHtml(text ?? '')}</span>`;
    };

    const toneBadgeHtml = (value, text, opts) => {
        const tone = toneFromValue(value, { neutralAbs: 0.05 });
        return toneBadgeHtmlFromTone(tone, value, text, opts);
    };

    const pillHtml = (kind, tone, text, strength = 0.65) => {
        const cls =
            kind === 'status'
                ? (tone === 'ok' ? 'edi-pill edi-pill--status-ok' : tone === 'warn' ? 'edi-pill edi-pill--status-warn' : tone === 'bad' ? 'edi-pill edi-pill--status-bad' : 'edi-pill edi-pill--status-info')
                : (tone === 'positive' || tone === 'risk_on' || tone === 'risk_on_local' ? 'edi-pill edi-pill--signal-pos' : tone === 'negative' || tone === 'risk_off' || tone === 'risk_off_local' ? 'edi-pill edi-pill--signal-neg' : 'edi-pill edi-pill--signal-neutral');
        const k = isNum(strength) ? clamp(strength, 0.35, 1) : 0.7;
        return `<span class="${escapeHtml(cls)}" style="--pill-k:${String(k)};"><span class="edi-pill__dot"></span><span>${escapeHtml(text ?? '')}</span></span>`;
    };

    const badge = (tone, text) => pillHtml('signal', tone, text, 0.7);

    const assetIcon = (asset) => {
        const a = asset && typeof asset === 'object' ? asset : {};
        const sym = String(a.symbol || '');
        const cat = String(a.category || '');
        if (/BTC|ETH|XRP|SOL|ADA/i.test(sym) || cat === 'crypto') return '₿';
        if (cat.startsWith('fx')) return '💱';
        if (cat === 'metals') return '🪙';
        if (cat === 'energy') return '⛽';
        if (cat === 'agriculture') return '🌾';
        if (cat === 'rates') return '📉';
        if (cat === 'volatility') return '⚡';
        if (cat === 'emerging') return '🌎';
        return '•';
    };

    const resolveTickerSymbol = (data, matchers) => {
        const list = Array.isArray(matchers) ? matchers : [];
        for (const re of list) {
            if (!(re instanceof RegExp)) continue;
            const s = findAssetSymbol(data, re);
            if (s) return s;
        }
        return null;
    };

    const formatTickerPrice = (symbol, price, fmt) => {
        if (!isNum(price)) return '—';
        const f = String(fmt || '');
        if (f === 'yield') return `${formatNumber(price, 2)}%`;
        if (f === 'fx') return formatNumber(price, 4);
        const s = String(symbol || '');
        if (/\/\w{3}\b/i.test(s) || s.includes('/')) return formatNumber(price, 4);
        if (price >= 1000) return formatNumber(price, 0);
        if (price >= 100) return formatNumber(price, 2);
        return formatNumber(price, 4);
    };

    const computeFlowScore = (data) => {
        const pre = data && data.meta && data.meta.flowSentinel ? data.meta.flowSentinel : null;
        const label = pre && pre.regime && typeof pre.regime.label === 'string' ? pre.regime.label : 'Neutro';
        const score = pre && isNum(pre.composite) ? pre.composite : pre && isNum(pre.delta) ? pre.delta : 0;
        return { label, score: clamp(score, -3, 3) };
    };

    const computeOperationalMacro = (data) => {
        const d = data || null;
        if (!d) return null;
        const updatedAt = d && d.meta && d.meta.generatedAt ? String(d.meta.generatedAt) : null;
        const pick = (aliasKey, matcher, { preferSymbols = [] } = {}) => {
            for (const s of (Array.isArray(preferSymbols) ? preferSymbols : [])) {
                const sym = String(s || '');
                if (sym && d.series && Array.isArray(d.series[sym]) && d.series[sym].length) return sym;
            }
            return findAliasSymbolBest(d, aliasKey) || findAliasSymbol(d, aliasKey) || (matcher instanceof RegExp ? findAssetSymbol(d, matcher) : null);
        };
        const pct = (symbol) => (symbol ? getChangePct(d, symbol) : null);
        const avgPct = (syms) => avg((Array.isArray(syms) ? syms : []).map(s => pct(s)).filter(isNum));

        const dxySym = pick('DXY', /(^\.DXY$|\bDXY\b|^USDX$|DX-Y\.NYB)/i, { preferSymbols: ['USDX'] });
        const dxyPct = pct(dxySym);

        const exportSyms = [
            pick('BRENT', /\bBrent\b/i),
            pick('WTI', /\bWTI\b/i),
            pick('IRON', /(^DCE_I0$|^TIOc1$|^SM58Fc1$|\bMin[ée]rio\b|\bIron\s*Ore\b)/i),
            pick('SOY', /^ZS(=F)?$/i),
            pick('COFFEE', /^KC(=F)?$/i),
            pick('SUGAR', /^SB(=F)?$/i),
        ].filter(Boolean);
        const exportScore = avgPct(exportSyms);

        const emSyms = [
            pick('FXI', /^FXI$/i),
            pick('EEM', /^EEM(\.\w+)?$/i),
            pick('VWO', /^VWO(\.\w+)?$/i),
        ].filter(Boolean);
        const emPct = avgPct(emSyms);

        const us10ySym = pick('US10Y', /(^TNc1=$|^US10YT=RR$|^\^TNX$|\bUS\s*10Y\b|^\.TNX$)/i, { preferSymbols: ['TNc1=', '.TNX'] });
        const br10ySym = pick('BR10Y', /(^BR10YT=RR$|^DAPc1$)/i, { preferSymbols: ['DAPc1'] });
        const us10yPct = pct(us10ySym);
        const br10yPct = pct(br10ySym);

        return {
            updatedAt,
            dxyPct,
            exportScore,
            em: { pct: emPct },
            yields: { us10yPct, br10yPct },
        };
    };

    const computeCategoryAverages = (data, groups) => {
        const out = [];
        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        for (const g of (groups || [])) {
            const cats = Array.isArray(g.categories) ? g.categories : [];
            const syms = assets.filter(a => cats.includes(String(a && a.category ? a.category : ''))).map(a => String(a.symbol || ''));
            const values = syms.map(s => getChangePct(data, s)).filter(isNum);
            out.push({ key: g.key, label: g.label, count: values.length, avg: values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : null });
        }
        return out;
    };

    const computeBrazilCdsHedgeSignal = (data) => {
        const sym = findAliasSymbolBest(data, 'CDS_BR5Y') || findAliasSymbol(data, 'CDS_BR5Y') || null;
        if (!sym) return null;
        const pctDay = getChangePct(data, sym);
        const pct60 = getMomentumPct(data, sym, 60);
        const pct15 = getMomentumPct(data, sym, 15);
        const pct = isNum(pct60) ? (pct60 * 0.65 + (isNum(pct15) ? pct15 * 0.35 : 0)) : (isNum(pct15) ? pct15 : pctDay);
        if (!isNum(pct)) return null;
        const score = clamp(pct / 0.35, -1, 1);
        const bias = score > 0.10 ? 'buy' : score < -0.10 ? 'sell' : 'neutral';

        const symUsdBrl = findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || null;
        const symIbov = findAliasSymbolBest(data, 'IBOV') || findAliasSymbol(data, 'IBOV') || null;
        const usdDay = symUsdBrl ? getChangePct(data, symUsdBrl) : null;
        const ibovDay = symIbov ? getChangePct(data, symIbov) : null;
        const usd60 = symUsdBrl ? getMomentumPct(data, symUsdBrl, 60) : null;
        const ibov60 = symIbov ? getMomentumPct(data, symIbov, 60) : null;
        const usd15 = symUsdBrl ? getMomentumPct(data, symUsdBrl, 15) : null;
        const ibov15 = symIbov ? getMomentumPct(data, symIbov, 15) : null;
        const usd = isNum(usd60) ? usd60 : (isNum(usd15) ? usd15 : usdDay);
        const ibov = isNum(ibov60) ? ibov60 : (isNum(ibov15) ? ibov15 : ibovDay);

        const hasUsd = isNum(usd);
        const hasIbov = isNum(ibov);
        const brlWeaker = hasUsd && usd > 0.10;
        const brlStronger = hasUsd && usd < -0.10;
        const eqDown = hasIbov && ibov < -0.10;
        const eqUp = hasIbov && ibov > 0.10;

        const abs = Math.abs(pct);
        const cdsUp = pct > 0.08;
        const cdsDown = pct < -0.08;

        const mode = cdsUp && brlWeaker && eqDown
            ? 'risk_off_classic'
            : cdsUp && brlStronger && eqUp
                ? 'hedge_on_risk_on'
                : cdsDown && brlStronger && eqUp
                    ? 'relief_risk_on'
                    : 'neutral';

        const confidence = (() => {
            const strength = abs >= 0.28 ? 0.62 : abs >= 0.18 ? 0.52 : abs >= 0.10 ? 0.42 : abs >= 0.08 ? 0.34 : 0.22;
            const confirms = [brlWeaker || brlStronger, eqDown || eqUp].filter(Boolean).length;
            const available = [hasUsd, hasIbov].filter(Boolean).length;
            const bonus = available >= 2 ? (confirms >= 2 ? 0.26 : confirms === 1 ? 0.14 : 0) : 0;
            return clamp01(strength + bonus);
        })();

        const tone = mode === 'risk_off_classic' ? 'negative' : mode === 'relief_risk_on' ? 'positive' : mode === 'hedge_on_risk_on' ? 'neutral' : 'neutral';
        const label = mode === 'risk_off_classic'
            ? 'Risk-off (proteção↑ + BRL↓ + Bolsa↓)'
            : mode === 'relief_risk_on'
                ? 'Alívio / Risk-on (CDS↓ + BRL↑ + Bolsa↑)'
                : mode === 'hedge_on_risk_on'
                    ? 'Hedge-on (CDS↑ com BRL↑ e Bolsa↑)'
                    : 'Neutro';

        const wdoBias = mode === 'risk_off_classic'
            ? 'buy'
            : mode === 'relief_risk_on'
                ? 'sell'
                : mode === 'hedge_on_risk_on'
                    ? 'sell'
                    : 'neutral';
        const winBias = mode === 'risk_off_classic'
            ? 'sell'
            : mode === 'relief_risk_on'
                ? 'buy'
                : mode === 'hedge_on_risk_on'
                    ? 'buy'
                    : 'neutral';

        const detail = [
            `CDS ${pct > 0 ? '+' : ''}${Math.round(pct * 100) / 100}%`,
            hasUsd ? `USD/BRL ${usd > 0 ? '+' : ''}${Math.round(usd * 100) / 100}%` : null,
            hasIbov ? `IBOV ${ibov > 0 ? '+' : ''}${Math.round(ibov * 100) / 100}%` : null,
        ].filter(Boolean).join(' • ');

        return {
            symbol: sym,
            score,
            bias,
            drivers: { cds: pct, usdBrl: hasUsd ? usd : null, ibov: hasIbov ? ibov : null },
            mode,
            tone,
            label,
            confidence,
            detail,
            wdo: wdoBias === 'buy' ? '↑' : wdoBias === 'sell' ? '↓' : '≈',
            win: winBias === 'buy' ? '↑' : winBias === 'sell' ? '↓' : '≈',
            wdoBias,
            winBias,
        };
    };

    const computeSimplePulse = ({ data, targetSym, biasScale = 0.6 } = {}) => {
        const pct = targetSym ? getChangePct(data, targetSym) : null;
        const net = isNum(pct) ? clamp(pct / biasScale, -3, 3) : 0;
        const bias = net > 0.25 ? 'buy' : net < -0.25 ? 'sell' : 'neutral';
        return { bias, net, groups: { driver: { net, count: 1 }, confirm: { net: 0, count: 0 }, context: { net: 0, count: 0 } }, rows: [] };
    };

    const computeOperationalPulseNow = (data, operationalTuning) => {
        if (!data) return null;
        const symWin = findAssetSymbol(data, /^WINc1$/i) || findAssetSymbol(data, /^WIN\b/i) || null;
        const symWdo = findAssetSymbol(data, /^WDOc1$/i) || findAssetSymbol(data, /^WDO\b/i) || null;
        if (!symWin || !symWdo) return null;
        const staleMin = operationalTuning && typeof operationalTuning.staleAsOfWarnMin === 'number' && Number.isFinite(operationalTuning.staleAsOfWarnMin)
            ? Math.max(1, operationalTuning.staleAsOfWarnMin)
            : 15;
        const lookbackMin = operationalTuning && operationalTuning.lookbackMin && typeof operationalTuning.lookbackMin === 'number'
            ? operationalTuning.lookbackMin
            : 30;
        const lastPt = (sym) => (sym ? (getMostRecentPointWithPrice(data, sym) || getLastPoint(data, sym)) : null);
        const pointRefMsStrict = (pt) => {
            if (!pt) return null;
            const ref = pt.asOf ? String(pt.asOf) : pt.t ? String(pt.t) : '';
            const ms = ref ? Date.parse(ref) : NaN;
            return Number.isFinite(ms) ? ms : null;
        };
        const pointRefMsBest = (pt) => {
            if (!pt) return null;
            const asOfMs = pt.asOf ? Date.parse(String(pt.asOf)) : NaN;
            const tMs = pt.t ? Date.parse(String(pt.t)) : NaN;
            const aOk = Number.isFinite(asOfMs);
            const tOk = Number.isFinite(tMs);
            if (aOk && tOk) return Math.max(asOfMs, tMs);
            if (aOk) return asOfMs;
            if (tOk) return tMs;
            return null;
        };
        const ageMinFromPoint = (pt, mode) => {
            const ms = mode === 'strict_asof' ? pointRefMsStrict(pt) : pointRefMsBest(pt);
            if (ms === null) return null;
            const now = Date.now();
            if (!Number.isFinite(now)) return null;
            return Math.max(0, (now - ms) / 60000);
        };
        const winLast = lastPt(symWin);
        const wdoLast = lastPt(symWdo);
        const winAgeMin = ageMinFromPoint(winLast, 'strict_asof');
        const wdoAgeMin = ageMinFromPoint(wdoLast, 'strict_asof');
        const winStale = typeof winAgeMin === 'number' && Number.isFinite(winAgeMin) ? winAgeMin > staleMin : true;
        const wdoStale = typeof wdoAgeMin === 'number' && Number.isFinite(wdoAgeMin) ? wdoAgeMin > staleMin : true;
        const anyStale = winStale || wdoStale;
        const pctNow = (sym) => {
            if (!sym) return null;
            const m = getMomentumPct(data, sym, lookbackMin);
            if (isNum(m) && Math.abs(m) <= 20) return m;
            return getChangePct(data, sym);
        };
        const winObservedPct = pctNow(symWin);
        const wdoObservedPct = pctNow(symWdo);
        const winPct = winStale ? null : winObservedPct;
        const wdoPct = wdoStale ? null : wdoObservedPct;
        const th = operationalTuning && operationalTuning.thresholds && typeof operationalTuning.thresholds.wdoWin === 'number'
            ? operationalTuning.thresholds.wdoWin
            : 0.25;
        const plan = anyStale
            ? { win: 'neutral', wdo: 'neutral' }
            : (isNum(winPct) && isNum(wdoPct) && winPct >= th && wdoPct <= -th)
            ? { win: 'buy', wdo: 'sell' }
            : (isNum(winPct) && isNum(wdoPct) && winPct <= -th && wdoPct >= th)
                ? { win: 'sell', wdo: 'buy' }
                : { win: 'neutral', wdo: 'neutral' };
        const mk = (bias, pct) => {
            const net = isNum(pct) ? clamp(pct / 0.6, -3, 3) : 0;
            return { bias, net, groups: { driver: { net, count: 1 }, confirm: { net: 0, count: 0 }, context: { net: 0, count: 0 } }, rows: [] };
        };
        const alignPair = (aSym, bSym) => {
            const a = aSym ? pctNow(aSym) : null;
            const b = bSym ? pctNow(bSym) : null;
            if (!isNum(a) || !isNum(b)) return { ok: null, reason: 'missing', a, b };
            if (Math.abs(a) < 0.05 || Math.abs(b) < 0.05) return { ok: null, reason: 'weak', a, b };
            return { ok: (a * b) >= 0, reason: 'ok', a, b };
        };
        const symUsdBrl = findAliasSymbolBest(data, 'USD_BRL') || findAliasSymbol(data, 'USD_BRL') || null;
        const symIbov = findAliasSymbolBest(data, 'IBOV') || findAliasSymbol(data, 'IBOV') || null;
        const symEwz = findAliasSymbolBest(data, 'EWZ') || findAliasSymbol(data, 'EWZ') || null;
        const symDxy = findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY') || null;

        const symSpx = findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX') || null;
        const symUs10y = findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y') || null;

        const driverPulse = (side, { bias, targetStale } = {}) => {
            const defs =
                side === 'wdo'
                    ? [
                        { k: 'USD/BRL', label: 'USD/BRL', sym: symUsdBrl, group: 'driver', w: 0.34, sign: +1, scale: 0.55 },
                        { k: 'DXY', label: 'DXY', sym: symDxy, group: 'driver', w: 0.28, sign: +1, scale: 0.60 },
                        { k: 'VIX', label: 'VIX', sym: findAliasSymbolBest(data, 'VIX30') || findAliasSymbolBest(data, 'VIX') || null, group: 'confirm', w: 0.14, sign: +1, scale: 0.90 },
                        { k: 'SPX', label: 'SPX (inv)', sym: symSpx, group: 'confirm', w: 0.12, sign: -1, scale: 0.80 },
                        { k: 'EWZ', label: 'EWZ (inv)', sym: symEwz, group: 'confirm', w: 0.08, sign: -1, scale: 0.80 },
                        { k: 'US10Y', label: 'US10Y', sym: symUs10y, group: 'context', w: 0.04, sign: +1, scale: 0.90 },
                    ]
                    : [
                        { k: 'IBOV', label: 'IBOV', sym: symIbov, group: 'driver', w: 0.34, sign: +1, scale: 0.60 },
                        { k: 'EWZ', label: 'EWZ', sym: symEwz, group: 'driver', w: 0.22, sign: +1, scale: 0.75 },
                        { k: 'SPX', label: 'SPX', sym: symSpx, group: 'confirm', w: 0.16, sign: +1, scale: 0.80 },
                        { k: 'VIX', label: 'VIX (inv)', sym: findAliasSymbolBest(data, 'VIX30') || findAliasSymbolBest(data, 'VIX') || null, group: 'confirm', w: 0.14, sign: -1, scale: 0.90 },
                        { k: 'DXY', label: 'DXY (inv)', sym: symDxy, group: 'context', w: 0.08, sign: -1, scale: 0.90 },
                        { k: 'USD/BRL', label: 'USD/BRL (inv)', sym: symUsdBrl, group: 'context', w: 0.06, sign: -1, scale: 0.75 },
                    ];

            const missing = [];
            const rows = [];
            for (const def of defs) {
                const sym = def.sym || null;
                if (!sym) {
                    missing.push(def.k);
                    continue;
                }
                const pt = lastPt(sym);
                const ageMin = ageMinFromPoint(pt, 'best');
                const staleThresholdMin = def.group === 'context' ? 360 : def.group === 'confirm' ? 90 : staleMin;
                const isStale = typeof ageMin === 'number' && Number.isFinite(ageMin) ? ageMin > staleThresholdMin : true;
                const pct = pctNow(sym);
                if (isStale || !isNum(pct)) {
                    missing.push(def.k);
                    continue;
                }
                const score = clamp((def.sign * pct) / (def.scale || 0.6), -3, 3);
                rows.push({
                    k: def.k,
                    label: def.label,
                    symbol: sym,
                    group: def.group,
                    w: def.w,
                    pct,
                    score,
                });
            }

            const wSum = rows.reduce((acc, r) => acc + (r.w || 0), 0);
            const net = wSum > 0 ? rows.reduce((acc, r) => acc + (r.score * r.w), 0) / wSum : 0;

            const groupAgg = (g) => {
                const xs = rows.filter(r => r.group === g);
                const ws = xs.reduce((acc, r) => acc + (r.w || 0), 0);
                const gn = ws > 0 ? xs.reduce((acc, r) => acc + (r.score * r.w), 0) / ws : 0;
                return { net: gn, count: xs.length };
            };

            const pnlLike = rows.reduce(
                (acc, r) => {
                    const c = (r.score || 0) * (r.w || 0);
                    if (c > 0) acc.posSum += c;
                    else if (c < 0) acc.negSum += c;
                    acc.net += c;
                    return acc;
                },
                { posSum: 0, negSum: 0, net: 0 },
            );

            const breadth = rows.reduce(
                (acc, r) => {
                    const c = (r.score || 0) * (r.w || 0);
                    if (c > 0.02) acc.pos += 1;
                    else if (c < -0.02) acc.neg += 1;
                    else acc.zero += 1;
                    return acc;
                },
                { pos: 0, neg: 0, zero: 0 },
            );

            const safeBias = targetStale ? 'neutral' : (bias || 'neutral');
            return {
                bias: safeBias,
                net,
                groups: { driver: groupAgg('driver'), confirm: groupAgg('confirm'), context: groupAgg('context') },
                rows,
                pnlLike,
                breadth,
                missing,
            };
        };

        const pulseWin = driverPulse('win', { bias: plan.win, targetStale: winStale });
        const pulseWdo = driverPulse('wdo', { bias: plan.wdo, targetStale: wdoStale });

        return {
            sym: {
                win: symWin,
                wdo: symWdo,
                usdbrl: symUsdBrl,
                ibov: symIbov,
                ewz: symEwz,
                dxy: symDxy,
                spx: symSpx,
                us10y: symUs10y,
                vix9d: findAliasSymbolBest(data, 'VIX9D') || null,
                vix30: findAliasSymbolBest(data, 'VIX30') || findAliasSymbolBest(data, 'VIX') || null,
                vvix: findAliasSymbolBest(data, 'VVIX') || null,
                vxn: findAliasSymbolBest(data, 'VXN') || null,
                vxewz: findAliasSymbolBest(data, 'VXEWZ') || null,
                vxbr: findAliasSymbolBest(data, 'VXBR') || null,
            },
            market: { winPct, wdoPct },
            pulse: {
                win: pulseWin,
                wdo: pulseWdo,
            },
            coverage: {
                win: { missing: pulseWin && Array.isArray(pulseWin.missing) ? pulseWin.missing : [] },
                wdo: { missing: pulseWdo && Array.isArray(pulseWdo.missing) ? pulseWdo.missing : [] },
            },
            stale: {
                warnMin: staleMin,
                win: { stale: winStale, ageMin: winAgeMin, asOf: winLast && winLast.asOf ? String(winLast.asOf) : null, observedPct: winObservedPct },
                wdo: { stale: wdoStale, ageMin: wdoAgeMin, asOf: wdoLast && wdoLast.asOf ? String(wdoLast.asOf) : null, observedPct: wdoObservedPct },
            },
            align: {
                wdo_usdbrl: wdoStale ? { ok: null, reason: 'stale', a: wdoObservedPct, b: symUsdBrl ? pctNow(symUsdBrl) : null } : alignPair(symWdo, symUsdBrl),
                wdo_dxy: wdoStale ? { ok: null, reason: 'stale', a: wdoObservedPct, b: symDxy ? pctNow(symDxy) : null } : alignPair(symWdo, symDxy),
                win_ibov: winStale ? { ok: null, reason: 'stale', a: winObservedPct, b: symIbov ? pctNow(symIbov) : null } : alignPair(symWin, symIbov),
                win_ewz: winStale ? { ok: null, reason: 'stale', a: winObservedPct, b: symEwz ? pctNow(symEwz) : null } : alignPair(symWin, symEwz),
            },
        };
    };

    const computeBtcPulseNow = (data) => {
        const btc = findAliasSymbolBest(data, 'BTC') || findAliasSymbol(data, 'BTC') || null;
        if (!btc) return null;
        const pulse = computeSimplePulse({ data, targetSym: btc, biasScale: 0.7 });
        return {
            sym: {
                btc,
                dxy: findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY') || null,
                spx: findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX') || null,
                ndx: findAliasSymbolBest(data, 'NDX') || findAliasSymbol(data, 'NDX') || null,
                us10y: findAliasSymbolBest(data, 'US10Y') || findAliasSymbol(data, 'US10Y') || null,
                vix: findAliasSymbolBest(data, 'VIX') || findAliasSymbolBest(data, 'VIX30') || null,
                vvix: findAliasSymbolBest(data, 'VVIX') || null,
                vxn: findAliasSymbolBest(data, 'VXN') || null,
                hyg: findAliasSymbolBest(data, 'HYG') || null,
                gold: findAliasSymbolBest(data, 'GOLD') || null,
            },
            market: { btcPct: getChangePct(data, btc) },
            pulse,
            coverage: { missing: [] },
            missingAssetsSuggestion: [],
            news: [],
            newsMeta: { score: 0 },
        };
    };

    const computeCommoditiesPulseNow = (data) => {
        const d = data || null;
        if (!d) return null;

        const pick = (aliasKey, matcher, { preferSymbols = [] } = {}) => {
            for (const s of (Array.isArray(preferSymbols) ? preferSymbols : [])) {
                const sym = String(s || '');
                if (sym && d.series && Array.isArray(d.series[sym]) && d.series[sym].length) return sym;
            }
            return findAliasSymbolBest(d, aliasKey) || findAliasSymbol(d, aliasKey) || (matcher instanceof RegExp ? findAssetSymbol(d, matcher) : null);
        };

        const gold = pick('GOLD', /(\bXAU\/USD\b|\bGold\b|^GC\b|^FXGLc1\b)/i, { preferSymbols: ['GC', 'FXGLc1'] });
        const brent = pick('BRENT', /(\bBrent\b|^LCO\b|^LCOc1\b|^BZc1\b)/i, { preferSymbols: ['LCO', 'LCOc1'] });
        const wti = pick('WTI', /(\bWTI\b|^CL\b|^CLc1\b|^MWCLc1\b)/i, { preferSymbols: ['CL', 'CLc1'] });
        if (!gold && !brent && !wti) return null;

        const dxy = pick('DXY', /(^USDX$|DX-Y\.NYB|^\.(DXY)\b|\bDollar Index\b)/i, { preferSymbols: ['USDX'] });
        const us10y = pick('US10Y', /(^TNc1=$|^\.(TNX)\b|^US10YT=RR\b|\bUnited States 10-Year\b)/i, { preferSymbols: ['TNc1=', '.TNX'] });
        const vix = pick('VIX', /(^\.(VIX|VIX9D)\b|^VIX\b)/i);
        const spx = pick('SPX', /(^\.SPX\b|^SPY\b|\bS&P 500\b)/i);
        const hyg = pick('HYG', /^HYG(\.\w+)?$/i);
        const xle = pick('XLE', /^XLE(\.\w+)?$/i);
        const usdcad = pick('USD_CAD', /^USD\/CAD\b/i);
        const audusd = pick('AUD_USD', /^AUD\/USD\b/i);
        const usdzar = pick('USD_ZAR', /^USD\/ZAR\b/i);
        const usdcnh = pick('USD_CNH', /^USD\/CNH\b/i) || pick('USD_CNY', /^USD\/CNY\b/i);
        const copper = pick('COPPER', /(^HG(=F)?$|^HG$|\bCopper\b|\bCobre\b)/i);
        const gdx = findAssetSymbol(d, /^GDX(\.\w+)?$/i);
        const minerNem = findAssetSymbol(d, /^NEM(\.\w+)?$/i);
        const minerAu = findAssetSymbol(d, /^AU(\.\w+)?$/i);
        const minerFnv = findAssetSymbol(d, /^FNV(\.\w+)?$/i);

        const base = brent || wti || gold;
        const pulse = computeSimplePulse({ data: d, targetSym: base, biasScale: 0.6 });
        const pct = (s) => (s ? getChangePct(d, s) : null);

        const keyLabels = {};
        const missingDetails = {};
        const missing = [];
        const need = (k, label, sym, detail) => {
            keyLabels[k] = label;
            if (!sym) {
                missing.push(k);
                if (detail) missingDetails[k] = detail;
            }
        };
        need('GOLD', 'Ouro', gold, 'GC/FXGLc1 ou XAU/USD');
        need('OIL', 'Petróleo', (brent || wti), 'LCO/CL ou Brent/WTI');
        need('DXY', 'DXY', dxy, 'USDX/DXY');
        need('US10Y', 'US10Y', us10y, 'US10YT=RR ou .TNX');
        need('AUDUSD', 'AUD/USD', audusd, 'AUD/USD');
        need('USDZAR', 'USD/ZAR', usdzar, 'USD/ZAR');
        need('USDCAD', 'USD/CAD', usdcad, 'USD/CAD');
        need('USDCNH', 'USD/CNH', usdcnh, 'USD/CNH ou USD/CNY');
        need('MINERS', 'Miners', (gdx || minerNem || minerAu || minerFnv), 'GDX/NEM/AU/FNV');
        need('XLE', 'XLE', xle, 'XLE');
        need('COPPER', 'Cobre', copper, 'HG');
        need('SPX', 'SPX', spx, 'SPY/.SPX');
        need('HYG', 'HYG', hyg, 'HYG');
        need('VIX', 'VIX', vix, '.VIX/.VIX9D');

        const missingAssetsSuggestion = [];
        if (!audusd) missingAssetsSuggestion.push('AUD/USD');
        if (!usdzar) missingAssetsSuggestion.push('USD/ZAR');
        if (!usdcad) missingAssetsSuggestion.push('USD/CAD');
        if (!gdx && !minerNem && !minerAu && !minerFnv) missingAssetsSuggestion.push('GDX', 'NEM', 'AU', 'FNV');

        const isGoldFuture = gold && (/^GC\b/i.test(gold) || /^FXGLc1\b/i.test(gold));
        const isOilFuture = (brent && /^LCO\b/i.test(brent)) || (wti && /^CL\b/i.test(wti));
        const execGold = gold || base;
        const execOil = brent || wti || base;

        return {
            sym: {
                gold,
                brent,
                wti,
                dxy,
                us10y,
                vix,
                spx,
                hyg,
                xle,
                usdcad,
                audusd,
                usdzar,
                usdcnh,
                copper,
                gdx,
                minerNem,
                minerAu,
                minerFnv,
            },
            market: {
                goldPct: pct(gold),
                brentPct: pct(brent),
                wtiPct: pct(wti),
            },
            pulse: { gold: pulse, oil: pulse, gas: pulse, copper: pulse, silver: pulse, ttfGas: pulse, zinc: pulse, nickel: pulse },
            execution: { gold: execGold, oil: execOil },
            source: { gold: isGoldFuture ? 'future' : (gold ? 'proxy' : 'n/a'), oil: isOilFuture ? 'future' : ((brent || wti) ? 'proxy' : 'n/a') },
            corr: {},
            micro: {},
            coverage: { missing, keyLabels, missingDetails },
            missingAssetsSuggestion: Array.from(new Set(missingAssetsSuggestion)).filter(Boolean),
            news: [],
            newsMeta: { score: 0 },
        };
    };

    const computeHk50PulseNow = (data) => {
        const d = data || null;
        const hk50 = findAliasSymbolBest(d, 'HK50') || findAliasSymbol(d, 'HK50') || findAssetSymbol(d, /(^2838\.HK$|\bHang Seng\b|^HSI\b)/i) || null;
        if (!hk50) return null;

        const pick = (aliasKey, matcher) => findAliasSymbolBest(d, aliasKey) || findAliasSymbol(d, aliasKey) || (matcher instanceof RegExp ? findAssetSymbol(d, matcher) : null);

        const hstech = pick('HSTECH', /(^HSTECH\b|\bHang Seng TECH\b)/i);
        const usdCnh = pick('USD_CNH', /(^USD\/CNH\b|\bUSD\/CNH\b)/i);
        const usdCny = pick('USD_CNY', /(^USD\/CNY\b|\bUSD\/CNY\b)/i);
        const usdHkd = pick('USD_HKD', /(^USD\/HKD\b|\bUSD\/HKD\b)/i);
        const spx = pick('SPX', /(^\.SPX\b|^SPY\b|\bS&P 500\b)/i);
        const ndx = pick('NDX', /(^\.NDX\b|^QQQ\b|\bNasdaq\b)/i);
        const vix = pick('VIX', /(^\.(VIX|VIX9D)\b|^VIX\b)/i);
        const dxy = pick('DXY', /(^USDX$|DX-Y\.NYB|^\.(DXY)\b|\bDollar Index\b)/i);
        const ewh = pick('EWH', /^EWH(\.\w+)?$/i);

        const fxi = pick('FXI', /^FXI(\.\w+)?$/i);
        const csi = pick('CSI300', /^\.(CSI300)\b/i);
        const mchi = pick('CHINA', /^MCHI(\.\w+)?$/i);
        const ashr = pick('CHINA', /^ASHR(\.\w+)?$/i);
        const kweb = pick('CHINA', /^KWEB(\.\w+)?$/i);
        const fxChina = fxi || csi || mchi || ashr || kweb || null;

        const iron = pick('IRON', /(^DCE_I0$|^TIO(=F)?$|^TIOc1$|^SM58F(c1)?$|\bIron\s*Ore\b|\bMin[ée]rio\b)/i);
        const copper = pick('COPPER', /(^HG(=F)?$|^HG$|\bCopper\b|\bCobre\b)/i);

        const hk10y = pick('HK10Y', /^HK10YT=RR$/i);
        const hk1m = pick('HK1M', /^HK1MT=RR$/i);
        const hk3m = pick('HK3M', /^HK3MT=RR$/i);
        const cn10y = pick('CN10Y', /^CN10YT=RR$/i);
        const us10y = pick('US10Y', /(^TNc1=$|^\.(TNX)\b|^US10YT=RR\b|\bUnited States 10-Year\b)/i, { preferSymbols: ['TNc1=', '.TNX'] });
        const cdsCn5y = pick('CDS_CN5Y', /^CNGV5YUSAC=R$/i);

        const pct = (s) => (s ? getChangePct(d, s) : null);
        const pulse = computeSimplePulse({ data: d, targetSym: hk50, biasScale: 0.6 });

        const missing = [];
        const keyLabels = {};
        const missingDetails = {};
        const need = (k, label, sym, detail) => {
            keyLabels[k] = label;
            if (!sym) {
                missing.push(k);
                if (detail) missingDetails[k] = detail;
            }
        };
        need('HSTECH', 'HSTECH', hstech, 'ticker Hang Seng Tech');
        need('USD_CNH', 'USD/CNH', (usdCnh || usdCny), 'USD/CNH ou USD/CNY');
        need('SPX', 'SPX', spx, 'S&P 500');
        need('DXY', 'DXY', dxy, 'USDX/DXY');
        need('FX_CHINA', 'China (FXI/CSI300)', fxChina, 'FXI ou .CSI300');
        need('IRON', 'Minério', iron, 'DCE_I0 ou TIO/SM58F');
        need('COPPER', 'Cobre', copper, 'HG');
        need('HK10Y', 'HK10Y', hk10y, 'HK10YT=RR');
        need('HK1M', 'HK 1M', hk1m, 'HK1MT=RR');
        need('HK3M', 'HK 3M', hk3m, 'HK3MT=RR');
        need('CN10Y', 'CN10Y', cn10y, 'CN10YT=RR');
        need('US10Y', 'US10Y', us10y, 'US10YT=RR ou .TNX');
        need('CDS_CN5Y', 'China CDS 5Y', cdsCn5y, 'CNGV5YUSAC=R');

        const missingAssetsSuggestion = [];
        if (!fxChina) missingAssetsSuggestion.push('FXI', '.CSI300');
        if (!iron) missingAssetsSuggestion.push('DCE_I0');
        if (!copper) missingAssetsSuggestion.push('HG');
        if (!hk10y) missingAssetsSuggestion.push('HK10YT=RR');
        if (!hk1m) missingAssetsSuggestion.push('HK1MT=RR');
        if (!hk3m) missingAssetsSuggestion.push('HK3MT=RR');
        if (!cn10y) missingAssetsSuggestion.push('CN10YT=RR');
        if (!us10y) missingAssetsSuggestion.push('US10YT=RR');
        if (!cdsCn5y) missingAssetsSuggestion.push('CNGV5YUSAC=R');

        return {
            sym: {
                hk50,
                hstech,
                usdCnh,
                usdCny,
                usdHkd,
                ewh,
                ndx,
                spx,
                vix,
                dxy,
                fxi,
                csi,
                fxChina,
                iron,
                copper,
                hk10y,
                hk1m,
                hk3m,
                cn10y,
                us10y,
                cdsCn5y,
                vhsi: findAssetSymbol(d, /^VHSI(c\d+)?$/i),
            },
            market: { hk50Pct: pct(hk50) },
            pulse,
            volAmp: null,
            flowCorr: null,
            conviction: null,
            coverage: { missing, keyLabels, missingDetails },
            missingAssetsSuggestion: Array.from(new Set(missingAssetsSuggestion)).filter(Boolean),
            news: [],
            newsMeta: { score: 0 },
        };
    };

    const computeUsEquitiesPulseNow = (data) => {
        const pickAny = (patterns) => {
            for (const re of (patterns || [])) {
                const s = findAssetSymbol(data, re);
                if (s) return s;
            }
            return null;
        };
        const spx = pickAny([/^ES=F$/i, /^MES=F$/i, /^ESc\d+$/i, /^SPX500\b/i, /^US500\b/i]) || findAliasSymbolBest(data, 'SPX') || findAliasSymbol(data, 'SPX') || null;
        const ndx = pickAny([/^NQ=F$/i, /^MNQ=F$/i, /^NQc\d+$/i, /^NAS100\b/i, /^US100\b/i]) || findAliasSymbolBest(data, 'NDX') || findAliasSymbol(data, 'NDX') || null;
        const dow = pickAny([/^YM=F$/i, /^MYM=F$/i, /^YMc\d+$/i, /^US30\b/i, /^DJ30\b/i]) || findAssetSymbol(data, /^\.(DJI)\b/i) || findAssetSymbol(data, /^DIA\b/i) || null;
        const base = ndx || spx || dow;
        if (!base) return null;
        const pulseOf = (sym, scale, lookbackMin) => {
            const pct = sym ? (getMomentumPct(data, sym, lookbackMin) ?? getChangePct(data, sym)) : null;
            const net = isNum(pct) ? clamp(pct / scale, -3, 3) : 0;
            const bias = net > 0.22 ? 'buy' : net < -0.22 ? 'sell' : 'neutral';
            return { bias, net, groups: { driver: { net, count: 1 }, confirm: { net: 0, count: 0 }, context: { net: 0, count: 0 } }, rows: [] };
        };
        const microOf = (sym, th5, th15) => {
            const r5 = sym ? getMomentumPct(data, sym, 5) : null;
            const r15 = sym ? getMomentumPct(data, sym, 15) : null;
            const r60 = sym ? getMomentumPct(data, sym, 60) : null;
            const ok = (x) => isNum(x);
            const alignedUp = ok(r5) && ok(r15) && r5 >= th5 && r15 >= th15;
            const alignedDn = ok(r5) && ok(r15) && r5 <= -th5 && r15 <= -th15;
            const signal = alignedUp ? 'buy' : alignedDn ? 'sell' : 'neutral';
            const strength = (ok(r5) && ok(r15))
                ? clamp(((Math.abs(r5) / Math.max(0.0001, th5)) + (Math.abs(r15) / Math.max(0.0001, th15))) / 2, 0, 1)
                : 0;
            const label = signal === 'buy' ? '5m×15m (↑)' : signal === 'sell' ? '5m×15m (↓)' : 'range/ruído';
            return { ret5: ok(r5) ? r5 : null, ret15: ok(r15) ? r15 : null, ret60: ok(r60) ? r60 : null, scalp: { signal, strength, label } };
        };

        const spxPulse = spx ? pulseOf(spx, 0.18, 30) : pulseOf(base, 0.18, 30);
        const ndxPulse = ndx ? pulseOf(ndx, 0.25, 30) : pulseOf(base, 0.25, 30);
        const dowPulse = dow ? pulseOf(dow, 0.20, 30) : pulseOf(base, 0.20, 30);
        return {
            sym: {
                spx,
                ndx,
                us30: dow,
                dxy: findAliasSymbolBest(data, 'DXY') || null,
                us10y: findAliasSymbolBest(data, 'US10Y') || null,
                us2y: findAliasSymbolBest(data, 'US2Y') || null,
                vix: findAliasSymbolBest(data, 'VIX') || null,
                vix9d: findAliasSymbolBest(data, 'VIX9D') || null,
                hyg: findAliasSymbolBest(data, 'HYG') || null,
                xlf: findAssetSymbol(data, /^XLF\b/i) || null,
                eem: findAssetSymbol(data, /^EEM\b/i) || null,
            },
            market: {
                spxPct: spx ? (getMomentumPct(data, spx, 30) ?? getChangePct(data, spx)) : null,
                ndxPct: ndx ? (getMomentumPct(data, ndx, 30) ?? getChangePct(data, ndx)) : null,
                dowPct: dow ? (getMomentumPct(data, dow, 30) ?? getChangePct(data, dow)) : null,
            },
            pulse: { spx: spxPulse, ndx: ndxPulse, dow: dowPulse },
            execution: { spx: spx || base, ndx: ndx || base, dow: dow || base },
            source: {
                spx: spx ? (String(spx).includes('=F') ? 'fut' : 'proxy') : 'n/a',
                ndx: ndx ? (String(ndx).includes('=F') ? 'fut' : 'proxy') : 'n/a',
                dow: dow ? (String(dow).includes('=F') ? 'fut' : 'proxy') : 'n/a',
            },
            corr: {},
            micro: {
                spx: microOf(spx || base, 0.05, 0.12),
                ndx: microOf(ndx || base, 0.06, 0.14),
                dow: microOf(dow || base, 0.05, 0.12),
            },
            coverage: { missing: [], keyLabels: {} },
            missingAssetsSuggestion: [],
            news: [],
            newsMeta: { score: 0 },
        };
    };

    const buildDcDeps = () => ({ findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint });
    const buildCatDeps = (dcDeps) => ({ findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps });

    const buildDeps = ({ operationalInputs, operationalTuning } = {}) => {
        const defaultTuning = {
            thresholds: { wdoWin: 0.25, neutral: 0.10 },
            threshold: {
                dxy: 0.12,
                em: 0.12,
                export: 0.25,
                yields: 0.12,
                foreignFlow: 0.25,
                brFlow: 0.22,
                flowSentinel: 0.25,
                zqSlope: 0.12,
                brBreadth: 0.22,
                brSectors: 0.18,
                brRotation: 0.12,
            },
            weight: {
                flow: 0.22,
                dxy: 0.12,
                export: 0.12,
                em: 0.12,
                yields: 0.12,
                brFlow: 0.18,
                zq: 0.12,
                flowSentinel: 0.18,
            },
        };

        const src = operationalTuning && typeof operationalTuning === 'object' ? operationalTuning : {};
        const n = (v, fallback) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
        const srcThresholds = src.thresholds && typeof src.thresholds === 'object' ? src.thresholds : {};
        const srcThreshold = src.threshold && typeof src.threshold === 'object' ? src.threshold : {};
        const srcWeight = src.weight && typeof src.weight === 'object' ? src.weight : {};

        const tuning = {
            thresholds: {
                wdoWin: n(srcThresholds.wdoWin, defaultTuning.thresholds.wdoWin),
                neutral: n(srcThresholds.neutral, defaultTuning.thresholds.neutral),
            },
            threshold: {
                dxy: n(srcThreshold.dxy, defaultTuning.threshold.dxy),
                em: n(srcThreshold.em, defaultTuning.threshold.em),
                export: n(srcThreshold.export, defaultTuning.threshold.export),
                yields: n(srcThreshold.yields, defaultTuning.threshold.yields),
                foreignFlow: n(srcThreshold.foreignFlow, defaultTuning.threshold.foreignFlow),
                brFlow: n(srcThreshold.brFlow, defaultTuning.threshold.brFlow),
                flowSentinel: n(srcThreshold.flowSentinel, defaultTuning.threshold.flowSentinel),
                zqSlope: n(srcThreshold.zqSlope, defaultTuning.threshold.zqSlope),
                brBreadth: n(srcThreshold.brBreadth, defaultTuning.threshold.brBreadth),
                brSectors: n(srcThreshold.brSectors, defaultTuning.threshold.brSectors),
                brRotation: n(srcThreshold.brRotation, defaultTuning.threshold.brRotation),
            },
            weight: {
                flow: n(srcWeight.flow, defaultTuning.weight.flow),
                dxy: n(srcWeight.dxy, defaultTuning.weight.dxy),
                export: n(srcWeight.export, defaultTuning.weight.export),
                em: n(srcWeight.em, defaultTuning.weight.em),
                yields: n(srcWeight.yields, defaultTuning.weight.yields),
                brFlow: n(srcWeight.brFlow, defaultTuning.weight.brFlow),
                zq: n(srcWeight.zq, defaultTuning.weight.zq),
                flowSentinel: n(srcWeight.flowSentinel, defaultTuning.weight.flowSentinel),
            },
        };
        return {
            DecisionCore: w.DecisionCore || null,
            InstrumentsCatalog: w.InstrumentsCatalog || null,

            operationalInputs: (operationalInputs && typeof operationalInputs === 'object') ? operationalInputs : {},
            operationalTuning: tuning,

            escapeHtml,
            formatNumber,
            formatPercent,
            formatDateTime,
            formatDateTimeLoose,
            formatBrlCompact,

            isNum,
            clamp,
            avg,

            pointPct,
            getLastPoint,
            getMostRecentPointWithPrice,
            getChangePct,
            symbolKey,

            assetAliasMatchers,
            findAssetSymbol,
            findAliasSymbol,
            findAliasSymbolBest,

            badge,
            pillHtml,
            toneFromValue,
            toneBadgeHtml,
            toneBadgeHtmlFromTone,
            assetIcon,

            resolveTickerSymbol,
            formatTickerPrice,

            safeRender,
            fallbackCard,

            computeFlowScore,
            computeOperationalMacro,
            computeCategoryAverages,
            computeBrazilCdsHedgeSignal,
            computeOperationalPulseNow: (data) => computeOperationalPulseNow(data, tuning),
            computeBtcPulseNow,
            computeCommoditiesPulseNow,
            computeHk50PulseNow,
            computeUsEquitiesPulseNow,

            buildDcDeps,
            buildCatDeps,
        };
    };

    root.coreKit = {
        escapeHtml,
        isNum,
        clamp,
        avg,
        formatNumber,
        formatPercent,
        formatDateTime,
        formatDateTimeLoose,
        formatBrlCompact,
        pointPct,
        getLastPoint,
        getMostRecentPointWithPrice,
        getChangePct,
        symbolKey,
        assetAliasMatchers,
        findAssetSymbol,
        findAliasSymbol,
        findAliasSymbolBest,
        fallbackCard,
        safeRender,
        toneFromValue,
        toneBadgeHtmlFromTone,
        toneBadgeHtml,
        pillHtml,
        badge,
        assetIcon,
        resolveTickerSymbol,
        formatTickerPrice,
        computeFlowScore,
        computeOperationalMacro,
        computeCategoryAverages,
        computeBrazilCdsHedgeSignal,
        computeOperationalPulseNow: (data, operationalTuning) => computeOperationalPulseNow(data, operationalTuning),
        computeBtcPulseNow,
        computeCommoditiesPulseNow,
        computeHk50PulseNow,
        computeUsEquitiesPulseNow,
        buildDcDeps,
        buildCatDeps,
        buildDeps,
    };
    if (typeof w.getLastPoint !== 'function') w.getLastPoint = getLastPoint;
    if (typeof w.getMostRecentPointWithPrice !== 'function') w.getMostRecentPointWithPrice = getMostRecentPointWithPrice;
    if (typeof w.getChangePct !== 'function') w.getChangePct = getChangePct;
    if (typeof w.pointPct !== 'function') w.pointPct = pointPct;
    if (typeof w.findAssetSymbol !== 'function') w.findAssetSymbol = findAssetSymbol;
    if (typeof w.findAliasSymbol !== 'function') w.findAliasSymbol = findAliasSymbol;
    if (typeof w.findAliasSymbolBest !== 'function') w.findAliasSymbolBest = findAliasSymbolBest;
    if (typeof w.formatNumber !== 'function') w.formatNumber = formatNumber;
    if (typeof w.formatPercent !== 'function') w.formatPercent = formatPercent;
    w.MercadoBlocks = root;
})();
