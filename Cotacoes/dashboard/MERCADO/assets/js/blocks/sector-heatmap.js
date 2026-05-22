(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const escapeHtml = d.escapeHtml;
        const formatPercent = d.formatPercent;
        const formatNumber = d.formatNumber;
        const toneBadgeHtml = d.toneBadgeHtml;
        const toneFromValue = d.toneFromValue;
        const getChangePct = d.getChangePct;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const symbolKey = d.symbolKey;
        const renderAllAssetsTable = d.renderAllAssetsTable;

        const dc = (typeof w !== 'undefined' && w.DecisionCore) ? w.DecisionCore : null;
        const dcDeps = { findAliasSymbolBest, findAliasSymbol, findAssetSymbol, getLastPoint };
        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const mostRecentMs = (symbol) => {
            if (!symbol) return -Infinity;
            const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || (typeof getLastPoint === 'function' ? getLastPoint(data, symbol) : null);
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
        const aliasSym = (k) => (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, k) : null) || (typeof findAliasSymbol === 'function' ? findAliasSymbol(data, k) : null);

        const defs = [
            { code: 'XLF', name: 'Financeiro', profile: 'cíclico / value', matchers: [/^XLF(\.\w+)?$/i, /\bFinancial\s*Select\s*Sector\b/i] },
            { code: 'XLK', name: 'Tecnologia', profile: 'growth', matchers: [/^XLK(\.\w+)?$/i, /\bTechnology\s*Select\s*Sector\b/i] },
            { code: 'XLE', name: 'Energia', profile: 'cíclico', matchers: [/^XLE(\.\w+)?$/i, /\bEnergy\s*Select\s*Sector\b/i] },
            { code: 'XLV', name: 'Saúde', profile: 'defensivo', matchers: [/^XLV(\.\w+)?$/i, /\bHealth\s*Care\s*Select\s*Sector\b/i] },
            { code: 'XLY', name: 'Consumo discricionário', profile: 'cíclico', matchers: [/^XLY(\.\w+)?$/i, /\bConsumer\s*Discretionary\s*Select\s*Sector\b/i] },
            { code: 'XLI', name: 'Industriais', profile: 'cíclico', matchers: [/^XLI(\.\w+)?$/i, /\bIndustrial\s*Select\s*Sector\b/i] },
            { code: 'XLP', name: 'Consumo básico', profile: 'defensivo', matchers: [/^XLP(\.\w+)?$/i, /\bConsumer\s*Staples\s*Select\s*Sector\b/i] },
            { code: 'XLU', name: 'Utilities', profile: 'defensivo', matchers: [/^XLU(\.\w+)?$/i, /\bUtilities\s*Select\s*Sector\b/i] },
            { code: 'XLB', name: 'Materiais', profile: 'cíclico', matchers: [/^XLB(\.\w+)?$/i, /\bMaterials\s*Select\s*Sector\b/i] },
            { code: 'XLC', name: 'Comunicação', profile: 'growth / defensivo', matchers: [/^XLC(\.\w+)?$/i, /\bCommunication\s*Services\s*Select\s*Sector\b/i] },
            { code: 'XLRE', name: 'Imobiliário', profile: 'sensível a juros', matchers: [/^XLRE(\.\w+)?$/i, /\bReal\s*Estate\s*Select\s*Sector\b/i] },

            { code: 'SMH', name: 'Semiconductors', profile: 'growth / beta', matchers: [/^SMH(\.\w+)?$/i, /\bSemiconductor\b/i] },
            { code: 'SOXX', name: 'Semiconductors', profile: 'growth / beta', matchers: [/^SOXX(\.\w+)?$/i] },
            { code: 'XBI', name: 'Biotech', profile: 'risk / beta', matchers: [/^XBI(\.\w+)?$/i, /\bBiotech\b/i] },
            { code: 'KRE', name: 'Bancos regionais', profile: 'value / rates', matchers: [/^KRE(\.\w+)?$/i, /\bRegional\s*Banks\b/i] },
            { code: 'IYT', name: 'Transportes', profile: 'cíclico', matchers: [/^IYT(\.\w+)?$/i, /\bTransportation\b/i] },
            { code: 'XHB', name: 'Homebuilders', profile: 'sensível a juros', matchers: [/^XHB(\.\w+)?$/i, /\bHome\s*Builders\b/i] },
            { code: 'XOP', name: 'Oil & Gas (E&P)', profile: 'cíclico', matchers: [/^XOP(\.\w+)?$/i] },
            { code: 'XME', name: 'Metals & Mining', profile: 'cíclico', matchers: [/^XME(\.\w+)?$/i, /\bMetals\b.*\bMining\b/i] },
        ];

        const resolved = defs
            .map(s => {
                const sym = aliasSym(s.code) || pickBestByMatchers(s.matchers) || null;
                return { ...s, symbol: sym };
            })
            .filter(s => s.symbol);

        const sectors = (() => {
            const core = new Set(['XLF', 'XLK', 'XLE', 'XLV', 'XLY', 'XLI', 'XLP', 'XLU', 'XLB', 'XLC', 'XLRE']);
            const out = [];
            const used = new Set();
            for (const s of resolved) {
                if (core.has(s.code)) {
                    const k = (typeof symbolKey === 'function' ? symbolKey(s.symbol) : s.symbol) || s.symbol;
                    if (used.has(k)) continue;
                    used.add(k);
                    out.push(s);
                }
            }
            const extras = [];
            for (const s of resolved) {
                if (core.has(s.code)) continue;
                const k = (typeof symbolKey === 'function' ? symbolKey(s.symbol) : s.symbol) || s.symbol;
                if (used.has(k)) continue;
                used.add(k);
                extras.push(s);
            }
            extras.sort((a, b) => String(a.code).localeCompare(String(b.code)));
            return out.concat(extras.slice(0, 6));
        })();

        if (!sectors.length) {
            el.innerHTML = '<p style="opacity:.85">Setoriais não encontrados no monitoramento.</p>';
            return;
        }

        const staleMs = 4 * 60 * 60 * 1000;
        const ageOf = (symbol) => {
            if (!symbol) return null;
            if (dc && typeof dc.symbolAgeMs === 'function') {
                const age = dc.symbolAgeMs(dcDeps, data, symbol);
                return typeof age === 'number' && Number.isFinite(age) ? age : null;
            }
            const ms = mostRecentMs(symbol);
            if (!Number.isFinite(ms) || ms <= 0) return null;
            const age = Date.now() - ms;
            return Number.isFinite(age) ? age : null;
        };

        const calc = sectors.map(s => {
            const pct = typeof getChangePct === 'function' ? getChangePct(data, s.symbol) : null;
            const val = typeof pct === 'number' && Number.isFinite(pct) ? pct : null;
            const ageMs = ageOf(s.symbol);
            const stale = typeof ageMs === 'number' && Number.isFinite(ageMs) ? ageMs > staleMs : false;
            return { ...s, pct: val, ageMs, stale };
        });

        const absVals = calc.map(s => Math.abs(s.pct || 0)).filter(v => typeof v === 'number' && Number.isFinite(v) && v > 0);
        const maxAbs = (() => {
            if (!absVals.length) return 3;
            const sorted = absVals.slice().sort((a, b) => a - b);
            const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9)));
            const p90 = sorted[idx];
            const v = Math.max(1.6, Math.min(4.2, p90 * 1.25));
            return Number.isFinite(v) ? v : 3;
        })();

        const toneCardStyleFromValue = (pct) => {
            if (pct === null || pct === undefined || !Number.isFinite(pct)) {
                return 'border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);box-shadow:none;';
            }
            const t = typeof toneFromValue === 'function' ? toneFromValue(pct, { maxAbs }) : { tone: 'tone--neu', a: 0.25 };
            const rgb = t.tone === 'tone--pos' ? '0,255,140' : t.tone === 'tone--neg' ? '255,60,80' : '255,255,255';
            if (t.tone === 'tone--neu') {
                return 'border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);box-shadow:none;';
            }
            return `--tone-a:${String(t.a)};border:1px solid rgba(${rgb},var(--tone-a, .35));background:linear-gradient(135deg, rgba(${rgb}, calc(var(--tone-a, .25) * .30)), rgba(0,0,0,.22));box-shadow:0 0 calc(28px * var(--tone-a, .25)) rgba(${rgb}, calc(var(--tone-a, .25) * .55));`;
        };

        const ranked = calc.filter(s => typeof s.pct === 'number' && Number.isFinite(s.pct)).slice().sort((a, b) => (b.pct || 0) - (a.pct || 0));
        const top = ranked.slice(0, 3);
        const bottom = ranked.slice(-3).slice().reverse();
        const defensiveSet = new Set(['XLU', 'XLP', 'XLV', 'XLRE']);
        const cyclicalSet = new Set(['XLY', 'XLI', 'XLB', 'XLE', 'XLF']);
        const growthSet = new Set(['XLK', 'XLC', 'SMH', 'SOXX', 'XBI']);
        const valueSet = new Set(['XLF', 'KRE', 'XLE', 'XLI', 'XLB', 'IYT', 'XME']);
        const ratesSensitiveSet = new Set(['XLRE', 'XLU', 'XHB']);

        const countIn = (list, set) => list.reduce((acc, x) => acc + (set.has(x.code) ? 1 : 0), 0);
        const topDef = countIn(top, defensiveSet);
        const topCyc = countIn(top, cyclicalSet);
        const topGrowth = countIn(top, growthSet);
        const topValue = countIn(top, valueSet);
        const topRates = countIn(top, ratesSensitiveSet);
        const lead = top.length ? top[0] : null;
        const leadTxt = lead && typeof formatPercent === 'function' ? `${lead.code} ${formatPercent(lead.pct, 2)} (${lead.name})` : '—';
        const tail = bottom.length ? bottom[0] : null;
        const tailTxt = tail && typeof formatPercent === 'function' ? `${tail.code} ${formatPercent(tail.pct, 2)} (${tail.name})` : '—';

        let bias = 'Neutro';
        let biasWhy = 'Sem dominância clara entre defensivos e cíclicos no topo.';
        if (topDef >= 2) {
            bias = 'Viés risk-off';
            biasWhy = 'Defensivos liderando (típico de busca por proteção).';
        } else if (topCyc >= 2) {
            bias = 'Viés risk-on';
            biasWhy = 'Cíclicos liderando (típico de apetite ao risco).';
        } else if (topGrowth >= 2) {
            bias = 'Risk-on (growth-led)';
            biasWhy = 'Growth liderando (tech/comms/semis) sugere rotação pró-beta.';
        } else if (topValue >= 2) {
            bias = 'Rotação para value';
            biasWhy = 'Value/cíclicos “hard” liderando (finance/energia/industriais).';
        } else if (topRates >= 2) {
            bias = 'Rotação sensível a juros';
            biasWhy = 'Setores “duration” (real estate/utilities/homebuilders) dominando.';
        } else if (lead && (lead.code === 'XLK' || lead.code === 'SMH' || lead.code === 'SOXX')) {
            bias = 'Risk-on (growth-led)';
            biasWhy = 'Tech/semis liderando sugere rotação para growth.';
        } else if (lead && (lead.code === 'XLF' || lead.code === 'KRE')) {
            bias = 'Rotação para value';
            biasWhy = 'Financeiro/bancos na liderança costuma indicar rotação para value (checar yields).';
        }

        const biasPct = lead && typeof lead.pct === 'number' ? lead.pct : null;
        const biasBadge = (biasPct === null || typeof toneBadgeHtml !== 'function')
            ? escapeHtml('—')
            : toneBadgeHtml(biasPct, bias, { maxAbs });

        const macroLine = (() => {
            const vixSym = (typeof findAliasSymbolBest === 'function' ? (findAliasSymbolBest(data, 'VIX9D') || findAliasSymbolBest(data, 'VIX30') || findAliasSymbolBest(data, 'VIX')) : null) || pickBestByMatchers([/^\.?VIX(9D)?$/i, /^VIX$/i]) || null;
            const dxySym = (typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'DXY') : null) || pickBestByMatchers([/(^\.DXY$|\bDXY\b|US Dollar Index|\bUSDX\b|Dollar Index|Índice\s*Dólar|Indice\s*Dolar)/i]) || null;
            const us10Sym = (w.InstrumentsCatalog && typeof w.InstrumentsCatalog.resolveRatesCreditByKey === 'function')
                ? w.InstrumentsCatalog.resolveRatesCreditByKey({ findAliasSymbolBest, findAliasSymbol, findAssetSymbol, dcDeps }, data, 'US_10Y')
                : ((typeof findAliasSymbolBest === 'function' ? findAliasSymbolBest(data, 'US10Y') : null) || pickBestByMatchers([/^US10YT=RR$/i, /^\.TNX$/i, /^\^TNX$/i]));
            const vix = vixSym ? (typeof getChangePct === 'function' ? getChangePct(data, vixSym) : null) : null;
            const dxy = dxySym ? (typeof getChangePct === 'function' ? getChangePct(data, dxySym) : null) : null;
            const us10y = (() => {
                if (!us10Sym) return null;
                const pt = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, us10Sym) : null) || (typeof getLastPoint === 'function' ? getLastPoint(data, us10Sym) : null);
                const chg = pt && typeof pt.change === 'number' && Number.isFinite(pt.change) ? pt.change : null;
                if (typeof chg === 'number' && Number.isFinite(chg)) return (chg * 100) / 10;
                return null;
            })();
            const parts = [];
            if (typeof us10y === 'number' && Number.isFinite(us10y) && typeof formatNumber === 'function') parts.push(`US10Y Δ ${us10y > 0 ? '+' : ''}${formatNumber(us10y, 2)} (proxy)`);
            if (typeof dxy === 'number' && Number.isFinite(dxy) && typeof formatPercent === 'function') parts.push(`DXY ${formatPercent(dxy, 2)}`);
            if (typeof vix === 'number' && Number.isFinite(vix) && typeof formatPercent === 'function') parts.push(`VIX ${formatPercent(vix, 2)}`);
            return parts.length ? `Macro: ${parts.join(' • ')}` : '';
        })();

        const heatCoverage = (() => {
            if (!dc || typeof dc.computeCoverage !== 'function') return null;
            const syms = calc.map(x => x && x.symbol ? String(x.symbol) : '').filter(Boolean);
            if (!syms.length) return null;
            return dc.computeCoverage(dcDeps, data, syms, { staleMs });
        })();

        const chips = top
            .map(x => `<span style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);border-radius:999px;padding:6px 10px;">
                <span style="font-weight:900;letter-spacing:1px;">${escapeHtml(x.code)}</span>
                <span style="font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(formatPercent(x.pct, 2))}</span>
            </span>`)
            .join('');

        const summary = `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Resumo do dia</div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${biasBadge}</div>
                </div>
                ${heatCoverage ? `<div style="margin-top:6px;opacity:.75;font-size:12px;line-height:1.35;font-family:'Share Tech Mono',monospace;font-weight:900;">
                    Cobertura ${escapeHtml(String(heatCoverage.counts.withChange))}/${escapeHtml(String(heatCoverage.counts.expected))} • Fresh ${escapeHtml(formatNumber(heatCoverage.ratios.freshness * 100, 0))}%
                </div>` : ''}
                <div style="margin-top:8px;opacity:.92;line-height:1.4;">
                    <div><b>Líder</b>: ${escapeHtml(leadTxt)} • <b>Pior</b>: ${escapeHtml(tailTxt)}</div>
                    <div style="margin-top:6px;"><b>Interpretação</b>: ${escapeHtml(biasWhy)}</div>
                    ${macroLine ? `<div style="margin-top:6px;opacity:.9;">${escapeHtml(macroLine)}</div>` : ''}
                </div>
                ${chips ? `<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;">${chips}</div>` : ''}
            </div>
        `;

        const cells = calc
            .map(s => {
                const val = typeof s.pct === 'number' && Number.isFinite(s.pct) ? s.pct : null;
                const txt = val === null || typeof formatPercent !== 'function' ? '—' : formatPercent(val, 2);
                const badge = val === null || typeof toneBadgeHtml !== 'function' ? escapeHtml(txt) : toneBadgeHtml(val, txt, { maxAbs });
                const style = toneCardStyleFromValue(val);
                const title = `${s.name} (${s.code}) • ${s.profile}`;
                const subtitle = `${s.name} • ${s.profile}${s.stale ? ' • stale' : ''}`;
                return `<div data-sector="${escapeHtml(s.symbol)}" title="${escapeHtml(title)}" style="${style}border-radius:14px;padding:12px;cursor:pointer;">
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
                        <div style="font-weight:900;letter-spacing:1px;">${escapeHtml(s.code)}</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${badge}</div>
                    </div>
                    <div style="opacity:.85;font-size:12px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(subtitle)}</div>
                </div>`;
            })
            .join('');

        el.innerHTML = `${summary}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">${cells}</div>`;

        el.querySelectorAll('[data-sector]').forEach(node => {
            node.addEventListener('click', () => {
                const symbol = node.getAttribute('data-sector') || '';
                if (!symbol) return;
                try {
                    localStorage.setItem('mercado_table_q:all', typeof symbolKey === 'function' ? symbolKey(symbol) : symbol);
                    localStorage.setItem('mercado_table_mode:all', 'all');
                } catch {
                }
                if (typeof renderAllAssetsTable === 'function') renderAllAssetsTable(data);
                location.hash = '#all-assets';
            });
        });
    }

    root.sectorHeatmap = { render };
    w.MercadoBlocks = root;
})();

