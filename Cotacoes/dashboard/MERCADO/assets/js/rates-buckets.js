(() => {
    const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

    const render = ({ data, el, deps } = {}) => {
        if (!el) return;
        const d = data;
        if (!d) {
            el.innerHTML = '<div style="opacity:.86;font-weight:900;letter-spacing:.6px;">Sem dados.</div>';
            return;
        }

        const fmtRate = (v) => isNum(v) ? `${deps.formatNumber(v, 2)}%` : '—';
        const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
        const catalog = (typeof window !== 'undefined' && window.InstrumentsCatalog) ? window.InstrumentsCatalog : null;

        const takeBySymbol = (label, symbol, kind) => {
            const last = deps.getMostRecentPointWithPrice(d, symbol);
            const rate = last && isNum(last.price) ? last.price : null;
            const pct = last && isNum(last.changePct) ? last.changePct : null;
            const cls = pct === null ? 'neutral' : pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
            return { label, symbol, rate, pct, cls, kind: kind || 'yield' };
        };

        const buildBase = () => {
            const defs = catalog ? catalog.listRatesCredit() : [];
            const out = [];
            for (const def of defs) {
                const resolved = catalog && catalog.buildResolved ? catalog.buildResolved(deps, d, def) : null;
                if (!resolved || !resolved.symbol) continue;
                out.push(takeBySymbol(resolved.label, resolved.symbol, resolved.kind));
            }
            return out;
        };

        const discoverExtra = (current) => {
            if (!catalog || typeof catalog.discoverRatesCredit !== 'function') return [];
            const discovered = catalog.discoverRatesCredit(d, { max: 14 });
            const already = new Set((current || []).map(x => String(x && x.symbol ? x.symbol : '')).filter(Boolean));
            const keep = [];
            for (const it of discovered) {
                const sym = String(it && it.symbol ? it.symbol : '').trim();
                if (!sym || already.has(sym)) continue;
                const last = deps.getMostRecentPointWithPrice(d, sym);
                if (!last || !isNum(last.price)) continue;
                keep.push(takeBySymbol(it.label, it.symbol, it.kind));
                if (keep.length >= 14) break;
            }
            return keep;
        };

        const glBase = buildBase();
        const glAll = (() => {
            const extras = discoverExtra(glBase);
            const out = [];
            const seen = new Set();
            for (const it of [...glBase, ...extras]) {
                const sym = String(it && it.symbol ? it.symbol : '');
                if (!sym || seen.has(sym)) continue;
                seen.add(sym);
                out.push(it);
            }
            return out;
        })();

        const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;
        const seriesKeys = Object.keys((d && d.series) || {});
        const diSymbolsFromSeries = seriesKeys.filter(sym => diMatcher.test(sym));
        const diSymbolsFromAssets = (d.assets || []).map(a => String(a && a.symbol ? a.symbol : '')).filter(sym => diMatcher.test(sym));
        const diSymbolsAll = Array.from(new Set([...diSymbolsFromSeries, ...diSymbolsFromAssets]));

        const monthNum = (code) => {
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

        const diList = diSymbolsAll
            .map(symbol => {
                const last = deps.getMostRecentPointWithPrice(d, symbol);
                const rate = last && isNum(last.price) ? last.price : null;
                const chgPct = last && isNum(last.changePct) ? last.changePct : null;
                const cls = chgPct === null ? 'neutral' : chgPct > 0 ? 'positive' : chgPct < 0 ? 'negative' : 'neutral';
                const y = 2000 + Number(String(symbol).slice(-2));
                const m = monthNum(String(symbol)[3]);
                return { label: symbol, symbol, rate, chgPct, cls, year: Number.isFinite(y) ? y : null, month: m };
            })
            .filter(x => x.rate !== null && x.year !== null && x.month !== null)
            .sort((a, b) => (a.year - b.year) || (a.month - b.month));

        const bucketAvgYield = (list) => {
            const vals = (Array.isArray(list) ? list : [])
                .filter(x => x && x.kind === 'yield')
                .map(x => x.rate)
                .filter(isNum);
            return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        };

        const bucketAvgMove = (list, key) => {
            const k = String(key || '');
            const vals = (Array.isArray(list) ? list : [])
                .map(x => x && typeof x === 'object' ? x[k] : null)
                .filter(isNum);
            return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        };

        const maturityYears = (y, m) => {
            if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
            const now = new Date();
            const t = new Date(y, m - 1, 1);
            const months = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
            if (!Number.isFinite(months)) return null;
            return months / 12;
        };

        const bucketOfYears = (yrs) => yrs < 2 ? 'Curto' : yrs <= 5 ? 'Médio' : 'Longo';
        const diWithTenor = diList.map(x => ({ ...x, yrs: maturityYears(x.year, x.month) })).filter(x => isNum(x.yrs) && x.yrs > 0);
        const diShort = bucketAvgYield(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Curto'));
        const diMid = bucketAvgYield(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Médio'));
        const diLong = bucketAvgYield(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Longo'));
        const diShortMove = bucketAvgMove(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Curto'), 'chgPct');
        const diMidMove = bucketAvgMove(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Médio'), 'chgPct');
        const diLongMove = bucketAvgMove(diWithTenor.filter(x => bucketOfYears(x.yrs) === 'Longo'), 'chgPct');
        const slope = isNum(diLong) && isNum(diShort) ? diLong - diShort : null;
        const shape = slope === null ? 'N/A' : slope > 0.15 ? 'STEEPEN' : slope < -0.15 ? 'FLATTEN' : '≈';

        const glBy = (label) => glAll.find(x => String(x && x.label ? x.label : '') === String(label));
        const usShort = bucketAvgYield([glBy('US 3M'), glBy('US 6M'), glBy('US 1Y'), glBy('US 2Y')].filter(Boolean));
        const usMid = bucketAvgYield([glBy('US 5Y'), glBy('US 10Y')].filter(Boolean));
        const usLong = bucketAvgYield([glBy('US 20Y'), glBy('US 30Y')].filter(Boolean));
        const usShortMove = bucketAvgMove([glBy('US 3M'), glBy('US 6M'), glBy('US 1Y'), glBy('US 2Y')].filter(Boolean), 'pct');
        const usMidMove = bucketAvgMove([glBy('US 5Y'), glBy('US 10Y')].filter(Boolean), 'pct');
        const usLongMove = bucketAvgMove([glBy('US 20Y'), glBy('US 30Y')].filter(Boolean), 'pct');
        const usSlope = isNum(usLong) && isNum(usShort) ? usLong - usShort : null;
        const usShape = usSlope === null ? 'N/A' : usSlope > 0.15 ? 'STEEPEN' : usSlope < -0.15 ? 'FLATTEN' : '≈';

        const etfShy = glBy('ETF SHY (1–3Y)');
        const etfIef = glBy('ETF IEF (7–10Y)');
        const etfTlt = glBy('ETF TLT (20Y+)');
        const etfDurationTilt = (etfTlt && isNum(etfTlt.pct) && etfShy && isNum(etfShy.pct)) ? (etfTlt.pct - etfShy.pct) : null;

        const findGl = (label) => glAll.find(x => String(x && x.label ? x.label : '') === String(label));
        const us2y = findGl('US 2Y');
        const us5y = findGl('US 5Y');
        const us10y = findGl('US 10Y');
        const us30y = findGl('US 30Y');
        const tips10y = findGl('TIPS (10Y)');
        const de10y = findGl('DE 10Y');
        const it10y = findGl('IT 10Y');

        const spread_2s10s = (us10y && isNum(us10y.rate) && us2y && isNum(us2y.rate)) ? (us10y.rate - us2y.rate) : null;
        const spread_5s30s = (us30y && isNum(us30y.rate) && us5y && isNum(us5y.rate)) ? (us30y.rate - us5y.rate) : null;
        const breakeven10y = (us10y && isNum(us10y.rate) && tips10y && isNum(tips10y.rate)) ? (us10y.rate - tips10y.rate) : null;
        const btpBund = (it10y && isNum(it10y.rate) && de10y && isNum(de10y.rate)) ? (it10y.rate - de10y.rate) : null;

        const glCoverage = (() => {
            if (!dc) return null;
            const symbols = glAll.map(x => x.symbol).filter(Boolean);
            if (!symbols.length) return null;
            return dc.computeCoverage(deps.dcDeps, d, symbols, { staleMs: 6 * 60 * 60 * 1000 });
        })();

        const diCoverage = (() => {
            if (!dc) return null;
            const symbols = diList.map(x => x.symbol).filter(Boolean);
            if (!symbols.length) return null;
            return dc.computeCoverage(deps.dcDeps, d, symbols, { staleMs: 6 * 60 * 60 * 1000 });
        })();

        const diHeads = diList.filter(x => x.month === 1).sort((a, b) => (a.year - b.year));
        const diAnchor = diHeads.find(x => x.symbol === 'DI1F35') || (diHeads.length ? diHeads[diHeads.length - 1] : null);
        const diTopChanges = diList.filter(x => isNum(x.chgPct)).slice().sort((a, b) => Math.abs(b.chgPct) - Math.abs(a.chgPct)).slice(0, 12);

        const pill = (tone, label) => {
            const t = tone === 'positive' ? 'rgba(39, 174, 96, .20)' : tone === 'negative' ? 'rgba(231, 76, 60, .20)' : tone === 'warn' ? 'rgba(241, 196, 15, .20)' : 'rgba(255,255,255,.08)';
            const b = tone === 'positive' ? 'rgba(39, 174, 96, .35)' : tone === 'negative' ? 'rgba(231, 76, 60, .35)' : tone === 'warn' ? 'rgba(241, 196, 15, .35)' : 'rgba(255,255,255,.14)';
            return `<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid ${b};background:${t};font-weight:900;font-size:12px;letter-spacing:.4px;opacity:.95;white-space:nowrap;">${deps.escapeHtml(label)}</span>`;
        };

        const importedVsLocal = (() => {
            if (usSlope === null || slope === null) return null;
            const usDir = usSlope > 0.15 ? 1 : usSlope < -0.15 ? -1 : 0;
            const brDir = slope > 0.15 ? 1 : slope < -0.15 ? -1 : 0;
            if (usDir === 0 && brDir === 0) return { tone: 'neutral', txt: 'Stress: neutro' };
            if (usDir !== 0 && brDir !== 0 && usDir === brDir) return { tone: 'warn', txt: 'Stress: importado + local' };
            if (usDir !== 0 && brDir === 0) return { tone: 'warn', txt: 'Stress: importado' };
            if (usDir === 0 && brDir !== 0) return { tone: 'warn', txt: 'Stress: local' };
            return { tone: 'neutral', txt: 'Stress: misto' };
        })();

        const carryDiff = (() => {
            if (diShort === null || usShort === null) return null;
            return diShort - usShort;
        })();

        const renderGlobalTable = (title, list) => {
            if (!list.length) {
                return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);opacity:.9;">
                    <div style="font-weight:900;letter-spacing:1px;margin-bottom:8px;">${deps.escapeHtml(title)}</div>
                    <div style="opacity:.85;">Sem dados de juros/proxies disponíveis.</div>
                </div>`;
            }
            const meta = glCoverage
                ? `<div style="margin:-2px 0 10px;opacity:.75;font-size:12px;line-height:1.35;font-family:'Share Tech Mono',monospace;font-weight:900;">
                    Cobertura ${deps.escapeHtml(String(glCoverage.counts.withChange))}/${deps.escapeHtml(String(glCoverage.counts.expected))} • Fresh ${deps.escapeHtml(deps.formatNumber(glCoverage.ratios.freshness * 100, 0))}%
                </div>`
                : '';
            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">${deps.escapeHtml(title)}</div>
                ${meta}
                ${list.map(x => {
                    const txt = x.pct === null ? '—' : deps.formatPercent(x.pct, 2);
                    const pctHtml = x.pct === null ? deps.escapeHtml(txt) : deps.toneBadgeHtmlFromTone(x.cls, x.pct, txt, { maxAbs: 1 });
                    const valTxt = (() => {
                        if (x.rate === null) return '—';
                        if (x.kind === 'yield') return fmtRate(x.rate);
                        if (x.kind === 'bp') return `${deps.formatNumber(x.rate, 0)}bp`;
                        return deps.formatNumber(x.rate, 2);
                    })();
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;letter-spacing:1px;">${deps.escapeHtml(x.label)}</div>
                        <div style="display:flex;gap:14px;align-items:center;">
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">${deps.escapeHtml(valTxt)}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:72px;text-align:right;">${pctHtml}</div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        };

        const renderDiTable = (list, { detectedCount, limit, title } = {}) => {
            if (!list.length) {
                const det = isNum(detectedCount) ? detectedCount : 0;
                const msg = det
                    ? `DI detectado no histórico (${det} contratos), mas sem preços válidos no momento.`
                    : 'Sem DI disponível no histórico.';
                return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);opacity:.9;">
                    <div style="font-weight:900;letter-spacing:1px;margin-bottom:8px;">${deps.escapeHtml(title || 'DI (B3)')}</div>
                    <div style="opacity:.85;">${deps.escapeHtml(msg)}</div>
                </div>`;
            }
            const meta = (diCoverage && title === 'DI (B3) • Principais')
                ? `<div style="margin:-2px 0 10px;opacity:.75;font-size:12px;line-height:1.35;font-family:'Share Tech Mono',monospace;font-weight:900;">
                    Cobertura ${deps.escapeHtml(String(diCoverage.counts.withChange))}/${deps.escapeHtml(String(diCoverage.counts.expected))} • Fresh ${deps.escapeHtml(deps.formatNumber(diCoverage.ratios.freshness * 100, 0))}%
                </div>`
                : '';
            const lim = isNum(limit) ? limit : 18;
            return `<div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">${deps.escapeHtml(title || 'DI (B3)')}</div>
                ${meta}
                ${list.slice(0, lim).map(x => {
                    const dTxt = x.chgPct === null ? '—' : `${x.chgPct > 0 ? '+' : ''}${deps.formatNumber(x.chgPct, 2)}%`;
                    const dHtml = x.chgPct === null ? deps.escapeHtml(dTxt) : deps.toneBadgeHtml(x.chgPct, dTxt, { maxAbs: 1 });
                    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;letter-spacing:1px;">${deps.escapeHtml(x.label)}</div>
                        <div style="display:flex;gap:14px;align-items:center;">
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">${deps.escapeHtml(fmtRate(x.rate))}</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:72px;text-align:right;">${dHtml}</div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        };

        const summary = `
            <div style="margin:0 0 14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${deps.escapeHtml(diList.length ? 'DI Buckets' : 'BR Buckets (proxy)')}</div>
                    <div style="display:flex;gap:12px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">
                        <span>Shape: ${deps.escapeHtml(shape)}</span>
                        ${diAnchor ? `<span>Âncora: ${deps.escapeHtml(diAnchor.symbol)}</span>` : ''}
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;">
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                        <div style="opacity:.85;font-weight:800;">Curto</div>
                        <div style="font-weight:900;">${deps.escapeHtml(diShort === null ? '—' : fmtRate(diShort))}</div>
                    </div>
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                        <div style="opacity:.85;font-weight:800;">Médio</div>
                        <div style="font-weight:900;">${deps.escapeHtml(diMid === null ? '—' : fmtRate(diMid))}</div>
                    </div>
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                        <div style="opacity:.85;font-weight:800;">Longo</div>
                        <div style="font-weight:900;">${deps.escapeHtml(diLong === null ? '—' : fmtRate(diLong))}</div>
                    </div>
                </div>
                <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                    ${pill('neutral', `Slope BR ${slope === null ? '—' : `${slope > 0 ? '+' : ''}${deps.formatNumber(slope, 2)}pp`}`)}
                    ${pill('neutral', `ΔBR C/M/L ${diShortMove === null ? '—' : deps.formatPercent(diShortMove, 2)}/${diMidMove === null ? '—' : deps.formatPercent(diMidMove, 2)}/${diLongMove === null ? '—' : deps.formatPercent(diLongMove, 2)}`)}
                    ${pill('neutral', `US 2s10s ${spread_2s10s === null ? '—' : `${spread_2s10s > 0 ? '+' : ''}${deps.formatNumber(spread_2s10s, 2)}pp`}`)}
                    ${pill('neutral', `US 5s30s ${spread_5s30s === null ? '—' : `${spread_5s30s > 0 ? '+' : ''}${deps.formatNumber(spread_5s30s, 2)}pp`}`)}
                    ${pill('neutral', `ΔUS C/M/L ${usShortMove === null ? '—' : deps.formatPercent(usShortMove, 2)}/${usMidMove === null ? '—' : deps.formatPercent(usMidMove, 2)}/${usLongMove === null ? '—' : deps.formatPercent(usLongMove, 2)}`)}
                    ${pill(breakeven10y !== null && breakeven10y > 0 ? 'positive' : 'neutral', `BE 10Y ${breakeven10y === null ? '—' : `${deps.formatNumber(breakeven10y, 2)}pp`}`)}
                    ${pill(btpBund !== null && btpBund > 1.8 ? 'warn' : 'neutral', `BTP–Bund ${btpBund === null ? '—' : `${deps.formatNumber(btpBund, 2)}pp`}`)}
                    ${pill(importedVsLocal ? importedVsLocal.tone : 'neutral', importedVsLocal ? importedVsLocal.txt : 'Stress: —')}
                    ${pill(carryDiff !== null && carryDiff > 6 ? 'warn' : 'neutral', `Carry BR–US ${carryDiff === null ? '—' : `${deps.formatNumber(carryDiff, 2)}pp`}`)}
                </div>
                ${(usShort !== null || usMid !== null || usLong !== null) ? `
                    <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;opacity:.92;">
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="font-weight:900;letter-spacing:.8px;">US Buckets (proxy)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">Shape: ${deps.escapeHtml(usShape)}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;">
                            <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                                <div style="opacity:.85;font-weight:800;">Curto</div>
                                <div style="font-weight:900;">${deps.escapeHtml(usShort === null ? '—' : fmtRate(usShort))}</div>
                            </div>
                            <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                                <div style="opacity:.85;font-weight:800;">Médio</div>
                                <div style="font-weight:900;">${deps.escapeHtml(usMid === null ? '—' : fmtRate(usMid))}</div>
                            </div>
                            <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                                <div style="opacity:.85;font-weight:800;">Longo</div>
                                <div style="font-weight:900;">${deps.escapeHtml(usLong === null ? '—' : fmtRate(usLong))}</div>
                            </div>
                        </div>
                    </div>
                ` : ((etfShy && etfIef && etfTlt) ? `
                    <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;opacity:.92;">
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                            <div style="font-weight:900;letter-spacing:.8px;">Bond ETFs (proxy)</div>
                            <div style="font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.95;">Tilt: ${deps.escapeHtml(etfDurationTilt === null ? '—' : `${etfDurationTilt > 0 ? '+' : ''}${deps.formatNumber(etfDurationTilt, 2)}pp`)}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:10px;">
                            <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                                <div style="opacity:.85;font-weight:800;">SHY (curto)</div>
                                <div style="font-weight:900;">${deps.escapeHtml(etfShy.rate === null ? '—' : deps.formatNumber(etfShy.rate, 2))}</div>
                            </div>
                            <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                                <div style="opacity:.85;font-weight:800;">IEF (médio)</div>
                                <div style="font-weight:900;">${deps.escapeHtml(etfIef.rate === null ? '—' : deps.formatNumber(etfIef.rate, 2))}</div>
                            </div>
                            <div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;background:rgba(0,0,0,.22);">
                                <div style="opacity:.85;font-weight:800;">TLT (longo)</div>
                                <div style="font-weight:900;">${deps.escapeHtml(etfTlt.rate === null ? '—' : deps.formatNumber(etfTlt.rate, 2))}</div>
                            </div>
                        </div>
                    </div>
                ` : ''))}
                <div style="margin-top:10px;opacity:.86;line-height:1.35;">
                    <div style="font-weight:900;letter-spacing:1px;margin-bottom:4px;">Leitura rápida</div>
                    <div style="opacity:.9;">
                        <b>STEEPEN</b> (curva abrindo): longos acima do curto. <b>Operacional</b>: tende a piorar condições financeiras → viés mais defensivo (reduz risco, aumenta proteção). Confirme com <b>DXY</b> e <b>yields globais</b>.
                        <br><b>FLATTEN</b> (curva fechando): curto acima do longo. <b>Operacional</b>: mercado precificando aperto no curto e/ou desaceleração; se vier com <b>DXY forte</b>, costuma ser pior para emergentes; se vier com <b>DXY fraco</b>, pode ser alívio/normalização.
                        <br><b>≈</b> (estável): sem mensagem clara na inclinação. <b>Operacional</b>: use o <b>nível</b> (curto/médio/longo) e valide com o bloco <b>Regime</b>.
                    </div>
                </div>
            </div>
        `;

        el.innerHTML = `
            ${summary}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
                ${renderDiTable(diList, { detectedCount: diSymbolsAll.length, limit: 18, title: 'DI (B3) • Principais' })}
                ${renderGlobalTable('Globais (yields/ETFs)', glAll)}
            </div>
            <div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
                ${renderDiTable(diHeads, { detectedCount: diHeads.length, limit: 9999, title: 'DI Cabeças de Ano (DI1F)' })}
                ${renderDiTable(diTopChanges, { detectedCount: diList.length, limit: 12, title: 'Maiores variações (DI %)' })}
            </div>
        `;
    };

    window.RatesBucketsModule = { render };
})();

