(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const tableId = 'mercosulTable';
        const chartId = 'mercosulChart';
        const metricsId = 'mercosulMetrics';
        const pulseId = 'mercosulPulse';

        const metricsEl = document.getElementById(metricsId);
        const pulseEl = document.getElementById(pulseId);
        const tableEl = document.getElementById(tableId);
        if (!metricsEl || !pulseEl || !tableEl) return;

        const dc = w.DecisionCore ? w.DecisionCore : null;
        const dcDeps = {
            findAliasSymbolBest: deps.findAliasSymbolBest,
            findAliasSymbol: deps.findAliasSymbol,
            findAssetSymbol: deps.findAssetSymbol,
            getLastPoint: deps.getLastPoint,
        };

        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const assetBySymbol = new Map(assets.map(a => [String(a && a.symbol ? a.symbol : ''), a]));

        const mostRecentMs = (symbol) => {
            if (!symbol) return -Infinity;
            const last = (typeof deps.getMostRecentPointWithPrice === 'function' ? deps.getMostRecentPointWithPrice(data, symbol) : null) || deps.getLastPoint(data, symbol);
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
        const aliasSym = (k) => deps.findAliasSymbolBest(data, k) || deps.findAliasSymbol(data, k);

        const pick = (label, matchers, { invertForScore = false, aliasKey = null } = {}) => {
            const symbol = aliasKey ? (aliasSym(aliasKey) || pickBestByMatchers(matchers) || null) : (pickBestByMatchers(matchers) || null);
            const last = symbol ? ((typeof deps.getMostRecentPointWithPrice === 'function' ? deps.getMostRecentPointWithPrice(data, symbol) : null) || deps.getLastPoint(data, symbol)) : null;
            const pct = deps.pointPct(last);
            const score = pct === null ? null : (invertForScore ? -pct : pct);
            const a = symbol ? (assetBySymbol.get(symbol) || null) : null;
            return { label, symbol, last, pct, score, asset: a, invertForScore: !!invertForScore };
        };

        const weightedAvg = (pairs) => {
            const xs = (pairs || [])
                .filter(p => p && typeof p.v === 'number' && Number.isFinite(p.v) && typeof p.w === 'number' && Number.isFinite(p.w) && p.w > 0);
            const wSum = xs.reduce((s, p) => s + p.w, 0);
            if (!(wSum > 0)) return null;
            const v = xs.reduce((acc, p) => acc + p.v * p.w, 0) / wSum;
            return Number.isFinite(v) ? v : null;
        };

        const fxPairs = [
            pick('USD/BRL (BR)', [/^USD\/BRL\b/i], { invertForScore: true, aliasKey: 'USD_BRL' }),
            pick('USD/MXN (MX)', [/^USD\/MXN\b/i, /\bUSDMXN\b/i], { invertForScore: true }),
            pick('USD/CLP (CL)', [/^USD\/CLP\b/i, /\bUSDCLP\b/i], { invertForScore: true }),
            pick('USD/COP (CO)', [/^USD\/COP\b/i, /\bUSDCOP\b/i], { invertForScore: true }),
            pick('USD/PEN (PE)', [/^USD\/PEN\b/i, /\bUSDPEN\b/i], { invertForScore: true }),
            pick('USD/ARS (AR)', [/^USD\/ARS\b/i, /\bUSDARS\b/i], { invertForScore: true }),
            pick('USD/UYU (UY)', [/^USD\/UYU\b/i, /\bUSDUYU\b/i], { invertForScore: true }),
            pick('USD/PYG (PY)', [/^USD\/PYG\b/i, /\bUSDPYG\b/i], { invertForScore: true }),
        ].filter(x => x && x.symbol);

        const eqProxies = [
            pick('Ibovespa', [/^\.BVSP$/i, /\bIbovespa\b/i, /^BOVA11\.SA$/i], { aliasKey: 'IBOV' }),
            pick('EWZ (Brasil)', [/^EWZ(\.\w+)?$/i]),
            pick('EWW (México)', [/^EWW(\.\w+)?$/i]),
            pick('ECH (Chile)', [/^ECH(\.\w+)?$/i]),
            pick('ARGT (Argentina)', [/^ARGT(\.\w+)?$/i]),
            pick('EPU (Peru)', [/^EPU(\.\w+)?$/i]),
            pick('GXG (Colômbia)', [/^GXG(\.\w+)?$/i]),
        ].filter(x => x && x.symbol);

        const context = [
            pick('DXY', [/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i], { invertForScore: true, aliasKey: 'DXY' }),
            pick('VIX', [/^\.?VIX(9D)?$/i, /^VIX$/i], { invertForScore: true, aliasKey: 'VIX' }),
            pick('Cobre', [/^HG=F$/i, /^HGc\d$/i, /\bCopper\b/i, /\bCobre\b/i], { invertForScore: false, aliasKey: 'COPPER' }),
            pick('Brent/WTI', [/^BZ=F$/i, /^LCOc\d$/i, /^BRNc\d$/i, /^CL=F$/i, /^CLc\d$/i, /\bBrent\b/i, /\bWTI\b/i], { invertForScore: false, aliasKey: 'BRENT' }),
        ].filter(x => x && x.symbol);

        const fxStrength = weightedAvg(fxPairs.map(x => ({
            v: x.score,
            w: x.symbol && /USD\/BRL/i.test(String(x.symbol)) ? 0.34
                : /USD\/MXN/i.test(String(x.symbol)) ? 0.20
                    : /USD\/CLP/i.test(String(x.symbol)) ? 0.14
                        : /USD\/COP/i.test(String(x.symbol)) ? 0.10
                            : /USD\/PEN/i.test(String(x.symbol)) ? 0.08
                                : /USD\/ARS/i.test(String(x.symbol)) ? 0.06
                                    : /USD\/UYU/i.test(String(x.symbol)) ? 0.04
                                        : /USD\/PYG/i.test(String(x.symbol)) ? 0.04
                                            : 0.06,
        })));

        const eqStrength = weightedAvg(eqProxies.map(x => ({
            v: x.score,
            w: x.symbol && /^\.BVSP$/i.test(String(x.symbol)) ? 0.24
                : x.symbol && /^EWZ/i.test(String(x.symbol)) ? 0.20
                    : x.symbol && /^EWW/i.test(String(x.symbol)) ? 0.18
                        : x.symbol && /^ECH/i.test(String(x.symbol)) ? 0.12
                            : x.symbol && /^ARGT/i.test(String(x.symbol)) ? 0.10
                                : x.symbol && /^EPU/i.test(String(x.symbol)) ? 0.10
                                    : x.symbol && /^GXG/i.test(String(x.symbol)) ? 0.06
                                        : 0.10,
        })));

        const ctxStrength = weightedAvg(context.map(x => ({ v: x.score, w: x.label === 'DXY' ? 0.40 : x.label === 'VIX' ? 0.30 : x.label === 'Cobre' ? 0.20 : 0.10 })));

        const score = weightedAvg([
            { v: fxStrength, w: 0.65 },
            { v: eqStrength, w: 0.25 },
            { v: ctxStrength, w: 0.10 },
        ]);

        let state = '—';
        if (typeof score === 'number' && Number.isFinite(score)) {
            if (score > 0.25) state = 'Entrada (LatAm forte / USD fraco)';
            else if (score < -0.25) state = 'Saída (USD/Stress LatAm)';
            else state = 'Misto / neutro';
        }

        const badge = deps.toneBadgeHtml(score, state, { maxAbs: 1.2 });
        const cov = (() => {
            if (!dc || typeof dc.computeCoverage !== 'function') return null;
            const staleMs = 6 * 60 * 60 * 1000;
            const syms = Array.from(new Set([]
                .concat(fxPairs.map(x => x.symbol))
                .concat(eqProxies.map(x => x.symbol))
                .concat(context.map(x => x.symbol))
                .filter(Boolean)
                .map(s => String(s))));
            if (!syms.length) return null;
            return dc.computeCoverage(dcDeps, data, syms, { staleMs });
        })();

        const usedFx = fxPairs.map(x => x.label).slice(0, 6).join(', ');
        const usedEq = eqProxies.map(x => x.label).slice(0, 6).join(', ');

        metricsEl.innerHTML = `
        <div class="metric-card">
            <div class="metric-icon">🌎</div>
            <div class="metric-value">${score === null ? '—' : deps.formatPercent(score, 2)}</div>
            <div class="metric-label">Mercosul Pulse</div>
            <div class="metric-change neutral">${badge}</div>
            ${cov ? `<div style="margin-top:6px;opacity:.75;font-size:12px;font-family:'Share Tech Mono',monospace;font-weight:900;">Cobertura ${deps.escapeHtml(String(cov.counts.withChange))}/${deps.escapeHtml(String(cov.counts.expected))} • Fresh ${deps.escapeHtml(deps.formatNumber(cov.ratios.freshness * 100, 0))}%</div>` : ''}
        </div>
        <div class="metric-card">
            <div class="metric-icon">💱</div>
            <div class="metric-value">${fxStrength === null ? '—' : deps.formatPercent(fxStrength, 2)}</div>
            <div class="metric-label">Cesta FX (força local)</div>
            <div class="metric-change neutral">${deps.escapeHtml(usedFx || '—')}</div>
        </div>
        <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-value">${eqStrength === null ? '—' : deps.formatPercent(eqStrength, 2)}</div>
            <div class="metric-label">Proxies (Bolsa)</div>
            <div class="metric-change neutral">${deps.escapeHtml(usedEq || '—')}</div>
        </div>
    `;

        const mkLine = (x, maxAbs = 2.5) => {
            const pctTxt = x && typeof x.pct === 'number' && Number.isFinite(x.pct) ? deps.formatPercent(x.pct, 2) : '—';
            const tone = deps.toneBadgeHtml(x.pct, pctTxt, { maxAbs, inverse: false });
            return `<div style="display:flex;justify-content:space-between;gap:12px;">
            <div style="opacity:.92;font-weight:900;">${deps.escapeHtml(x.label)}</div>
            <div>${tone}</div>
        </div>`;
        };

        const block = (title, lines) => {
            const body = (lines || []).map(l => mkLine(l)).join('');
            if (!body) return '';
            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:rgba(0,0,0,.18);">
            <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">${deps.escapeHtml(title)}</div>
            <div style="display:flex;flex-direction:column;gap:8px;">${body}</div>
        </div>`;
        };

        const pulseHtml = [
            block('FX (USD/LatAm) — força local', fxPairs),
            block('Bolsas (proxies)', eqProxies),
            block('Contexto (USD/Vol/Commodities)', context),
        ].filter(Boolean).join('<div style="height:10px;"></div>');

        pulseEl.innerHTML = pulseHtml || '<div style="opacity:.85;">Sem dados suficientes para montar o bloco.</div>';

        const components = ([]).concat(fxPairs, eqProxies, context);
        const rows = components
            .filter(x => x && x.symbol)
            .map(x => {
                const a = x.asset || {};
                return {
                    symbol: x.symbol,
                    name: x.label,
                    exchange: a && a.exchange ? a.exchange : '',
                    category: a && a.category ? a.category : 'other',
                    tags: a && Array.isArray(a.tags) ? a.tags : [],
                    last: x.last,
                };
            })
            .filter(r => r.last && typeof r.last.price === 'number');

        const preferred = fxPairs.find(x => x && x.symbol && /USD\/BRL/i.test(String(x.symbol))) || null;
        let selected = preferred && preferred.symbol && data.series && data.series[preferred.symbol] ? preferred.symbol : (rows.length ? rows[0].symbol : null);

        deps.createTable(tableId, rows, data, symbol => {
            selected = symbol;
            const points = data.series[selected] || [];
            deps.renderLineChart(chartId, points, selected);
        }, { limit: 28, sortable: false, tableKey: tableId, toolbar: false, favorites: true });

        if (selected) {
            const points = data.series[selected] || [];
            deps.renderLineChart(chartId, points, selected);
        }
    }

    root.mercosul = { render };
    w.MercadoBlocks = root;
})();

