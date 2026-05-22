(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const d = deps || {};

        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const buildDcDeps = d.buildDcDeps;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const escapeHtml = d.escapeHtml;
        const toneBadgeHtml = d.toneBadgeHtml;
        const createTable = d.createTable;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getChangePct = d.getChangePct;

        const DecisionCore = d.DecisionCore || (w.DecisionCore || null);
        const InstrumentsCatalog = d.InstrumentsCatalog || (w.InstrumentsCatalog || null);

        const isBrazilRelated = d.isBrazilRelated;
        const brazilGroup = d.brazilGroup;

        const safeRender = d.safeRender || (w.MercadoUtils && typeof w.MercadoUtils.safeRender === 'function' ? w.MercadoUtils.safeRender : null);
        const renderBrazilExportBasket = d.renderBrazilExportBasket;
        const renderLineChart = d.renderLineChart || ((id, points, symbol) => {
            if (w.MercadoCharts && typeof w.MercadoCharts.renderLineChart === 'function') {
                w.MercadoCharts.renderLineChart(id, points, symbol);
            }
        });

        if (typeof findAliasSymbolBest !== 'function'
            || typeof findAliasSymbol !== 'function'
            || typeof buildDcDeps !== 'function'
            || typeof formatNumber !== 'function'
            || typeof formatPercent !== 'function'
            || typeof escapeHtml !== 'function'
            || typeof toneBadgeHtml !== 'function'
            || typeof createTable !== 'function'
            || typeof getLastPoint !== 'function'
            || typeof getChangePct !== 'function'
            || typeof isBrazilRelated !== 'function'
            || typeof brazilGroup !== 'function'
            || typeof renderBrazilExportBasket !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        const tableId = 'brazilTable';
        const chartId = 'brazilChart';
        const assets = data && Array.isArray(data.assets) ? data.assets : [];

        if (safeRender) safeRender({ id: 'exportBasket', label: 'Export Basket', fn: () => renderBrazilExportBasket(data) });
        else renderBrazilExportBasket(data);

        const metricsEl = document.getElementById('brazilMetrics');
        const pulseEl = document.getElementById('brazilPulse');
        const dc = DecisionCore;
        const dcDeps = buildDcDeps();
        const catalog = InstrumentsCatalog;

        const mostRecentMs = (symbol) => {
            if (!symbol) return -Infinity;
            const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
            const t = last && last.t ? Date.parse(String(last.t)) : NaN;
            return Number.isFinite(t) ? t : -Infinity;
        };
        const pickBestByMatchers = (matchers, { limit = 18 } = {}) => {
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
        const aliasSym = (k) => findAliasSymbolBest(data, k) || findAliasSymbol(data, k);
        const rcKey = (key, fallbackMatcher) => {
            if (catalog && typeof catalog.resolveRatesCreditByKey === 'function') {
                const sym = catalog.resolveRatesCreditByKey(dcDeps, data, key);
                if (sym) return sym;
            }
            return fallbackMatcher ? pickBestByMatchers([fallbackMatcher]) : null;
        };
        const bp10FromYield = (symbol) => {
            if (!symbol) return null;
            const pt = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
            const chg = pt && typeof pt.change === 'number' && Number.isFinite(pt.change) ? pt.change : null;
            if (!(typeof chg === 'number' && Number.isFinite(chg))) return null;
            const bps = chg * 100;
            if (!Number.isFinite(bps)) return null;
            return bps / 10;
        };

        if (metricsEl || pulseEl) {
            const sym = {
                ibov: aliasSym('IBOV') || pickBestByMatchers([/^\.BVSP$/i, /\bIbovespa\b/i, /^BOVA11\.SA$/i]),
                win: pickBestByMatchers([/^WINc1$/i, /^WINFUT/i, /\bMini\s*Índice\b/i, /\bMini\s*Indice\b/i]),
                usdbrl: aliasSym('USD_BRL') || pickBestByMatchers([/^USD\/BRL\b/i]),
                ewz: pickBestByMatchers([/^EWZ(\.\w+)?$/i]),
                bova11: pickBestByMatchers([/^BOVA11\.SA$/i, /^BOVA11$/i]),
                br10y: rcKey('BR_10Y', /^BR10YT=RR$/i) || aliasSym('BR10Y'),
                br2y: rcKey('BR_2Y', /^BR2YT=RR$/i),
                di1: pickBestByMatchers([/^DDIC1$/i, /^DI1\b/i, /\bDI\s*1\b/i, /\bDI\s*Futuro\b/i]),
                cds: rcKey('CDS_BR_5Y', /^BRGV5YUSAC=R$/i) || aliasSym('CDS_BR5Y'),
                dxy: aliasSym('DXY') || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i]),
                vix: findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || aliasSym('VIX') || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]),
            };

            const adrDefs = [
                { k: 'VALE', label: 'VALE' },
                { k: 'PBR', label: 'Petrobras' },
                { k: 'ITUB', label: 'Itaú' },
                { k: 'BBD', label: 'Bradesco' },
                { k: 'ABEV', label: 'Ambev' },
                { k: 'SUZ', label: 'Suzano' },
                { k: 'GGB', label: 'Gerdau' },
                { k: 'SID', label: 'CSN' },
            ];
            const adrs = adrDefs
                .map(def => {
                    const s = pickBestByMatchers([new RegExp(`^${def.k}(\\.\\w+)?$`, 'i')]);
                    const pct = s ? getChangePct(data, s) : null;
                    return { ...def, symbol: s, pct: typeof pct === 'number' && Number.isFinite(pct) ? pct : null };
                })
                .filter(x => x.symbol);

            const ibovPct = sym.ibov ? getChangePct(data, sym.ibov) : null;
            const winPct = sym.win ? getChangePct(data, sym.win) : null;
            const ewzPct = sym.ewz ? getChangePct(data, sym.ewz) : null;
            const bova11Pct = sym.bova11 ? getChangePct(data, sym.bova11) : null;
            const usdbrlPct = sym.usdbrl ? getChangePct(data, sym.usdbrl) : null;
            const br10Bp10 = bp10FromYield(sym.br10y);
            const di1Bp10 = bp10FromYield(sym.di1);
            const cdsPct = sym.cds ? getChangePct(data, sym.cds) : null;
            const dxyPct = sym.dxy ? getChangePct(data, sym.dxy) : null;
            const vixPct = sym.vix ? getChangePct(data, sym.vix) : null;

            const avgN = (xs) => {
                const ys = (xs || []).filter(v => typeof v === 'number' && Number.isFinite(v));
                if (!ys.length) return null;
                return ys.reduce((a, b) => a + b, 0) / ys.length;
            };
            const eqStrength = avgN([ibovPct, winPct, ewzPct, bova11Pct]);
            const fxStrength = typeof usdbrlPct === 'number' && Number.isFinite(usdbrlPct) ? -usdbrlPct : null;
            const ratesStrength = avgN([
                typeof br10Bp10 === 'number' && Number.isFinite(br10Bp10) ? -br10Bp10 : null,
                typeof di1Bp10 === 'number' && Number.isFinite(di1Bp10) ? -di1Bp10 : null,
            ]);
            const riskStrength = avgN([
                typeof cdsPct === 'number' && Number.isFinite(cdsPct) ? -cdsPct : null,
                typeof vixPct === 'number' && Number.isFinite(vixPct) ? -vixPct : null,
                typeof dxyPct === 'number' && Number.isFinite(dxyPct) ? -dxyPct : null,
            ]);
            const adrStrength = avgN(adrs.map(x => x.pct));

            const weightedAvg = (pairs) => {
                const xs = (pairs || [])
                    .filter(p => p && typeof p.v === 'number' && Number.isFinite(p.v) && typeof p.w === 'number' && Number.isFinite(p.w) && p.w > 0);
                const wSum = xs.reduce((s, p) => s + p.w, 0);
                if (!(wSum > 0)) return null;
                const v = xs.reduce((acc, p) => acc + p.v * p.w, 0) / wSum;
                return Number.isFinite(v) ? v : null;
            };
            const pulse = weightedAvg([
                { v: fxStrength, w: 0.34 },
                { v: eqStrength, w: 0.28 },
                { v: ratesStrength, w: 0.18 },
                { v: adrStrength, w: 0.14 },
                { v: riskStrength, w: 0.06 },
            ]);

            let state = '—';
            if (typeof pulse === 'number' && Number.isFinite(pulse)) {
                if (pulse > 0.25) state = 'BR forte (fluxo pró-risco)';
                else if (pulse < -0.25) state = 'Stress / USD forte';
                else state = 'Misto / neutro';
            }

            const cov = (() => {
                if (!dc || typeof dc.computeCoverage !== 'function') return null;
                const staleMs = 6 * 60 * 60 * 1000;
                const syms = Array.from(new Set([
                    sym.usdbrl,
                    sym.ibov,
                    sym.win,
                    sym.ewz,
                    sym.br10y,
                    sym.cds,
                ].filter(Boolean).map(s => String(s))));
                if (!syms.length) return null;
                return dc.computeCoverage(dcDeps, data, syms, { staleMs });
            })();

            if (metricsEl) {
                const pulseBadge = toneBadgeHtml(pulse, state, { maxAbs: 1.2 });
                const br10Txt = typeof br10Bp10 === 'number' && Number.isFinite(br10Bp10) ? `${br10Bp10 > 0 ? '+' : ''}${formatNumber(br10Bp10 * 10, 1)}bp` : '—';
                const di1Txt = typeof di1Bp10 === 'number' && Number.isFinite(di1Bp10) ? `${di1Bp10 > 0 ? '+' : ''}${formatNumber(di1Bp10 * 10, 1)}bp` : '—';
                const adrTxt = adrStrength === null ? '—' : formatPercent(adrStrength, 2);
                const riskTxt = riskStrength === null ? '—' : formatPercent(riskStrength, 2);

                metricsEl.innerHTML = `
                <div class="metric-card">
                    <div class="metric-icon">🇧🇷</div>
                    <div class="metric-value">${pulse === null ? '—' : formatPercent(pulse, 2)}</div>
                    <div class="metric-label">Brasil Pulse</div>
                    <div class="metric-change neutral">${pulseBadge}</div>
                    ${cov ? `<div style="margin-top:6px;opacity:.75;font-size:12px;font-family:'Share Tech Mono',monospace;font-weight:900;">Cobertura ${escapeHtml(String(cov.counts.withChange))}/${escapeHtml(String(cov.counts.expected))} • Fresh ${escapeHtml(formatNumber(cov.ratios.freshness * 100, 0))}%</div>` : ''}
                </div>
                <div class="metric-card">
                    <div class="metric-icon">💱</div>
                    <div class="metric-value">${fxStrength === null ? '—' : formatPercent(fxStrength, 2)}</div>
                    <div class="metric-label">BRL (força local)</div>
                    <div class="metric-change neutral">${escapeHtml(sym.usdbrl || '—')}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">📉</div>
                    <div class="metric-value">${ratesStrength === null ? '—' : formatPercent(ratesStrength, 2)}</div>
                    <div class="metric-label">Juros (Δbp)</div>
                    <div class="metric-change neutral">BR10Y ${escapeHtml(br10Txt)} • DI1 ${escapeHtml(di1Txt)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">🏛️</div>
                    <div class="metric-value">${adrTxt}</div>
                    <div class="metric-label">ADR Basket</div>
                    <div class="metric-change neutral">Risco ${escapeHtml(riskTxt)}</div>
                </div>
            `;
            }

            if (pulseEl) {
                const line = (label, v, { maxAbs = 2.5, suffix = '' } = {}) => {
                    const txt = v === null ? '—' : (suffix === 'bp' ? `${v > 0 ? '+' : ''}${formatNumber(v, 1)}bp` : formatPercent(v, 2));
                    const badge = (v === null) ? toneBadgeHtml(null, txt, { maxAbs }) : toneBadgeHtml(v, txt, { maxAbs });
                    return `<div style="display:flex;justify-content:space-between;gap:12px;">
                    <div style="opacity:.92;font-weight:900;">${escapeHtml(label)}</div>
                    <div>${badge}</div>
                </div>`;
                };

                const coreLines = []
                    .concat(sym.usdbrl ? [{ label: 'USD/BRL (inv)', v: fxStrength, maxAbs: 2.5 }] : [])
                    .concat(sym.ibov ? [{ label: 'Ibovespa', v: ibovPct, maxAbs: 2.5 }] : [])
                    .concat(sym.win ? [{ label: 'WIN (futuro)', v: winPct, maxAbs: 2.5 }] : [])
                    .concat(sym.br10y ? [{ label: 'BR10Y (Δbp)', v: (typeof br10Bp10 === 'number' ? br10Bp10 * 10 : null), maxAbs: 45, suffix: 'bp' }] : [])
                    .concat(sym.cds ? [{ label: 'CDS BR 5Y (inv)', v: (typeof cdsPct === 'number' ? -cdsPct : null), maxAbs: 3.5 }] : []);

                const adrRank = adrs
                    .filter(x => typeof x.pct === 'number' && Number.isFinite(x.pct))
                    .slice()
                    .sort((a, b) => (b.pct || 0) - (a.pct || 0))
                    .slice(0, 6);

                const adrLines = adrRank.map(x => ({ label: `${x.k} (${x.label})`, v: x.pct, maxAbs: 3.5 }));

                const ctxLines = []
                    .concat(sym.dxy ? [{ label: 'DXY (inv)', v: (typeof dxyPct === 'number' ? -dxyPct : null), maxAbs: 3.5 }] : [])
                    .concat(sym.vix ? [{ label: 'VIX (inv)', v: (typeof vixPct === 'number' ? -vixPct : null), maxAbs: 4.5 }] : []);

                const block = (title, list) => {
                    const body = (list || []).map(x => line(x.label, x.v, { maxAbs: x.maxAbs || 2.5, suffix: x.suffix || '' })).join('');
                    if (!body) return '';
                    return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:rgba(0,0,0,.18);">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">${escapeHtml(title)}</div>
                    <div style="display:flex;flex-direction:column;gap:8px;">${body}</div>
                </div>`;
                };

                const html = [block('Core (Índices/BRL/Juros/Risco)', coreLines), block('ADRs (top)', adrLines), block('Contexto (USD/Vol)', ctxLines)]
                    .filter(Boolean)
                    .join('<div style="height:10px;"></div>');

                pulseEl.innerHTML = html || '<div style="opacity:.85;">Sem dados suficientes para montar o bloco.</div>';
            }
        }

        const allRows = assets.map(a => {
            const last = getLastPoint(data, a.symbol);
            return {
                symbol: a.symbol,
                name: a.name,
                exchange: a.exchange || '',
                category: a.category,
                tags: a.tags || [],
                last,
            };
        });

        const brazilOnly = allRows.filter(isBrazilRelated);
        if (!brazilOnly.length) {
            const container = document.getElementById(tableId);
            if (container) container.innerHTML = '<p style="opacity:.8">Sem ativos do Brasil no monitoramento.</p>';
            return;
        }

        const groupOrder = [
            'Índices & Volatilidade',
            'Índice (Futuros)',
            'Câmbio BRL',
            'Juros Brasil',
            'Risco País (CDS)',
            'ETFs Brasil',
            'B3 (Ações/ETFs)',
            'Empresas BR (ADR)',
            'Brasil (Outros)',
        ];

        const byGroup = new Map();
        for (const r of brazilOnly) {
            const g = brazilGroup(r);
            if (!byGroup.has(g)) byGroup.set(g, []);
            byGroup.get(g).push(r);
        }

        const rows = [];
        for (const g of groupOrder) {
            const list = (byGroup.get(g) || []).slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            if (!list.length) continue;
            rows.push({ separator: true, label: g });
            rows.push(...list);
        }

        const pickPreferred = (candidates) => {
            const syms = (candidates || [])
                .map(c => {
                    if (!c) return null;
                    if (typeof c === 'string') return aliasSym(c) || null;
                    if (c.aliasKey) return aliasSym(c.aliasKey) || null;
                    if (c.matcher) return pickBestByMatchers([c.matcher]) || null;
                    return null;
                })
                .filter(Boolean);
            const uniq = Array.from(new Set(syms.map(s => String(s))));
            const ok = uniq.filter(s => data.series && Array.isArray(data.series[s]) && data.series[s].length);
            ok.sort((a, b) => mostRecentMs(b) - mostRecentMs(a));
            return ok.length ? ok[0] : null;
        };

        const selected = pickPreferred([
            { aliasKey: 'IBOV' },
            { matcher: /^\.BVSP$/i },
            { matcher: /^WINc1$/i },
            { matcher: /^WDOc1$/i },
            { aliasKey: 'USD_BRL' },
            { matcher: /^USD\/BRL\b/i },
            { matcher: /^BOVA11\.SA$/i },
            { matcher: /^EWZ(\.\w+)?$/i },
            { aliasKey: 'BR10Y' },
            { matcher: /^BR10YT=RR$/i },
        ]) || (brazilOnly.find(r => data.series && Array.isArray(data.series[r.symbol]) && data.series[r.symbol].length)?.symbol || null);

        createTable(tableId, rows, data, symbol => {
            const points = data.series[symbol] || [];
            renderLineChart(chartId, points, symbol);
        }, { limit: null, sortable: true, grouped: true, tableKey: 'br', toolbar: true, favorites: true });

        if (selected) {
            const points = data.series[selected] || [];
            renderLineChart(chartId, points, selected);
        }
    }

    root.brazilMarket = { render };
    w.MercadoBlocks = root;
})();
