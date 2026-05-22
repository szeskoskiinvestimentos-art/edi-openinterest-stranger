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
        const formatDateTime = d.formatDateTime;
        const badge = d.badge;
        const pointPct = d.pointPct;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const computeOperationalPulseNow = d.computeOperationalPulseNow;
        const computeHk50PulseNow = d.computeHk50PulseNow;
        const assetAliasMatchers = d.assetAliasMatchers;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const getLastPoint = d.getLastPoint;

        const isNum = v => typeof v === 'number' && Number.isFinite(v);
        const assets = Array.isArray(data && data.assets) ? data.assets : [];
        const series = data && data.series ? data.series : {};
        const generatedAt = data && data.meta && data.meta.generatedAt ? String(data.meta.generatedAt) : '';
        const portfolioStats = data && data.meta && data.meta.portfolioStats ? data.meta.portfolioStats : null;
        const catalog = w.InstrumentsCatalog ? w.InstrumentsCatalog : null;
        const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
        const catDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps };

        const safeEscape = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s));
        const safeFormatNumber = (v, dec) => (typeof formatNumber === 'function' ? formatNumber(v, dec) : (typeof v === 'number' ? String(v) : '—'));
        const safeFormatPercent = (v, dec) => (typeof formatPercent === 'function' ? formatPercent(v, dec) : (typeof v === 'number' ? String(v) : '—'));
        const safeFormatDateTime = t => (typeof formatDateTime === 'function' ? formatDateTime(t) : String(t || '—'));
        const safeBadge = (tone, text) => (typeof badge === 'function' ? badge(tone, text) : `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.18);font-weight:900;letter-spacing:.6px;opacity:.9;">${safeEscape(text)}</span>`);

        const getBestPoint = sym => {
            if (typeof getMostRecentPointWithPrice === 'function') return getMostRecentPointWithPrice(data, sym);
            if (typeof getLastPoint === 'function') return getLastPoint(data, sym);
            return null;
        };
        const getAnyPoint = sym => {
            const xs = Array.isArray(series[sym]) ? series[sym] : [];
            return xs.length ? xs[xs.length - 1] : null;
        };

        const categories = Array.from(new Set(assets.map(a => String(a && a.category ? a.category : '')).filter(Boolean))).sort((a, b) =>
            a.localeCompare(b, 'pt-BR'),
        );

        const calcPct = best => {
            if (typeof pointPct === 'function') return pointPct(best);
            if (best && isNum(best.extendedChangePct)) return best.extendedChangePct;
            if (best && isNum(best.changePct)) return best.changePct;
            return null;
        };

        const rowsAll = assets
            .map(a => {
                const symbol = String(a && a.symbol ? a.symbol : '');
                const name = String(a && a.name ? a.name : '');
                const category = String(a && a.category ? a.category : '');
                const exchange = a && a.exchange ? String(a.exchange) : '';
                const tags = Array.isArray(a && a.tags) ? a.tags.map(x => String(x)) : [];
                const xs = Array.isArray(series[symbol]) ? series[symbol] : [];
                const best = getBestPoint(symbol);
                const any = getAnyPoint(symbol);
                const lastT = best && best.t ? best.t : any && any.t ? any.t : null;
                const lastPrice = best && isNum(best.price) ? best.price : null;
                const lastChangePct = calcPct(best);
                const lastExtChangePct = best && isNum(best.extendedChangePct) ? best.extendedChangePct : null;
                return {
                    symbol,
                    name,
                    category,
                    exchange,
                    tags,
                    points: xs.length,
                    lastT,
                    lastPrice,
                    lastChangePct,
                    lastExtChangePct,
                    hasSeries: xs.length > 0,
                    hasPrice: lastPrice !== null,
                };
            })
            .sort((a, b) => a.symbol.localeCompare(b.symbol, 'en'));

        const counts = {
            assets: rowsAll.length,
            withSeries: rowsAll.filter(r => r.hasSeries).length,
            withPrice: rowsAll.filter(r => r.hasPrice).length,
            noSeries: rowsAll.filter(r => !r.hasSeries).length,
            noPrice: rowsAll.filter(r => r.hasSeries && !r.hasPrice).length,
        };

        const ratesCreditSummary = (() => {
            if (!catalog) return { baseResolved: [], extras: [], extrasSymbols: [] };
            const defs = typeof catalog.listRatesCredit === 'function' ? catalog.listRatesCredit() : [];
            const baseResolved = typeof catalog.buildResolved === 'function'
                ? defs.map(def => catalog.buildResolved(catDeps, data, def)).filter(Boolean)
                : [];
            const baseSymbols = new Set(baseResolved.map(x => String(x && x.symbol ? x.symbol : '')).filter(Boolean));
            const discovered = typeof catalog.discoverRatesCredit === 'function'
                ? catalog.discoverRatesCredit(data, { max: 80 })
                : [];
            const extras = (discovered || []).filter(x => x && x.symbol && !baseSymbols.has(String(x.symbol)));
            const extrasSymbols = extras.map(x => String(x.symbol));
            return { baseResolved, extras, extrasSymbols };
        })();

        const mkCategoryCounts = () => {
            const map = new Map();
            for (const r of rowsAll) {
                const k = r.category || '—';
                map.set(k, (map.get(k) || 0) + 1);
            }
            return Array.from(map.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([k, v]) => safeBadge('neutral', `${k}: ${v}`))
                .join(' ');
        };

        const storageKey = 'edi_market_assets_catalog_v1';
        const prev = (() => {
            try {
                const raw = localStorage.getItem(storageKey);
                if (!raw) return null;
                const obj = JSON.parse(raw);
                if (!obj || typeof obj !== 'object') return null;
                const syms = Array.isArray(obj.symbols) ? obj.symbols.map(x => String(x)) : [];
                return { symbols: new Set(syms), at: obj.at ? String(obj.at) : '' };
            } catch {
                return null;
            }
        })();
        const curSymbols = new Set(rowsAll.map(r => r.symbol));
        const delta = (() => {
            if (!prev) return { added: [], removed: [], at: '' };
            const added = [];
            const removed = [];
            for (const s of curSymbols) if (!prev.symbols.has(s)) added.push(s);
            for (const s of prev.symbols) if (!curSymbols.has(s)) removed.push(s);
            return { added: added.sort(), removed: removed.sort(), at: prev.at };
        })();
        try {
            localStorage.setItem(storageKey, JSON.stringify({ at: generatedAt || new Date().toISOString(), symbols: Array.from(curSymbols).sort() }));
        } catch {
        }

        const pulseNow = typeof computeOperationalPulseNow === 'function' ? computeOperationalPulseNow(data) : null;
        const hkNow = typeof computeHk50PulseNow === 'function' ? computeHk50PulseNow(data, null) : null;
        const mapping = (() => {
            const a = pulseNow && pulseNow.sym ? pulseNow.sym : {};
            const b = hkNow && hkNow.sym ? hkNow.sym : {};
            const extras = {
                usdCnh: b.usdCnh || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'USD_CNH') : null) || null,
                usdCny: b.usdCny || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'USD_CNY') : null) || null,
                usdHkd: (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'USD_HKD') : null) || null,
                hk50: b.hk50 || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'HK50') : null) || null,
                hstech: b.hstech || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'HSTECH') : null) || null,
                hsfin: b.hsfin || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'HSI_FIN') : null) || null,
                ewh: b.ewh || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'EWH') : null) || null,
                ndx: b.ndx || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'NDX') : null) || null,
                vhsi: b.vhsi || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'VHSI') : null) || null,
                hk1m: b.hk1m || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'HK1M') : null) || null,
                hk3m: b.hk3m || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'HK3M') : null) || null,
                us10hk10: b.us10hk10 || (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'SPREAD_HK10Y') : null) || null,
                mchi: (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'MCHI') : null) || null,
                audusd: (typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /^AUD\/USD\b/i) : null) || null,
                cdsCn5y: (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'CDS_CN5Y') : null) || null,
            };
            return { ...a, ...b, ...extras };
        })();
        const bySymbol = (() => {
            const m = new Map();
            for (const r of rowsAll) m.set(r.symbol, r);
            return m;
        })();
        const candidatesFor = aliasKey => {
            const matchers = typeof assetAliasMatchers === 'function' ? assetAliasMatchers(aliasKey) : [];
            const out = [];
            const seen = new Set();
            for (const re of matchers) {
                if (!(re instanceof RegExp)) continue;
                for (const r of rowsAll) {
                    const sym = String(r.symbol || '');
                    const name = String(r.name || '');
                    if (!sym || seen.has(sym)) continue;
                    if (re.test(sym) || re.test(name)) {
                        out.push(sym);
                        seen.add(sym);
                        if (out.length >= 6) return out;
                    }
                }
            }
            return out;
        };
        const mappingRow = (label, key, aliasKey) => {
            const val = mapping && mapping[key] ? String(mapping[key]) : '—';
            const meta = val && val !== '—' ? bySymbol.get(val) : null;
            const metaLine = meta ? `${String(meta.name || '—')} • ${String(meta.category || '—')} • ${String(meta.exchange || '—')}` : '';
            const cands = aliasKey ? candidatesFor(aliasKey).filter(s => s !== val) : [];
            const candLine = cands.length ? `candidatos: ${cands.slice(0, 4).join(', ')}${cands.length > 4 ? `… +${cands.length - 4}` : ''}` : '';
            return `<tr>
            <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:900;opacity:.92;">${safeEscape(label)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);">
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${safeEscape(val)}</div>
                ${metaLine ? `<div style="opacity:.72;font-size:12px;margin-top:2px;line-height:1.25;">${safeEscape(metaLine)}</div>` : ''}
                ${candLine ? `<div style="opacity:.72;font-size:12px;margin-top:2px;line-height:1.25;">${safeEscape(candLine)}</div>` : ''}
            </td>
        </tr>`;
        };

        const renderTable = () => {
            const qEl = document.getElementById('assetsCatalogQuery');
            const cEl = document.getElementById('assetsCatalogCategory');
            const onlyEl = document.getElementById('assetsCatalogOnly');
            const sortEl = document.getElementById('assetsCatalogSort');
            const q = qEl ? String(qEl.value || '').trim().toLowerCase() : '';
            const cat = cEl ? String(cEl.value || '') : '';
            const only = onlyEl ? String(onlyEl.value || 'all') : 'all';
            const sort = sortEl ? String(sortEl.value || 'symbol') : 'symbol';

            let rows = rowsAll.slice();
            if (cat) rows = rows.filter(r => r.category === cat);
            if (only === 'no_price') rows = rows.filter(r => r.hasSeries && !r.hasPrice);
            if (only === 'no_series') rows = rows.filter(r => !r.hasSeries);
            if (q) {
                rows = rows.filter(r => {
                    const hay = `${r.symbol} ${r.name} ${r.category} ${r.exchange} ${(r.tags || []).join(' ')}`.toLowerCase();
                    return hay.includes(q);
                });
            }

            const ms = t => {
                const x = t ? Date.parse(t) : NaN;
                return Number.isFinite(x) ? x : -Infinity;
            };
            if (sort === 'last') rows.sort((a, b) => ms(b.lastT) - ms(a.lastT));
            if (sort === 'pct') rows.sort((a, b) => (isNum(b.lastChangePct) ? b.lastChangePct : -Infinity) - (isNum(a.lastChangePct) ? a.lastChangePct : -Infinity));
            if (sort === 'points') rows.sort((a, b) => b.points - a.points);
            if (sort === 'symbol') rows.sort((a, b) => a.symbol.localeCompare(b.symbol, 'en'));

            const tbody = rows
                .slice(0, 240)
                .map(r => {
                    const t = r.lastT ? safeFormatDateTime(r.lastT) : '—';
                    const pct = isNum(r.lastChangePct) ? safeFormatPercent(r.lastChangePct, 2) : '—';
                    const ext = isNum(r.lastExtChangePct) ? safeFormatPercent(r.lastExtChangePct, 2) : '—';
                    const price = isNum(r.lastPrice) ? safeFormatNumber(r.lastPrice, 6) : '—';
                    const seriesTxt = r.hasSeries ? safeEscape(String(r.points)) : '—';
                    const tone = r.hasPrice ? 'neutral' : r.hasSeries ? 'negative' : 'negative';
                    const symCell = safeBadge(tone, r.symbol);
                    return `<tr>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);">${symCell}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${safeEscape(r.name || '')}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.85;white-space:nowrap;">${safeEscape(r.category || '—')}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;white-space:nowrap;">${safeEscape(pct)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.75;white-space:nowrap;">${safeEscape(ext)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.92;white-space:nowrap;">${safeEscape(price)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.85;">${seriesTxt}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.88;white-space:nowrap;">${safeEscape(t)}</td>
                </tr>`;
                })
                .join('');

            const out = document.getElementById('assetsCatalogTableBody');
            if (out) out.innerHTML = tbody || '';
            const meta = document.getElementById('assetsCatalogMeta');
            if (meta) meta.innerHTML = `${safeBadge('neutral', `Exibindo: ${rows.length}`)} ${safeBadge('neutral', `Limite: ${Math.min(240, rows.length)}`)}`;
        };

        const onCopy = () => {
            const qEl = document.getElementById('assetsCatalogQuery');
            const cEl = document.getElementById('assetsCatalogCategory');
            const onlyEl = document.getElementById('assetsCatalogOnly');
            const q = qEl ? String(qEl.value || '').trim().toLowerCase() : '';
            const cat = cEl ? String(cEl.value || '') : '';
            const only = onlyEl ? String(onlyEl.value || 'all') : 'all';
            let rows = rowsAll.slice();
            if (cat) rows = rows.filter(r => r.category === cat);
            if (only === 'no_price') rows = rows.filter(r => r.hasSeries && !r.hasPrice);
            if (only === 'no_series') rows = rows.filter(r => !r.hasSeries);
            if (q) {
                rows = rows.filter(r => {
                    const hay = `${r.symbol} ${r.name} ${r.category} ${r.exchange} ${(r.tags || []).join(' ')}`.toLowerCase();
                    return hay.includes(q);
                });
            }
            const text = rows.map(r => r.symbol).join('\n');
            const fallback = () => {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', 'true');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    return true;
                } catch {
                    return false;
                }
            };
            const ok = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text).then(() => true).catch(() => fallback()) : Promise.resolve(fallback());
            ok.then(() => {
                const btn = document.getElementById('assetsCatalogCopy');
                if (!btn) return;
                const prevTxt = btn.textContent;
                btn.textContent = 'Copiado';
                setTimeout(() => {
                    btn.textContent = prevTxt || 'Copiar símbolos';
                }, 900);
            });
        };

        const onCopyRatesCreditExtras = () => {
            const text = (ratesCreditSummary.extrasSymbols || []).join('\n');
            if (!text) return;
            const fallback = () => {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', 'true');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    return true;
                } catch {
                    return false;
                }
            };
            const ok = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text).then(() => true).catch(() => fallback()) : Promise.resolve(fallback());
            ok.then(() => {
                const btn = document.getElementById('assetsCatalogCopyRatesCreditExtras');
                if (!btn) return;
                const prevTxt = btn.textContent;
                btn.textContent = 'Copiado';
                setTimeout(() => {
                    btn.textContent = prevTxt || 'Copiar rates/credit';
                }, 900);
            });
        };

        el.innerHTML = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Catálogo CSV (autoatualizável)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${safeBadge('neutral', `Ativos: ${counts.assets}`)}
                    ${safeBadge('neutral', `Com série: ${counts.withSeries}`)}
                    ${safeBadge('neutral', `Com preço: ${counts.withPrice}`)}
                    ${counts.noSeries ? safeBadge('negative', `Sem série: ${counts.noSeries}`) : safeBadge('positive', 'Sem série: 0')}
                    ${counts.noPrice ? safeBadge('negative', `Sem preço: ${counts.noPrice}`) : safeBadge('positive', 'Sem preço: 0')}
                </div>
            </div>

            ${portfolioStats ? `
                <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;opacity:.95;line-height:1.45;">
                    ${safeBadge('neutral', `CSV linhas: ${Number(portfolioStats.rowsTotal || 0)}`)}
                    ${safeBadge('neutral', `Símbolos únicos: ${Number(portfolioStats.uniqueSymbols || 0)}`)}
                    ${Number(portfolioStats.rowsMissingPrice || 0) ? safeBadge('negative', `Sem preço (linha): ${Number(portfolioStats.rowsMissingPrice || 0)}`) : safeBadge('positive', 'Sem preço (linha): 0')}
                    ${Number(portfolioStats.duplicateSymbols || 0) ? safeBadge('neutral', `Duplicados: ${Number(portfolioStats.duplicateSymbols || 0)}`) : safeBadge('neutral', 'Duplicados: 0')}
                    ${Number(portfolioStats.rowsSkippedByPriority || 0) ? safeBadge('neutral', `Ignorados (prioridade): ${Number(portfolioStats.rowsSkippedByPriority || 0)}`) : safeBadge('neutral', 'Ignorados (prioridade): 0')}
                    ${Number(portfolioStats.rowsInvalidSymbol || 0) ? safeBadge('neutral', `Símbolo inválido: ${Number(portfolioStats.rowsInvalidSymbol || 0)}`) : safeBadge('neutral', 'Símbolo inválido: 0')}
                    ${Number(portfolioStats.rowsMissingSymbolOrName || 0) ? safeBadge('neutral', `Sem símbolo/nome: ${Number(portfolioStats.rowsMissingSymbolOrName || 0)}`) : safeBadge('neutral', 'Sem símbolo/nome: 0')}
                </div>
            ` : ''}

            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;opacity:.95;line-height:1.45;">
                ${mkCategoryCounts()}
            </div>

            ${(catalog && (ratesCreditSummary.baseResolved.length || ratesCreditSummary.extras.length)) ? `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">Rates/Credit (do Investing)</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${safeBadge('neutral', `Catálogo: ${ratesCreditSummary.baseResolved.length}`)}
                            ${ratesCreditSummary.extras.length ? safeBadge('positive', `Extras: ${ratesCreditSummary.extras.length}`) : safeBadge('neutral', 'Extras: 0')}
                            ${ratesCreditSummary.extras.length ? `<button id="assetsCatalogCopyRatesCreditExtras" type="button" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:7px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.3px;cursor:pointer;">Copiar rates/credit</button>` : ''}
                        </div>
                    </div>
                    ${ratesCreditSummary.extras.length ? `
                        <div style="margin-top:8px;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;line-height:1.5;white-space:pre-wrap;">${safeEscape(ratesCreditSummary.extrasSymbols.slice(0, 60).join('  ') || '—')}${ratesCreditSummary.extrasSymbols.length > 60 ? `<span style="opacity:.75;"> …</span>` : ''}</div>
                        <div style="margin-top:6px;opacity:.78;font-size:12px;line-height:1.35;">Esses símbolos existem no CSV como rates/credit mas não estão mapeados nas chaves do catálogo. Útil para completar o monitoramento e manter unidade/semântica.</div>
                    ` : `
                        <div style="margin-top:8px;opacity:.82;font-size:12px;line-height:1.35;">Sem rates/credit extras detectados fora do catálogo (ou sem dados suficientes).</div>
                    `}
                </div>
            ` : ''}

            <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                <input id="assetsCatalogQuery" type="text" inputmode="search" autocomplete="off" placeholder="Buscar símbolo/nome/categoria..." style="flex:1;min-width:220px;background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;" />
                <select id="assetsCatalogCategory" style="background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;">
                    <option value="">Todas categorias</option>
                    ${categories.map(c => `<option value="${safeEscape(c)}">${safeEscape(c)}</option>`).join('')}
                </select>
                <select id="assetsCatalogOnly" style="background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;">
                    <option value="all">Tudo</option>
                    <option value="no_price">Somente sem preço</option>
                    <option value="no_series">Somente sem série</option>
                </select>
                <select id="assetsCatalogSort" style="background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);padding:8px 10px;border-radius:10px;font-weight:900;">
                    <option value="symbol">Ordenar: símbolo</option>
                    <option value="last">Ordenar: atualização</option>
                    <option value="pct">Ordenar: variação</option>
                    <option value="points">Ordenar: pontos</option>
                </select>
                <button id="assetsCatalogCopy" type="button" style="border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;background:#151515;color:#e0e0e0;font-weight:900;letter-spacing:.4px;cursor:pointer;">Copiar símbolos</button>
            </div>

            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <div id="assetsCatalogMeta"></div>
                ${delta.added.length ? safeBadge('positive', `Novos: ${delta.added.length}`) : safeBadge('neutral', 'Novos: 0')}
                ${delta.removed.length ? safeBadge('negative', `Removidos: ${delta.removed.length}`) : safeBadge('neutral', 'Removidos: 0')}
                ${delta.at ? safeBadge('neutral', `Última base: ${safeFormatDateTime(delta.at)}`) : safeBadge('neutral', 'Última base: —')}
            </div>

            ${(delta.added.length || delta.removed.length) ? `
                <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.9;margin-bottom:6px;">Novos</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;line-height:1.5;white-space:pre-wrap;">${safeEscape(delta.added.slice(0, 24).join('  ') || '—')}${delta.added.length > 24 ? `<span style="opacity:.75;"> …</span>` : ''}</div>
                    </div>
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.9;margin-bottom:6px;">Removidos</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;line-height:1.5;white-space:pre-wrap;">${safeEscape(delta.removed.slice(0, 24).join('  ') || '—')}${delta.removed.length > 24 ? `<span style="opacity:.75;"> …</span>` : ''}</div>
                    </div>
                </div>
            ` : ''}

            <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;overflow:hidden;">
                <div style="overflow:auto;max-height:520px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Símbolo</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Nome</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Cat</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Δ%</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.65;">Ext%</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Preço</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Pts</th>
                                <th style="position:sticky;top:0;background:rgba(10,10,10,.98);backdrop-filter:blur(6px);padding:9px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);font-weight:900;letter-spacing:.6px;opacity:.85;">Último</th>
                            </tr>
                        </thead>
                        <tbody id="assetsCatalogTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Mapeamento (Resumo Operacional)</div>
                    <div style="overflow:auto;max-height:240px;border:1px solid rgba(255,255,255,.08);border-radius:10px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tbody>
                                ${mappingRow('WDO', 'wdo', 'WDO')}
                                ${mappingRow('WIN', 'win', 'WIN')}
                                ${mappingRow('HK50 (Hang Seng)', 'hk50', 'HK50')}
                                ${mappingRow('HSTECH', 'hstech', 'HSTECH')}
                                ${mappingRow('HSI Finance', 'hsfin', 'HSI_FIN')}
                                ${mappingRow('EWH (ETF HK)', 'ewh', 'EWH')}
                                ${mappingRow('USD/BRL', 'usdbrl', 'USD_BRL')}
                                ${mappingRow('USD/CNH', 'usdCnh', 'USD_CNH')}
                                ${mappingRow('USD/CNY', 'usdCny', 'USD_CNY')}
                                ${mappingRow('USD/HKD', 'usdHkd', 'USD_HKD')}
                                ${mappingRow('AUD/USD', 'audusd', '')}
                                ${mappingRow('IBOV', 'ibov', 'IBOV')}
                                ${mappingRow('EWZ', 'ewz', 'EWZ')}
                                ${mappingRow('DXY', 'dxy', 'DXY')}
                                ${mappingRow('VIX (usado)', 'vix', 'VIX')}
                                ${mappingRow('VIX9D', 'vix9d', 'VIX9D')}
                                ${mappingRow('VIX (clássico)', 'vix30', 'VIX30')}
                                ${mappingRow('VVIX', 'vvix', 'VVIX')}
                                ${mappingRow('VXN', 'vxn', 'VXN')}
                                ${mappingRow('VXEEM', 'vxeem', 'VXEEM')}
                                ${mappingRow('VXEWZ', 'vxewz', 'VXEWZ')}
                                ${mappingRow('VXBR', 'vxbr', 'VXBR')}
                                ${mappingRow('VHSI (vol HK)', 'vhsi', 'VHSI')}
                                ${mappingRow('BR10Y', 'br10y', 'BR10Y')}
                                ${mappingRow('CDS', 'cds', 'CDS_BR5Y')}
                                ${mappingRow('China CDS 5Y', 'cdsCn5y', 'CDS_CN5Y')}
                                ${mappingRow('SPX', 'spx', 'SPX')}
                                ${mappingRow('NDX', 'ndx', 'NDX')}
                                ${mappingRow('US10Y', 'us10y', 'US10Y')}
                                ${mappingRow('US2Y', 'us2y', 'US2Y')}
                                ${mappingRow('HK 1M', 'hk1m', 'HK1M')}
                                ${mappingRow('HK 3M', 'hk3m', 'HK3M')}
                                ${mappingRow('Spread HK10Y vs US/China 10Y', 'us10hk10', 'SPREAD_HK10Y')}
                                ${mappingRow('HYG', 'hyg', 'HYG')}
                                ${mappingRow('TLT', 'tlt', 'TLT')}
                                ${mappingRow('EEM/VWO', 'eem', 'EEM')}
                                ${mappingRow('China ETF (MCHI)', 'mchi', 'MCHI')}
                                ${mappingRow('Brent', 'brent', 'BRENT')}
                                ${mappingRow('Cobre', 'copper', 'COPPER')}
                                ${mappingRow('Ouro', 'gold', 'GOLD')}
                                ${mappingRow('Minério', 'iron', 'IRON')}
                                ${mappingRow('BTC', 'btc', 'BTC')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.16);">
                    <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:8px;">Carimbo</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${safeBadge('neutral', `Gerado: ${generatedAt ? safeFormatDateTime(generatedAt) : '—'}`)}
                        ${safeBadge('neutral', `Fonte: ${data && data.meta && data.meta.source ? String(data.meta.source) : '—'}`)}
                        ${safeBadge('neutral', `Intervalo: ${data && data.meta && data.meta.intervalMinutes ? String(data.meta.intervalMinutes) : '—'}m`)}
                        ${safeBadge('neutral', `Retenção: ${data && data.meta && data.meta.retentionDays ? String(data.meta.retentionDays) : '—'}d`)}
                    </div>
                    <div style="margin-top:10px;opacity:.86;line-height:1.45;">
                        Use este bloco como “base de dados” do CSV: ele lista tudo que existe, indica se tem série/preço e mostra o que entrou/saiu desde a última vez que você abriu o dashboard.
                    </div>
                </div>
            </div>
        </div>
    `;

        const bind = (id, evt, fn) => {
            const x = document.getElementById(id);
            if (!x) return;
            x.addEventListener(evt, fn);
        };
        bind('assetsCatalogQuery', 'input', renderTable);
        bind('assetsCatalogCategory', 'change', renderTable);
        bind('assetsCatalogOnly', 'change', renderTable);
        bind('assetsCatalogSort', 'change', renderTable);
        bind('assetsCatalogCopy', 'click', onCopy);
        bind('assetsCatalogCopyRatesCreditExtras', 'click', onCopyRatesCreditExtras);
        renderTable();
    }

    root.assetsCatalog = { render };
    w.MercadoBlocks = root;
})();
